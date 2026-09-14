from datetime import datetime

from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.db import transaction
from rest_framework import generics, permissions, status
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Bike, Booking, Homestay, OtpCode, Profile
from .notifications import send_email_otp, send_phone_otp
from .serializers import (
    BikeSerializer,
    BookingSerializer,
    HomestaySerializer,
    LoginSerializer,
    ResendOtpSerializer,
    SignupSerializer,
    UserSerializer,
    VerifyOtpSerializer,
)


# ---------------------------------------------------------------------------
# AUTH
# ---------------------------------------------------------------------------

class SignupView(APIView):
    """
    Creates an active user immediately and returns a login token.

    NOTE: email/phone OTP verification is temporarily disabled (no SMTP/
    Twilio credentials configured yet). The OtpCode model, notifications.py,
    VerifyOtpView and ResendOtpView are left in place, unused, so this can
    be re-enabled later by restoring the OTP-gated version of this view.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = SignupSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        if User.objects.filter(email=data["email"]).exists():
            return Response(
                {"email": ["An account with this email already exists."]},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if Profile.objects.filter(phone=data["phone"]).exists():
            return Response(
                {"phone": ["An account with this phone number already exists."]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        with transaction.atomic():
            user = User.objects.create_user(
                username=data["email"],
                email=data["email"],
                password=data["password"],
                first_name=data["name"].split(" ")[0],
                last_name=" ".join(data["name"].split(" ")[1:]),
            )
            Profile.objects.create(
                user=user, phone=data["phone"], email_verified=True, phone_verified=True
            )

        token, _ = Token.objects.get_or_create(user=user)
        return Response(
            {"token": token.key, "user": UserSerializer(user).data},
            status=status.HTTP_201_CREATED,
        )


class VerifyOtpView(APIView):
    """
    Verifies one OTP (email or phone). Once BOTH have been verified, the
    user account is activated and a login token is returned.

    Currently unused — SignupView doesn't gate on OTP verification while
    email/SMS sending is disabled. Kept so verification can be re-enabled
    later without rebuilding this endpoint.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = VerifyOtpSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        try:
            user = User.objects.get(id=data["user_id"])
        except User.DoesNotExist:
            return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        otp = (
            OtpCode.objects.filter(user=user, purpose=data["purpose"], verified=False)
            .order_by("-created_at")
            .first()
        )
        if not otp or otp.code != data["code"]:
            return Response({"detail": "Invalid code."}, status=status.HTTP_400_BAD_REQUEST)
        if otp.is_expired():
            return Response({"detail": "Code has expired. Please request a new one."}, status=status.HTTP_400_BAD_REQUEST)

        otp.verified = True
        otp.save(update_fields=["verified"])

        profile = user.profile
        if data["purpose"] == "email":
            profile.email_verified = True
        else:
            profile.phone_verified = True
        profile.save(update_fields=["email_verified", "phone_verified"])

        if profile.is_fully_verified():
            user.is_active = True
            user.save(update_fields=["is_active"])
            token, _ = Token.objects.get_or_create(user=user)
            return Response({"token": token.key, "user": UserSerializer(user).data})

        pending = "phone" if data["purpose"] == "email" else "email"
        return Response({"verified": data["purpose"], "pending": pending})


