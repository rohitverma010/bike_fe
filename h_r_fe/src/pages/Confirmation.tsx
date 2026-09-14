import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Api, formatMoney, type ApiBooking } from "../api";

export default function Confirmation() {
  const { id } = useParams();
  const [booking, setBooking] = useState<ApiBooking | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;
    Api.booking(id).then((res) => {
      if (res.ok && res.data) setBooking(res.data);
      else setError(true);
    });
  }, [id]);

  if (error) {
    return (
      <div className="container confirm-wrap">
        <div className="api-error">
          <strong>Couldn't load this booking</strong>
          Make sure the backend server is running at localhost:8010, then refresh.
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="container confirm-wrap">
        <div className="skeleton skeleton-text" style={{ height: 60, width: 60, borderRadius: "50%", margin: "0 auto 20px" }}></div>
        <div className="skeleton skeleton-text" style={{ height: 28, width: "70%", margin: "0 auto" }}></div>
      </div>
    );
  }

  const isHomestay = booking.item_type === "homestay";

  return (
    <div className="container confirm-wrap">
      <div className="confirm-icon">✔</div>
      <h1>Booking Confirmed!</h1>
      <p style={{ color: "var(--gray)" }}>
        Your booking reference is <strong>#{String(booking.id).padStart(5, "0")}</strong>. A confirmation has been sent to your account.
      </p>

      <div className="confirm-card">
        <div className="confirm-row"><span>Item</span><strong>{booking.item_name}</strong></div>
        <div className="confirm-row"><span>Type</span><span>{isHomestay ? "Homestay" : "Bike Rental"}</span></div>
        <div className="confirm-row"><span>{isHomestay ? "Check-in" : "Pickup"}</span><span>{booking.checkin}</span></div>
        <div className="confirm-row"><span>{isHomestay ? "Check-out" : "Return"}</span><span>{booking.checkout}</span></div>
        <div className="confirm-row"><span>{isHomestay ? "Guests" : "Days"}</span><span>{booking.guests_or_days}</span></div>
        {!isHomestay && booking.security_deposit > 0 && (
          <div className="confirm-row"><span>Security deposit (refundable)</span><span>{formatMoney(booking.security_deposit)}</span></div>
        )}
        <div className="confirm-row"><span>Total paid</span><strong>{formatMoney(booking.total_price)}</strong></div>
        <div className="confirm-row"><span>Status</span><span className={`status status-${booking.status}`}>{booking.status}</span></div>
      </div>

      <div className="hero-cta" style={{ justifyContent: "center", marginTop: 28 }}>
        <Link to="/my-bookings" className="btn-solid">View My Bookings</Link>
        <Link to="/" className="btn-ghost">Back to Home</Link>
      </div>
    </div>
  );
}
