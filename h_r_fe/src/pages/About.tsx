import { useEffect, useState } from "react";
import { Api } from "../api";

export default function About() {
  const [homestayCount, setHomestayCount] = useState("…");
  const [bikeCount, setBikeCount] = useState("…");

  useEffect(() => {
    Api.homestays().then((res) => setHomestayCount(res.ok && res.data ? String(res.data.length) : "—"));
    Api.bikes().then((res) => setBikeCount(res.ok && res.data ? String(res.data.length) : "—"));
  }, []);

  return (
    <>
      <div className="page-hero">
        <div className="container">
          <h1>About RohitStayNRide</h1>
          <p>Making travel simple — one stay and one ride at a time</p>
        </div>
      </div>

      <div className="container section">
        <div style={{ maxWidth: 760 }}>
          <p>
            RohitStayNRide was built to solve a simple problem: travelers need both a place to stay and a way to get around.
            Instead of juggling multiple apps, we bring homestay bookings and bike rentals together in one seamless platform.
          </p>
          <p>
            From cozy mountain cottages to beachside villas, and from cruiser motorcycles to city scooters, we partner
            with trusted local hosts and rental operators to give you authentic, affordable options wherever you travel.
          </p>
        </div>

        <div className="features" style={{ marginTop: 40 }}>
          <div className="feature">
            <div className="icon">🏡</div>
            <h4>{homestayCount} Homestays</h4>
            <p>Verified homes across India's top destinations.</p>
          </div>
          <div className="feature">
            <div className="icon">🏍️</div>
            <h4>{bikeCount} Bikes</h4>
            <p>Cruisers, sports bikes, scooters and bicycles.</p>
          </div>
          <div className="feature">
            <div className="icon">🤝</div>
            <h4>Trusted Hosts</h4>
            <p>Every partner is verified for quality and safety.</p>
          </div>
          <div className="feature">
            <div className="icon">💬</div>
            <h4>24/7 Support</h4>
            <p>We're here to help before, during and after your trip.</p>
          </div>
        </div>
      </div>
    </>
  );
}
