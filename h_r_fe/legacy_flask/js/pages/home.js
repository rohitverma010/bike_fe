"use strict";
document.addEventListener("DOMContentLoaded", () => {
    const homestayGrid = document.getElementById("popularHomestays");
    const bikeGrid = document.getElementById("popularBikes");
    const ctaLink = document.getElementById("ctaAuthLink");
    if (ctaLink && Auth.isLoggedIn()) {
        ctaLink.textContent = "Start exploring";
        ctaLink.href = "/homestays";
    }
    if (homestayGrid) {
        Api.homestays().then((res) => {
            if (!res.ok || !res.data) {
                homestayGrid.innerHTML = `<div class="api-error"><strong>Couldn't load homestays</strong>Is the backend running at localhost:8010?</div>`;
                return;
            }
            const top3 = [...res.data].sort((a, b) => Number(b.rating) - Number(a.rating)).slice(0, 3);
            homestayGrid.innerHTML = top3
                .map((h) => `
        <a href="/homestay/${h.id}" class="card">
          <div class="card-img">
            <img src="${h.image}" alt="${escapeHtml(h.name)}">
            <span class="badge-rating badge">★ ${h.rating}</span>
          </div>
          <div class="card-body">
            <h3>${escapeHtml(h.name)}</h3>
            <div class="card-loc">📍 ${escapeHtml(h.location)}</div>
            <div class="card-footer">
              <div class="price">${formatMoney(h.price_per_night)} <small>/ night</small></div>
              <span class="btn-outline btn-sm">Book</span>
            </div>
          </div>
        </a>`)
                .join("");
        });
    }
    if (bikeGrid) {
        Api.bikes().then((res) => {
            if (!res.ok || !res.data) {
                bikeGrid.innerHTML = `<div class="api-error"><strong>Couldn't load bikes</strong>Is the backend running at localhost:8010?</div>`;
                return;
            }
            const top3 = [...res.data].sort((a, b) => Number(b.rating) - Number(a.rating)).slice(0, 3);
            bikeGrid.innerHTML = top3
                .map((b) => `
        <a href="/bike/${b.id}" class="card">
          <div class="card-img">
            <img src="${b.image}" alt="${escapeHtml(b.name)}">
            <span class="badge">${escapeHtml(b.type)}</span>
            <span class="badge-rating badge">★ ${b.rating}</span>
          </div>
          <div class="card-body">
            <h3>${escapeHtml(b.name)}</h3>
            <div class="card-loc">📍 ${escapeHtml(b.location)}</div>
            <div class="card-footer">
              <div class="price">${formatMoney(b.price_per_day)} <small>/ day</small></div>
              <span class="btn-outline btn-sm">Rent</span>
            </div>
          </div>
        </a>`)
                .join("");
        });
    }
});
