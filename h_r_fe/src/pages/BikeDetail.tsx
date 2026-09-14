import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Api, formatMoney, type ApiBike } from "../api";
import { vehicleImageFor, onVehicleImageError } from "../vehicleImages";

export default function BikeDetail() {
  const { id } = useParams();
  const [bike, setBike] = useState<ApiBike | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;
    setBike(null);
    setError(false);
    Api.bike(id).then((res) => {
      if (res.ok && res.data) {
        setBike(res.data);
        document.title = `${res.data.name} - RohitStayNRide`;
      } else {
        setError(true);
      }
    });
  }, [id]);

  if (error) {
    return (
      <div className="container" style={{ paddingTop: 30 }}>
        <div className="api-error">
          <strong>Couldn't load this bike</strong>
          Make sure the backend server is running at localhost:8010, then refresh.
        </div>
      </div>
    );
  }

  if (!bike) {
    return (
      <div className="container" style={{ paddingTop: 30 }}>
        <div className="skeleton skeleton-img" style={{ height: 420, borderRadius: "var(--radius)", marginBottom: 28 }}></div>
        <div className="detail-layout">
          <div>
            <div className="skeleton skeleton-text" style={{ height: 32, width: "60%" }}></div>
            <div className="skeleton skeleton-text short"></div>
            <div className="skeleton skeleton-text"></div>
          </div>
          <div className="booking-box">
            <div className="skeleton skeleton-text" style={{ height: 28 }}></div>
          </div>
        </div>
      </div>
    );
  }

  const deposit = bike.effective_security_deposit;

  return (
    <div className="container" style={{ paddingTop: 30 }}>
      <div className="detail-hero vehicle-img">
        <img src={vehicleImageFor(bike.name, bike.image)} alt={bike.name} onError={onVehicleImageError} />
      </div>
      <div className="detail-layout">
        <div>
          <div className="detail-head">
            <div>
              <h1>{bike.name}</h1>
              <div className="card-loc">📍 {bike.location}</div>
            </div>
          </div>
          <div className="info-row">
            <div>🏷️ <strong>{bike.type}</strong></div>
            <div>⚙️ <strong>{bike.gear}</strong></div>
            <div>💰 <strong>{formatMoney(bike.price_per_day)}</strong> / day</div>
            <div>🏍️ <strong>{bike.quantity}</strong> available</div>
          </div>
          <h3>About this bike</h3>
          <p>{bike.description}</p>
          <h3>What's included</h3>
          <div className="amenity-grid">
            <div className="amenity">✅ Helmet included</div>
            <div className="amenity">✅ 24/7 Roadside assistance</div>
            <div className="amenity">✅ Free cancellation up to 24 hours before pickup</div>
            <div className="amenity">⛔ Fuel not included — return with the same fuel level</div>
          </div>
        </div>
        <div className="booking-box">
          <h3>{formatMoney(bike.price_per_day)}</h3>
          <div className="unit">per day + {formatMoney(deposit)} refundable security</div>
          <Link to={`/book/bike/${bike.id}`} className="btn-solid btn-block btn-lg">Rent Now</Link>
          <div className="summary-row"><span>Rated</span><span>★ {bike.rating} / 5</span></div>
          <div className="summary-row"><span>Type</span><span>{bike.type}</span></div>
          <div className="summary-row"><span>Transmission</span><span>{bike.gear}</span></div>
          <div className="summary-row"><span>Security deposit</span><span>{formatMoney(deposit)} (refundable)</span></div>
          <div className="summary-row"><span>Units available</span><span>{bike.quantity}</span></div>
        </div>
      </div>
    </div>
  );
}