class ResendOtpView(APIView):
    """Unused while OTP verification is disabled — see VerifyOtpView."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = ResendOtpSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        try:
            user = User.objects.get(id=data["user_id"])
        except User.DoesNotExist:
            return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        otp = OtpCode.generate(user, data["purpose"])
        if data["purpose"] == "email":
            send_email_otp(user, otp.code)
        else:
            send_phone_otp(user.profile.phone, otp.code)

        return Response({"message": f"New code sent to your {data['purpose']}."})


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"].strip().lower()
        password = serializer.validated_data["password"]

        user = authenticate(request, username=email, password=password)
        if not user:
            return Response({"detail": "Invalid email or password."}, status=status.HTTP_401_UNAUTHORIZED)

        token, _ = Token.objects.get_or_create(user=user)
        return Response({"token": token.key, "user": UserSerializer(user).data})


class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)


# ---------------------------------------------------------------------------
# HOMESTAYS & BIKES (read-only listing/detail)
# ---------------------------------------------------------------------------

class HomestayListView(generics.ListAPIView):
    serializer_class = HomestaySerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = Homestay.objects.all()
        q = self.request.query_params.get("q", "").strip()
        sort = self.request.query_params.get("sort", "")
        if q:
            from django.db.models import Q
            qs = qs.filter(Q(name__icontains=q) | Q(location__icontains=q))
        if sort == "price_low":
            qs = qs.order_by("price_per_night")
        elif sort == "price_high":
            qs = qs.order_by("-price_per_night")
        elif sort == "rating":
            qs = qs.order_by("-rating")
        return qs


class HomestayDetailView(generics.RetrieveAPIView):
    queryset = Homestay.objects.all()
    serializer_class = HomestaySerializer
    permission_classes = [permissions.AllowAny]


class BikeListView(generics.ListAPIView):
    serializer_class = BikeSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = Bike.objects.all()
        q = self.request.query_params.get("q", "").strip()
        btype = self.request.query_params.get("type", "")
        if q:
            from django.db.models import Q
            qs = qs.filter(Q(name__icontains=q) | Q(location__icontains=q))
        if btype:
            qs = qs.filter(type=btype)
        return qs


class BikeDetailView(generics.RetrieveAPIView):
    queryset = Bike.objects.all()
    serializer_class = BikeSerializer
    permission_classes = [permissions.AllowAny]


# ---------------------------------------------------------------------------
# BOOKINGS
# ---------------------------------------------------------------------------

class BookingListCreateView(generics.ListCreateAPIView):
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Booking.objects.filter(user=self.request.user)

    def create(self, request, *args, **kwargs):
        item_type = request.data.get("item_type")
        checkin_str = request.data.get("checkin")
        checkout_str = request.data.get("checkout")

        try:
            checkin = datetime.strptime(checkin_str, "%Y-%m-%d").date()
            checkout = datetime.strptime(checkout_str, "%Y-%m-%d").date()
        except (ValueError, TypeError):
            return Response({"detail": "Invalid dates."}, status=status.HTTP_400_BAD_REQUEST)

        days_or_nights = max(1, (checkout - checkin).days)

        if item_type == "homestay":
            homestay_id = request.data.get("homestay")
            try:
                homestay = Homestay.objects.get(id=homestay_id)
            except Homestay.DoesNotExist:
                return Response({"detail": "Homestay not found."}, status=status.HTTP_404_NOT_FOUND)

            guests = int(request.data.get("guests_or_days", 1))
            rental_charge = days_or_nights * homestay.price_per_night
            security_deposit = 0
            total = rental_charge

            booking = Booking.objects.create(
                user=request.user, item_type="homestay", homestay=homestay,
                item_name=homestay.name, checkin=checkin, checkout=checkout,
                guests_or_days=guests, rental_charge=rental_charge,
                security_deposit=security_deposit, total_price=total,
            )

        elif item_type == "bike":
            bike_id = request.data.get("bike")
            try:
                bike = Bike.objects.get(id=bike_id)
            except Bike.DoesNotExist:
                return Response({"detail": "Bike not found."}, status=status.HTTP_404_NOT_FOUND)

            rental_charge = days_or_nights * bike.price_per_day
            security_deposit = bike.effective_security_deposit()
            total = rental_charge + security_deposit

            booking = Booking.objects.create(
                user=request.user, item_type="bike", bike=bike,
                item_name=bike.name, checkin=checkin, checkout=checkout,
                guests_or_days=days_or_nights, rental_charge=rental_charge,
                security_deposit=security_deposit, total_price=total,
            )
        else:
            return Response({"detail": "item_type must be 'homestay' or 'bike'."}, status=status.HTTP_400_BAD_REQUEST)

        return Response(BookingSerializer(booking).data, status=status.HTTP_201_CREATED)


class BookingDetailView(generics.RetrieveAPIView):
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Booking.objects.filter(user=self.request.user)


class BookingCancelView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            booking = Booking.objects.get(pk=pk, user=request.user)
        except Booking.DoesNotExist:
            return Response({"detail": "Booking not found."}, status=status.HTTP_404_NOT_FOUND)
        booking.status = "Cancelled"
        booking.save(update_fields=["status"])
        return Response(BookingSerializer(booking).data)
