document.addEventListener("DOMContentLoaded", () => {
  const grid = document.getElementById("homestayGrid");
  const form = document.getElementById("homestayFilterForm") as HTMLFormElement | null;
  const qInput = document.getElementById("qInput") as HTMLInputElement | null;
  const sortInput = document.getElementById("sortInput") as HTMLSelectElement | null;
  if (!grid) return;

  const params = new URLSearchParams(window.location.search);
  if (qInput) qInput.value = params.get("q") || "";
  if (sortInput) sortInput.value = params.get("sort") || "";

  const cardHtml = (h: ApiHomestay): string => `
    <a href="/homestay/${h.id}" class="card">
      <div class="card-img">
        <img src="${h.image}" alt="${escapeHtml(h.name)}">
        <span class="badge-rating badge">★ ${h.rating}</span>
      </div>
      <div class="card-body">
        <h3>${escapeHtml(h.name)}</h3>
        <div class="card-loc">📍 ${escapeHtml(h.location)}</div>
        <div class="card-tags">
          ${h.amenities_list.slice(0, 3).map((a) => `<span class="tag">${escapeHtml(a)}</span>`).join("")}
        </div>
        <div class="card-footer">
          <div class="price">${formatMoney(h.price_per_night)} <small>/ night</small></div>
          <span class="btn-outline btn-sm">Book</span>
        </div>
      </div>
    </a>
  `;

  const load = async (): Promise<void> => {
    grid.innerHTML = Array(6)
      .fill(0)
      .map(
        () => `
      <div class="skeleton-card">
        <div class="skeleton skeleton-img"></div>
        <div class="card-body">
          <div class="skeleton skeleton-text"></div>
          <div class="skeleton skeleton-text short"></div>
        </div>
      </div>`
      )
      .join("");

    const q = qInput ? qInput.value.trim() : "";
    const sort = sortInput ? sortInput.value : "";
    const query = new URLSearchParams();
    if (q) query.set("q", q);
    if (sort) query.set("sort", sort);
    const qs = query.toString() ? `?${query.toString()}` : "";

    const res = await Api.homestays(qs);

    if (!res.ok || !res.data) {
      grid.innerHTML = `<div class="api-error"><strong>Couldn't load homestays</strong>Make sure the backend server is running at localhost:8010, then refresh.</div>`;
      return;
    }
    if (res.data.length === 0) {
      grid.innerHTML = `<div class="empty-state"><div class="icon">🏡</div><h3>No homestays found</h3><p>Try a different search term.</p></div>`;
      return;
    }
    grid.innerHTML = res.data.map(cardHtml).join("");
  };

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      load();
    });
  }

  load();
});
