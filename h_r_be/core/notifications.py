"""
Sends OTP codes by email (Django SMTP) and SMS (Twilio).

Both are configured entirely via environment variables (see .env.example).
If a channel isn't configured (e.g. local dev without Twilio credentials),
the code is logged instead of sent, so signup still works end-to-end locally.
"""
import logging

from django.conf import settings
from django.core.mail import send_mail

logger = logging.getLogger(__name__)


def send_email_otp(user, code):
    subject = "Your StayNRide verification code"
    message = (
        f"Hi {user.first_name or user.username},\n\n"
        f"Your StayNRide email verification code is: {code}\n"
        f"This code expires in 10 minutes.\n\n"
        f"If you didn't request this, you can ignore this email."
    )
    if not settings.EMAIL_HOST_USER:
        logger.warning("EMAIL_HOST_USER not configured — email OTP for %s: %s", user.email, code)
        return
    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,
        [user.email],
        fail_silently=False,
    )


def send_phone_otp(phone, code):
    if not (settings.TWILIO_ACCOUNT_SID and settings.TWILIO_AUTH_TOKEN and settings.TWILIO_FROM_NUMBER):
        logger.warning("Twilio not configured — phone OTP for %s: %s", phone, code)
        return
    from twilio.rest import Client

    client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
    client.messages.create(
        body=f"Your StayNRide verification code is {code}. It expires in 10 minutes.",
        from_=settings.TWILIO_FROM_NUMBER,
        to=phone,
    )
