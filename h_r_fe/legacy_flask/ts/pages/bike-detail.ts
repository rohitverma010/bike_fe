document.addEventListener("DOMContentLoaded", async () => {
  const root = document.getElementById("bikeDetailRoot");
  if (!root) return;
  const id = root.dataset.id;
  if (!id) return;

  const res = await Api.bike(id);
  if (!res.ok || !res.data) {
    root.innerHTML = `<div class="api-error"><strong>Couldn't load this bike</strong>Make sure the backend server is running at localhost:8010, then refresh.</div>`;
    return;
  }
  const b = res.data;
  document.title = `${b.name} - StayNRide`;
  const deposit = b.effective_security_deposit;

  root.innerHTML = `
    <div class="detail-hero"><img src="${b.image}" alt="${escapeHtml(b.name)}"></div>
    <div class="detail-layout">
      <div>
        <div class="detail-head">
          <div>
            <h1>${escapeHtml(b.name)}</h1>
            <div class="card-loc">📍 ${escapeHtml(b.location)}</div>
          </div>
          <span class="rating-pill">★ ${b.rating} rating</span>
        </div>
        <div class="info-row">
          <div>🏷️ <strong>${escapeHtml(b.type)}</strong></div>
          <div>⚙️ <strong>${escapeHtml(b.gear)}</strong></div>
          <div>💰 <strong>${formatMoney(b.price_per_day)}</strong> / day</div>
          <div>🏍️ <strong>${b.quantity}</strong> available</div>
        </div>
        <h3>About this bike</h3>
        <p>${escapeHtml(b.description)}</p>
        <h3>What's included</h3>
        <div class="amenity-grid">
          <div class="amenity">✅ Helmet included</div>
          <div class="amenity">✅ 24/7 Roadside assistance</div>
          <div class="amenity">✅ Free cancellation up to 24 hours before pickup</div>
          <div class="amenity">⛔ Fuel not included — return with the same fuel level</div>
        </div>
      </div>
      <div class="booking-box">
        <h3>${formatMoney(b.price_per_day)}</h3>
        <div class="unit">per day + ${formatMoney(deposit)} refundable security</div>
        <a href="/book/bike/${b.id}" class="btn-solid btn-block btn-lg">Rent Now</a>
        <div class="summary-row"><span>Rated</span><span>★ ${b.rating} / 5</span></div>
        <div class="summary-row"><span>Type</span><span>${escapeHtml(b.type)}</span></div>
        <div class="summary-row"><span>Transmission</span><span>${escapeHtml(b.gear)}</span></div>
        <div class="summary-row"><span>Security deposit</span><span>${formatMoney(deposit)} (refundable)</span></div>
        <div class="summary-row"><span>Units available</span><span>${b.quantity}</span></div>
      </div>
    </div>
  `;
});
