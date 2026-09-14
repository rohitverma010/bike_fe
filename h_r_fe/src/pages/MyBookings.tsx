import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Api, formatMoney, type ApiBooking } from "../api";

export default function MyBookings() {
  const [bookings, setBookings] = useState<ApiBooking[] | null>(null);
  const [error, setError] = useState(false);
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  const load = () => {
    setError(false);
    Api.myBookings().then((res) => {
      if (res.ok && res.data) setBookings(res.data);
      else setError(true);
    });
  };

  useEffect(() => {
    load();
  }, []);

  const cancel = async (id: number) => {
    setCancellingId(id);
    const res = await Api.cancelBooking(id);
    if (res.ok) load();
    setCancellingId(null);
  };

  return (
    <>
      <div className="page-hero">
        <div className="container">
          <h1>My Bookings</h1>
          <p>All your homestay and bike bookings in one place</p>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 30 }}>
        {error ? (
          <div className="api-error">
            <strong>Couldn't load your bookings</strong>
            Make sure the backend server is running at localhost:8010, then refresh.
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
            <p>Start exploring homestays and bikes to plan your next trip.</p>
            <div className="hero-cta" style={{ justifyContent: "center", marginTop: 16 }}>
              <Link to="/homestays" className="btn-solid">Browse Homestays</Link>
              <Link to="/bikes" className="btn-ghost">Browse Bikes</Link>
            </div>
          </div>
        ) : (
          <div className="bookings-list">
            {bookings.map((b) => (
              <div className="booking-item" key={b.id}>
                <div>
                  <h4>{b.item_name} <span className="tag">{b.item_type === "homestay" ? "Homestay" : "Bike"}</span></h4>
                  <div className="meta">
                    {b.checkin} → {b.checkout} · {b.guests_or_days} {b.item_type === "homestay" ? "guests" : "days"} · Booked on{" "}
                    {new Date(b.created_at).toLocaleString("en-IN")}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div className="price">{formatMoney(b.total_price)}</div>
                  <span className={`status status-${b.status}`}>{b.status}</span>
                  {b.status === "Confirmed" && (
                    <button
                      type="button"
                      className="btn-danger btn-sm"
                      disabled={cancellingId === b.id}
                      onClick={() => cancel(b.id)}
                    >
                      {cancellingId === b.id ? "Cancelling..." : "Cancel"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
