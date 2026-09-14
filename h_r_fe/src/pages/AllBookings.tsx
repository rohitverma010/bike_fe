import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Api, formatMoney, type ApiAdminBooking } from "../api";
import { useAuth } from "../context/AuthContext";

/**
 * Admin-only view of every booking on the site, across all users.
 * The backend also enforces this via IsAdminUser on /admin/bookings/ —
 * this redirect is just so non-staff users don't see a broken page.
 */
export default function AllBookings() {
  const { user, loading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<ApiAdminBooking[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!user?.is_staff) return;
    Api.allBookings().then((res) => {
      if (res.ok && res.data) setBookings(res.data);
      else setError(true);
    });
  }, [user]);

  if (authLoading) return null;
  if (!user?.is_staff) return <Navigate to="/" replace />;

  return (
    <>
      <div className="page-hero">
        <div className="container">
          <h1>All Bookings</h1>
          <p>Every homestay and bike booking across all users</p>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 30 }}>
        {error ? (
          <div className="api-error">
            <strong>Couldn't load bookings</strong>
            Make sure the backend server is running, then refresh.
          </div>
        ) : !bookings ? (
          <div className="bookings-list">
            <div className="skeleton-card" style={{ padding: 20 }}><div className="skeleton skeleton-text"></div></div>
            <div className="skeleton-card" style={{ padding: 20 }}><div className="skeleton skeleton-text"></div></div>
          </div>
        ) : bookings.length === 0 ? (
          <div className="empty-state">
            <div className="icon">🧳</div>
            <h3>No bookings yet</h3>
            <p>Nobody has booked a homestay or bike yet.</p>
          </div>
        ) : (
          <div className="bookings-list">
            {bookings.map((b) => (
              <div className="booking-item" key={b.id}>
                <div>
                  <h4>{b.item_name} <span className="tag">{b.item_type === "homestay" ? "Homestay" : "Bike"}</span></h4>
                  <div className="meta">
                    {b.user_name} ({b.user_email}) · {b.checkin} → {b.checkout} ·{" "}
                    {b.guests_or_days} {b.item_type === "homestay" ? "guests" : "days"} · Booked on{" "}
                    {new Date(b.created_at).toLocaleString("en-IN")}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div className="price">{formatMoney(b.total_price)}</div>
                  <span className={`status status-${b.status}`}>{b.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
