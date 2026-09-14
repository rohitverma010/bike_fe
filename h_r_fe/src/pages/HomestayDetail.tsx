import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Api, formatMoney, type ApiHomestay } from "../api";
import { homestayImageFor, onHomestayImageError } from "../homestayImages";

export default function HomestayDetail() {
  const { id } = useParams();
  const [stay, setStay] = useState<ApiHomestay | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;
    setStay(null);
    setError(false);
    Api.homestay(id).then((res) => {
      if (res.ok && res.data) {
        setStay(res.data);
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
          <strong>Couldn't load this homestay</strong>
          Make sure the backend server is running at localhost:8010, then refresh.
        </div>
      </div>
    );
  }

  if (!stay) {
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

  return (
    <div className="container" style={{ paddingTop: 30 }}>
      <div className="detail-hero">
        <img src={homestayImageFor(stay.name, stay.image)} alt={stay.name} onError={onHomestayImageError} />
      </div>
      <div className="detail-layout">
        <div>
          <div className="detail-head">
            <div>
              <h1>{stay.name}</h1>
              <div className="card-loc">📍 {stay.location}</div>
            </div>
          </div>
          <div className="info-row">
            <div>👥 <strong>{stay.guests}</strong> Guests</div>
            <div>🛏️ <strong>{stay.beds}</strong> Bedrooms</div>
            <div>💰 <strong>{formatMoney(stay.price_per_night)}</strong> / night</div>
          </div>
          <h3>About this stay</h3>
          <p>{stay.description}</p>
          <h3>Amenities</h3>
          <div className="amenity-grid">
            {stay.amenities_list.map((a) => (
              <div className="amenity" key={a}>✅ {a}</div>
            ))}
          </div>
        </div>
        <div className="booking-box">
          <h3>{formatMoney(stay.price_per_night)}</h3>
          <div className="unit">per night</div>
          <Link to={`/book/homestay/${stay.id}`} className="btn-solid btn-block btn-lg">Book Now</Link>
          <div className="summary-row"><span>Rated</span><span>★ {stay.rating} / 5</span></div>
          <div className="summary-row"><span>Max guests</span><span>{stay.guests}</span></div>
          <div className="summary-row"><span>Free cancellation</span><span>Up to 48h before</span></div>
        </div>
      </div>
    </div>
  );
}
