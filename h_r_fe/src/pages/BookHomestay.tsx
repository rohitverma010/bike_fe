import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Api, formatMoney, type ApiHomestay } from "../api";
import { useAuth } from "../context/AuthContext";

export default function BookHomestay() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const [stay, setStay] = useState<ApiHomestay | null>(null);
  const [error, setError] = useState(false);
  const [checkin, setCheckin] = useState(today);
  const [checkout, setCheckout] = useState(today);
  const [guests, setGuests] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    if (!id) return;
    Api.homestay(id).then((res) => {
      if (res.ok && res.data) {
        setStay(res.data);
        document.title = `Book ${res.data.name} - RohitStayNRide`;
      } else {
        setError(true);
      }
    });
  }, [id]);

  if (error) {
    return (
      <div className="container" style={{ paddingTop: 30, maxWidth: 900 }}>
        <div className="api-error">
          <strong>Couldn't load this homestay</strong>
          Make sure the backend server is running at localhost:8010, then refresh.
        </div>
      </div>
    );
  }

  if (!stay) {
    return (
      <div className="container" style={{ paddingTop: 30, maxWidth: 900 }}>
        <div className="skeleton skeleton-text" style={{ height: 32, width: "50%" }}></div>
      </div>
    );
  }

  let nights = Math.round((new Date(checkout).getTime() - new Date(checkin).getTime()) / 86400000);
  if (isNaN(nights) || nights < 1) nights = 1;
  const total = nights * stay.price_per_night;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    setSubmitting(true);

    const res = await Api.createBooking({
      item_type: "homestay",
      homestay: stay.id,
      checkin,
      checkout,
      guests_or_days: guests,
    });

    if (res.ok && res.data) {
      navigate(`/confirmation/${res.data.id}`);
      return;
    }
    setSubmitting(false);
    setSubmitError(
      res.status === 0
        ? "Can't reach the server. Please check your connection and try again."
        : "Couldn't complete the booking. Please check your details and try again."
    );
  };

  return (
    <div className="container" style={{ paddingTop: 30, maxWidth: 900 }}>
      <h1 style={{ marginBottom: 6 }}>Book your stay</h1>
      <p style={{ color: "var(--gray)", marginBottom: 26 }}>{stay.name} — {stay.location}</p>
      {submitError && (
        <div className="flash flash-danger" style={{ marginBottom: 16 }}>{submitError}</div>
      )}

      <div className="detail-layout">
        <form className="auth-card" style={{ boxShadow: "var(--shadow)", padding: 28 }} onSubmit={onSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Check-in</label>
              <input type="date" min={today} value={checkin} onChange={(e) => setCheckin(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Check-out</label>
              <input type="date" min={today} value={checkout} onChange={(e) => setCheckout(e.target.value)} required />
            </div>
          </div>
          <div className="form-group">
            <label>Guests</label>
            <select value={guests} onChange={(e) => setGuests(Number(e.target.value))}>
              {Array.from({ length: stay.guests }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>{n} guest{n > 1 ? "s" : ""}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Full name</label>
            <input type="text" defaultValue={user?.name || ""} required />
          </div>
          <div className="form-group">
            <label>Phone number</label>
            <input type="tel" placeholder="+91 9XXXXXXXXX" required />
          </div>
          <button type="submit" className="btn-solid btn-block btn-lg" disabled={submitting}>
            {submitting ? "Booking..." : "Confirm Booking"}
          </button>
        </form>

        <div className="booking-box">
          <h3>Price summary</h3>
          <div className="unit">{formatMoney(stay.price_per_night)} / night</div>
          <div className="summary-row"><span>Nights</span><span>{nights}</span></div>
          <div className="summary-row"><span>Taxes & fees</span><span>Included</span></div>
          <div className="summary-total"><span>Total</span><span>{formatMoney(total)}</span></div>
        </div>
      </div>
    </div>
  );
}
