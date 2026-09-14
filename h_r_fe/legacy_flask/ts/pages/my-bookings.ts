document.addEventListener("DOMContentLoaded", async () => {
  const root = document.getElementById("bookingsRoot");
  if (!root) return;

  if (!Auth.isLoggedIn()) {
    window.location.href = `/login?next=${encodeURIComponent(window.location.pathname)}`;
    return;
  }

  const render = async (): Promise<void> => {
    const res = await Api.myBookings();
    if (!res.ok || !res.data) {
      root.innerHTML = `<div class="api-error"><strong>Couldn't load your bookings</strong>Make sure the backend server is running at localhost:8010, then refresh.</div>`;
      return;
    }
    if (res.data.length === 0) {
      root.innerHTML = `
        <div class="empty-state">
          <div class="icon">🧳</div>
          <h3>No bookings yet</h3>
          <p>Start exploring homestays and bikes to plan your next trip.</p>
          <div class="hero-cta" style="justify-content:center; margin-top:16px;">
            <a href="/homestays" class="btn-solid">Browse Homestays</a>
            <a href="/bikes" class="btn-ghost">Browse Bikes</a>
          </div>
        </div>`;
      return;
    }

    root.innerHTML = res.data
      .map(
        (b) => `
      <div class="booking-item">
        <div>
          <h4>${escapeHtml(b.item_name)} <span class="tag">${b.item_type === "homestay" ? "Homestay" : "Bike"}</span></h4>
          <div class="meta">
            ${b.checkin} → ${b.checkout} ·
            ${b.guests_or_days} ${b.item_type === "homestay" ? "guests" : "days"} ·
            Booked on ${new Date(b.created_at).toLocaleString("en-IN")}
          </div>
        </div>
        <div style="display:flex; align-items:center; gap:16px;">
          <div class="price">${formatMoney(b.total_price)}</div>
          <span class="status status-${b.status}">${b.status}</span>
          ${b.status === "Confirmed" ? `<button type="button" class="btn-danger btn-sm cancel-btn" data-id="${b.id}">Cancel</button>` : ""}
        </div>
      </div>`
      )
      .join("");

    root.querySelectorAll<HTMLButtonElement>(".cancel-btn").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = Number(btn.dataset.id);
        btn.disabled = true;
        btn.textContent = "Cancelling...";
        const res = await Api.cancelBooking(id);
        if (res.ok) {
          render();
        } else {
          btn.disabled = false;
          btn.textContent = "Cancel";
        }
      });
    });
  };

  render();
});
