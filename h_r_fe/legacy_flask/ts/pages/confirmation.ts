document.addEventListener("DOMContentLoaded", async () => {
  const root = document.getElementById("confirmationRoot");
  if (!root) return;
  const id = root.dataset.id;
  if (!id) return;

  if (!Auth.isLoggedIn()) {
    window.location.href = `/login?next=${encodeURIComponent(window.location.pathname)}`;
    return;
  }

  const res = await Api.booking(id);
  if (!res.ok || !res.data) {
    root.innerHTML = `<div class="api-error"><strong>Couldn't load this booking</strong>Make sure the backend server is running at localhost:8010, then refresh.</div>`;
    return;
  }
  const b = res.data;
  const isHomestay = b.item_type === "homestay";

  root.innerHTML = `
    <div class="confirm-icon">✔</div>
    <h1>Booking Confirmed!</h1>
    <p style="color:var(--gray);">Your booking reference is <strong>#${String(b.id).padStart(5, "0")}</strong>. A confirmation has been sent to your account.</p>
    <div class="confirm-card">
      <div class="confirm-row"><span>Item</span><strong>${escapeHtml(b.item_name)}</strong></div>
      <div class="confirm-row"><span>Type</span><span>${isHomestay ? "Homestay" : "Bike Rental"}</span></div>
      <div class="confirm-row"><span>${isHomestay ? "Check-in" : "Pickup"}</span><span>${b.checkin}</span></div>
      <div class="confirm-row"><span>${isHomestay ? "Check-out" : "Return"}</span><span>${b.checkout}</span></div>
      <div class="confirm-row"><span>${isHomestay ? "Guests" : "Days"}</span><span>${b.guests_or_days}</span></div>
      ${!isHomestay && b.security_deposit ? `<div class="confirm-row"><span>Security deposit (refundable)</span><span>${formatMoney(b.security_deposit)}</span></div>` : ""}
      <div class="confirm-row"><span>Total paid</span><strong>${formatMoney(b.total_price)}</strong></div>
      <div class="confirm-row"><span>Status</span><span class="status status-${b.status}">${b.status}</span></div>
    </div>
    <div class="hero-cta" style="justify-content:center; margin-top:28px;">
      <a href="/my-bookings" class="btn-solid">View My Bookings</a>
      <a href="/" class="btn-ghost">Back to Home</a>
    </div>
  `;
});
