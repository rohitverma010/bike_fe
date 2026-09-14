import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Api, formatMoney, type ApiHomestay } from "../api";
import SkeletonCards, { ApiError } from "../components/SkeletonCards";
import { homestayImageFor, onHomestayImageError } from "../homestayImages";

export default function Homestays() {
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState(params.get("q") || "");
  const [sort, setSort] = useState(params.get("sort") || "");
  const [homestays, setHomestays] = useState<ApiHomestay[] | null>(null);
  const [error, setError] = useState(false);

  const load = () => {
    setHomestays(null);
    setError(false);
    const query = new URLSearchParams();
    if (q) query.set("q", q);
    if (sort) query.set("sort", sort);
    const qs = query.toString() ? `?${query.toString()}` : "";
    Api.homestays(qs).then((res) => {
      if (res.ok && res.data) setHomestays(res.data);
      else setError(true);
    });
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const next = new URLSearchParams();
    if (q) next.set("q", q);
    if (sort) next.set("sort", sort);
    setParams(next);
    load();
  };

  return (
    <>
      <div className="page-hero">
        <div className="container">
          <h1>Homestays</h1>
          <p>Handpicked homes, cottages and villas across India</p>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 30 }}>
        <div className="filter-bar">
          <form onSubmit={onSubmit}>
            <input type="text" placeholder="Search by location or name..." value={q} onChange={(e) => setQ(e.target.value)} />
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="">Recommended</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
            <button type="submit" className="btn-solid">Filter</button>
          </form>
        </div>

        <div className="grid">
          {error ? (
            <ApiError what="homestays" />
          ) : !homestays ? (
            <SkeletonCards />
          ) : homestays.length === 0 ? (
            <div className="empty-state">
              <div className="icon">🏡</div>
              <h3>No homestays found</h3>
              <p>Try a different search term.</p>
            </div>
          ) : (
            homestays.map((h) => (
              <Link to={`/homestay/${h.id}`} className="card" key={h.id}>
                <div className="card-img">
                  <img src={homestayImageFor(h.name, h.image)} alt={h.name} onError={onHomestayImageError} />
                </div>
                <div className="card-body">
                  <h3>{h.name}</h3>
                  <div className="card-loc">📍 {h.location}</div>
                  <div className="card-tags">
                    {h.amenities_list.slice(0, 3).map((a) => (
                      <span className="tag" key={a}>{a}</span>
                    ))}
                  </div>
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
    </>
  );
}
