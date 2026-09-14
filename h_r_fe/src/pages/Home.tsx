import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Api, formatMoney, type ApiHomestay, type ApiBike } from "../api";
import { useAuth } from "../context/AuthContext";
import SkeletonCards, { ApiError } from "../components/SkeletonCards";
import { vehicleImageFor, onVehicleImageError } from "../vehicleImages";
import { homestayImageFor, onHomestayImageError } from "../homestayImages";

export default function Home() {
  const { user } = useAuth();

  const [homestays, setHomestays] = useState<ApiHomestay[] | null>(null);
  const [homestaysError, setHomestaysError] = useState(false);
  const [bikes, setBikes] = useState<ApiBike[] | null>(null);
  const [bikesError, setBikesError] = useState(false);
  const [bikeCarouselIndex, setBikeCarouselIndex] = useState(0);
  // 3 bikes visible on desktop (unchanged), 2 on tablet, 1 on mobile —
  // matches the site's existing 991px/767px breakpoints.
  const [bikesPerView, setBikesPerView] = useState(3);

  useEffect(() => {
    const updateBikesPerView = () => {
      const w = window.innerWidth;
      setBikesPerView(w <= 767 ? 1 : w <= 991 ? 2 : 3);
    };
    updateBikesPerView();
    window.addEventListener("resize", updateBikesPerView);
    return () => window.removeEventListener("resize", updateBikesPerView);
  }, []);

  useEffect(() => {
    Api.homestays().then((res) => {
      if (res.ok && res.data) {
        setHomestays([...res.data].sort((a, b) => Number(b.rating) - Number(a.rating)).slice(0, 3));
      } else {
        setHomestaysError(true);
      }
    });
    Api.bikes().then((res) => {
      if (res.ok && res.data) {
        // Keep the fleet's natural order (not sorted by rating) so the
        // Popular Bikes carousel steps through them one at a time in a
        // stable, predictable sequence.
        setBikes(res.data);
      } else {
        setBikesError(true);
      }
    });
  }, []);

  const bikeMaxIndex = bikes ? Math.max(0, bikes.length - bikesPerView) : 0;
  const bikeCarouselPrev = () => setBikeCarouselIndex((i) => Math.max(0, i - 1));
  const bikeCarouselNext = () => setBikeCarouselIndex((i) => Math.min(bikeMaxIndex, i + 1));

  // Keep the index in range if the viewport (and therefore bikesPerView) changes.
  useEffect(() => {
    setBikeCarouselIndex((i) => Math.min(i, bikeMaxIndex));
  }, [bikeMaxIndex]);

  return (
    <>
      <section className="hero">
        <div className="container hero-inner">
          <h1>Find your stay. Ride your way.</h1>
          <p>Book handpicked homestays and rent the perfect bike — everything you need for your next trip, in one place.</p>
          <div className="hero-cta">
            <Link to="/homestays" className="btn-solid btn-lg">Browse Homestays</Link>
            <Link to="/bikes" className="btn-ghost btn-lg">Browse Bikes</Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <h2>Popular Homestays</h2>
              <p>Top-rated stays loved by travelers</p>
            </div>
            <Link to="/homestays" className="btn-outline">View all</Link>
          </div>
          <div className="grid">
            {homestaysError ? (
              <ApiError what="homestays" />
            ) : !homestays ? (
              <SkeletonCards count={3} />
            ) : (
              homestays.map((h) => (
                <Link to={`/homestay/${h.id}`} className="card" key={h.id}>
                  <div className="card-img">
                    <img src={homestayImageFor(h.name, h.image)} alt={h.name} onError={onHomestayImageError} />
                  </div>
                  <div className="card-body">
                    <h3>{h.name}</h3>
                    <div className="card-loc">📍 {h.location}</div>
                    <div className="card-footer">
                      <div className="price">{formatMoney(h.price_per_night)} <small>/ night</small></div>
                      <span className="btn-outline btn-sm">Book</span>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <div className="section-head">
            <div>
              <h2>Popular Bikes</h2>
              <p>Ride-ready bikes for every road</p>
            </div>
            <Link to="/bikes" className="btn-outline">View all</Link>
          </div>

          {bikesError ? (
            <div className="grid">
              <ApiError what="bikes" />
            </div>
          ) : !bikes ? (
            <div className="grid">
              <SkeletonCards count={3} />
            </div>
          ) : (
            <div className="bike-carousel">
              <button
                type="button"
                className="carousel-arrow carousel-arrow-left"
                aria-label="Show previous bike"
                onClick={bikeCarouselPrev}
                disabled={bikeCarouselIndex <= 0}
              >
                ‹
              </button>

              <div className="bike-carousel-viewport">
                <div
                  className="bike-carousel-track"
                  style={{
                    transform: `translateX(calc(-${bikeCarouselIndex} * (100% / ${bikesPerView} + 26px / ${bikesPerView})))`,
                  }}
                >
                  {bikes.map((b) => (
                    <Link
                      to={`/bike/${b.id}`}
                      className="card bike-carousel-item"
                      key={b.id}
                      style={{ flex: `0 0 calc((100% - ${(bikesPerView - 1) * 26}px) / ${bikesPerView})` }}
                    >
                      <div className="card-img vehicle-img">
                        <img src={vehicleImageFor(b.name, b.image)} alt={b.name} onError={onVehicleImageError} />
                        <span className="badge">{b.type}</span>
                      </div>
                      <div className="card-body">
                        <h3>{b.name}</h3>
                        <div className="card-loc">📍 {b.location}</div>
                        <div className="card-footer">
                          <div className="price">{formatMoney(b.price_per_day)} <small>/ day</small></div>
                          <span className="btn-outline btn-sm">Rent</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              <button
                type="button"
                className="carousel-arrow carousel-arrow-right"
                aria-label="Show next bike"
                onClick={bikeCarouselNext}
                disabled={bikeCarouselIndex >= bikeMaxIndex}
              >
                ›
              </button>
            </div>
          )}
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <h2>How it works</h2>
              <p>Three simple steps to your next adventure</p>
            </div>
          </div>
          <div className="features">
            <div className="feature">
              <div className="icon">🔍</div>
              <h4>Search</h4>
              <p>Explore homestays and bikes by destination, price and rating.</p>
            </div>
            <div className="feature">
              <div className="icon">📅</div>
              <h4>Book</h4>
              <p>Pick your dates, confirm details and book securely in minutes.</p>
            </div>
            <div className="feature">
              <div className="icon">🎒</div>
              <h4>Pack & Go</h4>
              <p>Get instant confirmation and manage everything from your account.</p>
            </div>
            <div className="feature">
              <div className="icon">⭐</div>
              <h4>Enjoy</h4>
              <p>Stay comfortably and ride freely — memories guaranteed.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="cta-band">
            <h2>Ready for your next trip?</h2>
            <p>Join thousands of travelers booking their perfect stay and ride with RohitStayNRide.</p>
            {user ? (
              <Link to="/homestays" className="btn-solid btn-lg">Start exploring</Link>
            ) : (
              <Link to="/signup" className="btn-solid btn-lg">Create free account</Link>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
