from django.urls import path

from . import views

urlpatterns = [
    path("auth/signup/", views.SignupView.as_view(), name="signup"),
    path("auth/verify-otp/", views.VerifyOtpView.as_view(), name="verify-otp"),
    path("auth/resend-otp/", views.ResendOtpView.as_view(), name="resend-otp"),
    path("auth/login/", views.LoginView.as_view(), name="login"),
    path("auth/forgot-password/", views.ForgotPasswordView.as_view(), name="forgot-password"),
    path("auth/reset-password/", views.ResetPasswordView.as_view(), name="reset-password"),
    path("auth/me/", views.MeView.as_view(), name="me"),

    path("homestays/", views.HomestayListView.as_view(), name="homestay-list"),
    path("homestays/<int:pk>/", views.HomestayDetailView.as_view(), name="homestay-detail"),

    path("bikes/", views.BikeListView.as_view(), name="bike-list"),
    path("bikes/<int:pk>/", views.BikeDetailView.as_view(), name="bike-detail"),

    path("bookings/", views.BookingListCreateView.as_view(), name="booking-list-create"),
    path("bookings/<int:pk>/", views.BookingDetailView.as_view(), name="booking-detail"),
    path("bookings/<int:pk>/cancel/", views.BookingCancelView.as_view(), name="booking-cancel"),
]
