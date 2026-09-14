import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Api, formatMoney, type ApiBike } from "../api";
import { useAuth } from "../context/AuthContext";

function toDateStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export default function BookBike() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const [bike, setBike] = useState<ApiBike | null>(null);
  const [error, setError] = useState(false);
  const [checkin, setCheckin] = useState(today);
  const [days, setDays] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    if (!id) return;
    Api.bike(id).then((res) => {
      if (res.ok && res.data) {
        setBike(res.data);
        document.title = `Rent ${res.data.name} - RohitStayNRide`;
        setDays(res.data.is_package_bike ? 3 : 1);
      } else {
        setError(true);
      }
    });
  }, [id]);

  if (error) {
    return (
      <div className="container" style={{ paddingTop: 30, maxWidth: 900 }}>
        <div className="api-error">
          <strong>Couldn't load this bike</strong>
          Make sure the backend server is running at localhost:8010, then refresh.
        </div>
      </div>
    );
  }

  if (!bike) {
    return (
      <div className="container" style={{ paddingTop: 30, maxWidth: 900 }}>
        <div className="skeleton skeleton-text" style={{ height: 32, width: "50%" }}></div>
      </div>
    );
  }

  const MIN_DAYS = bike.is_package_bike ? 3 : 1;
  const MAX_DAYS = 30;
  const deposit = bike.effective_security_deposit;
  const checkoutDate = toDateStr(new Date(new Date(checkin).getTime() + days * 86400000));
  const rentalTotal = days * bike.price_per_day;
  const grandTotal = rentalTotal + deposit;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    setSubmitting(true);

    const res = await Api.createBooking({
      item_type: "bike",
      bike: bike.id,
      checkin,
      checkout: checkoutDate,
    });

    if (res.ok && res.data) {
      navigate(`/confirmation/${res.data.id}`);
      return;
    }
    setSubmitting(false);
    setSubmitError(
      res.status === 0
        ? "Can't reach the server. Please check your connection and try again."
        : "Couldn't complete the rental. Please check your details and try again."
    );
  };

  return (
    <div className="container" style={{ paddingTop: 30, maxWidth: 900 }}>
      <h1 style={{ marginBottom: 6 }}>Rent this bike</h1>
      <p style={{ color: "var(--gray)", marginBottom: 26 }}>{bike.name} — {bike.location}</p>
      {submitError && (
        <div className="flash flash-danger" style={{ marginBottom: 16 }}>{submitError}</div>
      )}

      <div className="detail-layout">
        <form className="auth-card" style={{ boxShadow: "var(--shadow)", padding: 28 }} onSubmit={onSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Pickup date</label>
              <input type="date" min={today} value={checkin} onChange={(e) => setCheckin(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Return date</label>
              <input type="date" value={checkoutDate} readOnly required />
            </div>
          </div>
          <div className="form-group">
            <label>Number of days{bike.is_package_bike ? " (minimum 3)" : ""}</label>
            <div className="stepper">
              <button
                type="button"
                className="stepper-btn"
                aria-label="Decrease days"
                disabled={days <= MIN_DAYS}
                onClick={() => setDays((d) => Math.max(MIN_DAYS, d - 1))}
              >
                −
              </button>
              <span className="stepper-value">{days}</span>
              <button
                type="button"
                className="stepper-btn"
                aria-label="Increase days"
                disabled={days >= MAX_DAYS}
                onClick={() => setDays((d) => Math.min(MAX_DAYS, d + 1))}
              >
                +
              </button>
            </div>
          </div>
          <div className="form-group">
            <label>Full name</label>
            <input type="text" defaultValue={user?.name || ""} required />
          </div>
          <div className="form-group">
            <label>Phone number</label>
            <input type="tel" placeholder="+91 9XXXXXXXXX" required />
          </div>
          <div className="form-group">
            <label>Driving license number</label>
            <input type="text" placeholder="DL-XXXXXXXXXXXX" required />
          </div>
          <button type="submit" className="btn-solid btn-block btn-lg" disabled={submitting}>
            {submitting ? "Booking..." : "Confirm Rental"}
          </button>
        </form>

        <div className="booking-box">
          <h3>Price summary</h3>
          <div className="unit">{formatMoney(bike.price_per_day)} / day</div>
          {bike.is_package_bike && (
            <div className="tag" style={{ marginBottom: 10, display: "inline-block" }}>
              📦 {formatMoney(deposit)} security deposit for this bike
            </div>
          )}
          <div className="summary-row"><span>Days</span><span>{days}</span></div>
          <div className="summary-row"><span>Rental charge</span><span>{formatMoney(rentalTotal)}</span></div>
          <div className="summary-row"><span>Security deposit</span><span>{formatMoney(deposit)} (refundable)</span></div>
          <div className="summary-total"><span>Total payable</span><span>{formatMoney(grandTotal)}</span></div>
        </div>
      </div>
    </div>
  );
}
