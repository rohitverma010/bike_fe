"use strict";
document.addEventListener("DOMContentLoaded", async () => {
    const root = document.getElementById("homestayDetailRoot");
    if (!root)
        return;
    const id = root.dataset.id;
    if (!id)
        return;
    const res = await Api.homestay(id);
    if (!res.ok || !res.data) {
        root.innerHTML = `<div class="api-error"><strong>Couldn't load this homestay</strong>Make sure the backend server is running at localhost:8010, then refresh.</div>`;
        return;
    }
    const h = res.data;
    document.title = `${h.name} - StayNRide`;
    root.innerHTML = `
    <div class="detail-hero"><img src="${h.image}" alt="${escapeHtml(h.name)}"></div>
    <div class="detail-layout">
      <div>
        <div class="detail-head">
          <div>
            <h1>${escapeHtml(h.name)}</h1>
            <div class="card-loc">📍 ${escapeHtml(h.location)}</div>
          </div>
          <span class="rating-pill">★ ${h.rating} rating</span>
        </div>
        <div class="info-row">
          <div>👥 <strong>${h.guests}</strong> Guests</div>
          <div>🛏️ <strong>${h.beds}</strong> Bedrooms</div>
          <div>💰 <strong>${formatMoney(h.price_per_night)}</strong> / night</div>
        </div>
        <h3>About this stay</h3>
        <p>${escapeHtml(h.description)}</p>
        <h3>Amenities</h3>
        <div class="amenity-grid">
          ${h.amenities_list.map((a) => `<div class="amenity">✅ ${escapeHtml(a)}</div>`).join("")}
        </div>
      </div>
      <div class="booking-box">
        <h3>${formatMoney(h.price_per_night)}</h3>
        <div class="unit">per night</div>
        <a href="/book/homestay/${h.id}" class="btn-solid btn-block btn-lg">Book Now</a>
        <div class="summary-row"><span>Rated</span><span>★ ${h.rating} / 5</span></div>
        <div class="summary-row"><span>Max guests</span><span>${h.guests}</span></div>
        <div class="summary-row"><span>Free cancellation</span><span>Up to 48h before</span></div>
      </div>
    </div>
  `;
});
