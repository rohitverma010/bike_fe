import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Api, formatMoney, type ApiBike } from "../api";
import SkeletonCards, { ApiError } from "../components/SkeletonCards";
import { vehicleImageFor, onVehicleImageError, VEHICLE_IMAGES } from "../vehicleImages";

const BIKE_NAMES = Object.keys(VEHICLE_IMAGES);

export default function Bikes() {
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState(params.get("q") || "");
  const [bikeName, setBikeName] = useState(params.get("bike") || "");
  const [allBikes, setAllBikes] = useState<ApiBike[] | null>(null);
  const [error, setError] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const load = () => {
    setAllBikes(null);
    setError(false);
    Api.bikes().then((res) => {
      if (res.ok && res.data) setAllBikes(res.data);
      else setError(true);
    });
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const bikes = useMemo(() => {
    if (!allBikes) return null;
    const term = q.trim().toLowerCase();
    return allBikes.filter((b) => {
      const matchesSearch = !term || b.name.toLowerCase().includes(term);
      const matchesBike = !bikeName || b.name === bikeName;
      return matchesSearch && matchesBike;
    });
  }, [allBikes, q, bikeName]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const next = new URLSearchParams();
    if (q) next.set("q", q);
    if (bikeName) next.set("bike", bikeName);
    setParams(next);
  };

  return (
    <>
      <div className="page-hero">
        <div className="container">
          <h1>Bike Rentals</h1>
          <p>Cruisers, sports bikes, scooters and bicycles ready to ride</p>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 30 }}>
        <div className="filter-bar">
          <form onSubmit={onSubmit} style={{ width: "100%" }}>
            <input type="text" placeholder="Search by bike name" value={q} onChange={(e) => setQ(e.target.value)} />

            <div className="bike-select" ref={dropdownRef}>
              <button
                type="button"
                className="bike-select-trigger"
                onClick={() => setDropdownOpen((v) => !v)}
              >
                {bikeName ? (
                  <>
                    <img src={vehicleImageFor(bikeName)} alt="" onError={onVehicleImageError} />
                    <span>{bikeName}</span>
                  </>
                ) : (
                  <span>All Bikes</span>
                )}
                <span className="bike-select-caret">▾</span>
              </button>
              {dropdownOpen && (
                <div className="bike-select-menu">
                  <div
                    className={`bike-select-option${bikeName === "" ? " active" : ""}`}
                    onClick={() => { setBikeName(""); setDropdownOpen(false); }}
                  >
                    All Bikes
                  </div>
                  {BIKE_NAMES.map((name) => (
                    <div
                      key={name}
                      className={`bike-select-option${bikeName === name ? " active" : ""}`}
                      onClick={() => { setBikeName(name); setDropdownOpen(false); }}
                    >
                      <img src={VEHICLE_IMAGES[name]} alt="" onError={onVehicleImageError} />
                      <span>{name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button type="submit" className="btn-solid">Filter</button>
          </form>
        </div>

        <div className="grid">
          {error ? (
            <ApiError what="bikes" />
          ) : !bikes ? (
            <SkeletonCards />
          ) : bikes.length === 0 ? (
            <div className="empty-state">
              <div className="icon">🏍️</div>
              <h3>No bikes found</h3>
              <p>Try a different search term or type.</p>
            </div>
          ) : (
            bikes.map((b) => (
              <Link to={`/bike/${b.id}`} className="card" key={b.id}>
                <div className="card-img vehicle-img">
                  <img src={vehicleImageFor(b.name, b.image)} alt={b.name} onError={onVehicleImageError} />
                  <span className="badge">{b.type}</span>
                </div>
                <div className="card-body">
                  <h3>{b.name}</h3>
                  <div className="card-loc">📍 {b.location}</div>
                  <div className="card-tags">
                    <span className="tag">{b.gear}</span>
                    <span className="tag">{b.quantity} available</span>
                  </div>
                  <div className="card-footer">
                    <div className="price">{formatMoney(b.price_per_day)} <small>/ day</small></div>
                    <span className="btn-outline btn-sm">Rent</span>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </>
  );
}
