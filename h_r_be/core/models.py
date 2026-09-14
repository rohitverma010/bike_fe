import random
from datetime import timedelta

from django.conf import settings
from django.db import models
from django.utils import timezone


class Profile(models.Model):
    """Extra profile data for a signed-up user, created automatically on signup."""
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="profile")
    phone = models.CharField(max_length=20, blank=True)
    email_verified = models.BooleanField(default=False)
    phone_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Profile<{self.user.email}>"

    def is_fully_verified(self):
        return self.email_verified and self.phone_verified


class OtpCode(models.Model):
    """A one-time code sent to a user's email or phone during signup."""
    PURPOSE_CHOICES = [("email", "Email"), ("phone", "Phone")]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="otp_codes")
    purpose = models.CharField(max_length=10, choices=PURPOSE_CHOICES)
    code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    verified = models.BooleanField(default=False)

    def __str__(self):
        return f"OtpCode<{self.user.email} {self.purpose}>"

    @classmethod
    def generate(cls, user, purpose, ttl_minutes=10):
        code = f"{random.randint(0, 999999):06d}"
        return cls.objects.create(
            user=user,
            purpose=purpose,
            code=code,
            expires_at=timezone.now() + timedelta(minutes=ttl_minutes),
        )

    def is_expired(self):
        return timezone.now() > self.expires_at


class Homestay(models.Model):
    name = models.CharField(max_length=120)
    location = models.CharField(max_length=200)
    price_per_night = models.PositiveIntegerField()
    rating = models.DecimalField(max_digits=2, decimal_places=1, default=5.0)
    image = models.URLField()
    description = models.TextField()
    guests = models.PositiveIntegerField(default=4)
    beds = models.PositiveIntegerField(default=2)
    amenities = models.CharField(max_length=400, help_text="Comma-separated list")

    def __str__(self):
        return self.name

    def amenities_list(self):
        return [a.strip() for a in self.amenities.split(",") if a.strip()]


class Bike(models.Model):
    TYPE_CHOICES = [
        ("Scooter", "Scooter"),
        ("Adventure", "Adventure"),
        ("Street", "Street"),
        ("Cruiser", "Cruiser"),
        ("Sports", "Sports"),
        ("Bicycle", "Bicycle"),
    ]

    name = models.CharField(max_length=120)
    type = models.CharField(max_length=30, choices=TYPE_CHOICES)
    location = models.CharField(max_length=200)
    price_per_day = models.PositiveIntegerField()
    security_deposit = models.PositiveIntegerField(default=2000)
    rating = models.DecimalField(max_digits=2, decimal_places=1, default=5.0)
    image = models.URLField()
    description = models.TextField()
    gear = models.CharField(max_length=60)
    quantity = models.PositiveIntegerField(default=5, help_text="Units available in the fleet")

    # Himalayan & Xpulse: flat security deposit override regardless of rental length.
    is_package_bike = models.BooleanField(default=False)
    package_security_deposit = models.PositiveIntegerField(default=5999)

    def __str__(self):
        return self.name

    def effective_security_deposit(self):
        return self.package_security_deposit if self.is_package_bike else self.security_deposit


class Booking(models.Model):
    ITEM_TYPE_CHOICES = [("homestay", "Homestay"), ("bike", "Bike")]
    STATUS_CHOICES = [("Confirmed", "Confirmed"), ("Cancelled", "Cancelled")]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="bookings")
    item_type = models.CharField(max_length=10, choices=ITEM_TYPE_CHOICES)

    homestay = models.ForeignKey(Homestay, on_delete=models.SET_NULL, null=True, blank=True, related_name="bookings")
    bike = models.ForeignKey(Bike, on_delete=models.SET_NULL, null=True, blank=True, related_name="bookings")

    item_name = models.CharField(max_length=120)  # snapshot, survives item deletion
    checkin = models.DateField()
    checkout = models.DateField()
    guests_or_days = models.PositiveIntegerField(help_text="Guests for a homestay, days for a bike")
    rental_charge = models.PositiveIntegerField(default=0)
    security_deposit = models.PositiveIntegerField(default=0)
    total_price = models.PositiveIntegerField()
    status = models.CharField(max_length=12, choices=STATUS_CHOICES, default="Confirmed")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user} - {self.item_name} ({self.status})"
