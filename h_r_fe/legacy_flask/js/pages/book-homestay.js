"use strict";
document.addEventListener("DOMContentLoaded", async () => {
    const root = document.getElementById("bookHomestayRoot");
    if (!root)
        return;
    const id = root.dataset.id;
    if (!id)
        return;
    if (!Auth.isLoggedIn()) {
        window.location.href = `/login?next=${encodeURIComponent(window.location.pathname)}`;
        return;
    }
    const res = await Api.homestay(id);
    if (!res.ok || !res.data) {
        root.innerHTML = `<div class="api-error"><strong>Couldn't load this homestay</strong>Make sure the backend server is running at localhost:8010, then refresh.</div>`;
        return;
    }
    const stay = res.data;
    document.title = `Book ${stay.name} - StayNRide`;
    const today = new Date().toISOString().slice(0, 10);
    const user = Auth.getUser();
    const guestOptions = Array.from({ length: stay.guests }, (_, i) => i + 1)
        .map((n) => `<option value="${n}">${n} guest${n > 1 ? "s" : ""}</option>`)
        .join("");
    root.innerHTML = `
    <h1 style="margin-bottom:6px;">Book your stay</h1>
    <p style="color:var(--gray); margin-bottom:26px;">${escapeHtml(stay.name)} — ${escapeHtml(stay.location)}</p>
    <div id="bookError" class="flash flash-danger" style="display:none; margin-bottom:16px;"></div>
    <div class="detail-layout">
      <form id="bookForm" class="auth-card" style="box-shadow:var(--shadow); padding:28px;">
        <div class="form-row">
          <div class="form-group">
            <label>Check-in</label>
            <input type="date" id="checkin" min="${today}" value="${today}" required>
          </div>
          <div class="form-group">
            <label>Check-out</label>
            <input type="date" id="checkout" min="${today}" value="${today}" required>
          </div>
        </div>
        <div class="form-group">
          <label>Guests</label>
          <select id="guestsCount">${guestOptions}</select>
        </div>
        <div class="form-group">
          <label>Full name</label>
          <input type="text" value="${user ? escapeHtml(user.name) : ""}" required>
        </div>
        <div class="form-group">
          <label>Phone number</label>
          <input type="tel" placeholder="+91 9XXXXXXXXX" required>
        </div>
        <button type="submit" class="btn-solid btn-block btn-lg" id="bookBtn">Confirm Booking</button>
      </form>
      <div class="booking-box">
        <h3>Price summary</h3>
        <div class="unit">${formatMoney(stay.price_per_night)} / night</div>
        <div class="summary-row"><span>Nights</span><span id="nightsCount">1</span></div>
        <div class="summary-row"><span>Taxes & fees</span><span>Included</span></div>
        <div class="summary-total"><span>Total</span><span id="totalPrice">${formatMoney(stay.price_per_night)}</span></div>
      </div>
    </div>
  `;
    const checkin = document.getElementById("checkin");
    const checkout = document.getElementById("checkout");
    const nightsEl = document.getElementById("nightsCount");
    const totalEl = document.getElementById("totalPrice");
    const form = document.getElementById("bookForm");
    const errorBox = document.getElementById("bookError");
    const submitBtn = document.getElementById("bookBtn");
    const guestsSelect = document.getElementById("guestsCount");
    const recalc = () => {
        const d1 = new Date(checkin.value);
        const d2 = new Date(checkout.value);
        let nights = Math.round((d2.getTime() - d1.getTime()) / 86400000);
        if (isNaN(nights) || nights < 1)
            nights = 1;
        nightsEl.textContent = String(nights);
        totalEl.textContent = formatMoney(nights * stay.price_per_night);
    };
    checkin.addEventListener("change", recalc);
    checkout.addEventListener("change", recalc);
    recalc();
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        errorBox.style.display = "none";
        submitBtn.disabled = true;
        submitBtn.textContent = "Booking...";
        const bookRes = await Api.createBooking({
            item_type: "homestay",
            homestay: stay.id,
            checkin: checkin.value,
            checkout: checkout.value,
            guests_or_days: Number(guestsSelect.value),
        });
        if (bookRes.ok && bookRes.data) {
            window.location.href = `/confirmation/${bookRes.data.id}`;
            return;
        }
        submitBtn.disabled = false;
        submitBtn.textContent = "Confirm Booking";
        errorBox.textContent =
            bookRes.status === 0
                ? "Can't reach the server. Please check your connection and try again."
                : "Couldn't complete the booking. Please check your details and try again.";
        errorBox.style.display = "block";
    });
});
