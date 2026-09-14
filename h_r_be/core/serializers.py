from django.contrib.auth.models import User
from rest_framework import serializers

from .models import Bike, Booking, Homestay, Profile


class HomestaySerializer(serializers.ModelSerializer):
    amenities_list = serializers.SerializerMethodField()

    class Meta:
        model = Homestay
        fields = [
            "id", "name", "location", "price_per_night", "rating", "image",
            "description", "guests", "beds", "amenities", "amenities_list",
        ]

    def get_amenities_list(self, obj):
        return obj.amenities_list()


class BikeSerializer(serializers.ModelSerializer):
    effective_security_deposit = serializers.SerializerMethodField()

    class Meta:
        model = Bike
        fields = [
            "id", "name", "type", "location", "price_per_day", "security_deposit",
            "rating", "image", "description", "gear", "quantity",
            "is_package_bike", "package_security_deposit", "effective_security_deposit",
        ]

    def get_effective_security_deposit(self, obj):
        return obj.effective_security_deposit()


class BookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = [
            "id", "item_type", "homestay", "bike", "item_name", "checkin", "checkout",
            "guests_or_days", "rental_charge", "security_deposit", "total_price",
            "status", "created_at",
        ]
        read_only_fields = [
            "id", "item_name", "rental_charge", "security_deposit", "total_price",
            "status", "created_at",
        ]


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ["phone", "email_verified", "phone_verified", "created_at"]


class UserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(read_only=True)
    name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name", "name", "is_staff", "profile"]

    def get_name(self, obj):
        full = f"{obj.first_name} {obj.last_name}".strip()
        return full or obj.username


class AdminBookingSerializer(serializers.ModelSerializer):
    """Booking serializer for the admin-only 'all bookings' view — includes
    who made the booking, unlike BookingSerializer which is scoped to the
    logged-in user and so doesn't need to say who they are."""
    user_email = serializers.EmailField(source="user.email", read_only=True)
    user_name = serializers.SerializerMethodField()

    class Meta:
        model = Booking
        fields = [
            "id", "user_email", "user_name", "item_type", "homestay", "bike", "item_name",
            "checkin", "checkout", "guests_or_days", "rental_charge", "security_deposit",
            "total_price", "status", "created_at",
        ]

    def get_user_name(self, obj):
        full = f"{obj.user.first_name} {obj.user.last_name}".strip()
        return full or obj.user.username


class SignupSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(min_length=6, write_only=True)
    # Required so we always have somewhere to send the phone OTP to.
    phone = serializers.CharField(max_length=20)

    # NOTE: uniqueness against email/phone is intentionally NOT checked here.
    # A signup that never completes OTP verification must not permanently
    # squat an email/phone — the view clears out any such stale, unverified
    # accounts before creating the new one. See SignupView.post().

    def validate_email(self, value):
        return value.strip().lower()

    def validate_phone(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Phone number is required.")
        return value


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)


class VerifyOtpSerializer(serializers.Serializer):
    user_id = serializers.IntegerField()
    purpose = serializers.ChoiceField(choices=["email", "phone"])
    code = serializers.CharField(max_length=6)


class ResendOtpSerializer(serializers.Serializer):
    user_id = serializers.IntegerField()
    purpose = serializers.ChoiceField(choices=["email", "phone"])


class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()


class ResetPasswordSerializer(serializers.Serializer):
    token = serializers.CharField()
    new_password = serializers.CharField(min_length=6, write_only=True)
