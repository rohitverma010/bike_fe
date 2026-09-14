from django.contrib import admin

from .models import Bike, Booking, Homestay, OtpCode, PasswordResetToken, Profile


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "phone", "email_verified", "phone_verified", "created_at")


@admin.register(OtpCode)
class OtpCodeAdmin(admin.ModelAdmin):
    list_display = ("user", "purpose", "code", "verified", "created_at", "expires_at")
    list_filter = ("purpose", "verified")
    search_fields = ("user__email",)


@admin.register(PasswordResetToken)
class PasswordResetTokenAdmin(admin.ModelAdmin):
    list_display = ("user", "used", "created_at", "expires_at")
    list_filter = ("used",)
    search_fields = ("user__email",)


@admin.register(Homestay)
class HomestayAdmin(admin.ModelAdmin):
    list_display = ("name", "location", "price_per_night", "rating", "guests", "beds")
    search_fields = ("name", "location")


@admin.register(Bike)
class BikeAdmin(admin.ModelAdmin):
    list_display = ("name", "type", "location", "price_per_day", "security_deposit",
                     "is_package_bike", "package_security_deposit", "quantity", "rating")
    list_filter = ("type", "is_package_bike")
    search_fields = ("name", "location")


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "item_type", "item_name", "checkin", "checkout",
                     "guests_or_days", "total_price", "status", "created_at")
    list_filter = ("item_type", "status")
    search_fields = ("item_name", "user__email")
