document.addEventListener("DOMContentLoaded", () => {
  const grid = document.getElementById("bikeGrid");
  const form = document.getElementById("bikeFilterForm") as HTMLFormElement | null;
  const qInput = document.getElementById("qInput") as HTMLInputElement | null;
  const typeInput = document.getElementById("typeInput") as HTMLSelectElement | null;
  if (!grid) return;

  const params = new URLSearchParams(window.location.search);
  if (qInput) qInput.value = params.get("q") || "";
  if (typeInput) typeInput.value = params.get("type") || "";

  const cardHtml = (b: ApiBike): string => `
    <a href="/bike/${b.id}" class="card">
      <div class="card-img">
        <img src="${b.image}" alt="${escapeHtml(b.name)}">
        <span class="badge">${escapeHtml(b.type)}</span>
        <span class="badge-rating badge">★ ${b.rating}</span>
      </div>
      <div class="card-body">
        <h3>${escapeHtml(b.name)}</h3>
        <div class="card-loc">📍 ${escapeHtml(b.location)}</div>
        <div class="card-tags">
          <span class="tag">${escapeHtml(b.gear)}</span>
          <span class="tag">${b.quantity} available</span>
        </div>
        <div class="card-footer">
          <div class="price">${formatMoney(b.price_per_day)} <small>/ day</small></div>
          <span class="btn-outline btn-sm">Rent</span>
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
    const type = typeInput ? typeInput.value : "";
    const query = new URLSearchParams();
    if (q) query.set("q", q);
    if (type) query.set("type", type);
    const qs = query.toString() ? `?${query.toString()}` : "";

    const res = await Api.bikes(qs);

    if (!res.ok || !res.data) {
      grid.innerHTML = `<div class="api-error"><strong>Couldn't load bikes</strong>Make sure the backend server is running at localhost:8010, then refresh.</div>`;
      return;
    }
    if (res.data.length === 0) {
      grid.innerHTML = `<div class="empty-state"><div class="icon">🏍️</div><h3>No bikes found</h3><p>Try a different search term or type.</p></div>`;
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
