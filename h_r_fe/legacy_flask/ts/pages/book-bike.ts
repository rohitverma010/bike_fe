document.addEventListener("DOMContentLoaded", async () => {
  const root = document.getElementById("bookBikeRoot");
  if (!root) return;
  const id = root.dataset.id;
  if (!id) return;

  if (!Auth.isLoggedIn()) {
    window.location.href = `/login?next=${encodeURIComponent(window.location.pathname)}`;
    return;
  }

  const res = await Api.bike(id);
  if (!res.ok || !res.data) {
    root.innerHTML = `<div class="api-error"><strong>Couldn't load this bike</strong>Make sure the backend server is running at localhost:8010, then refresh.</div>`;
    return;
  }
  const bike = res.data;
  document.title = `Rent ${bike.name} - StayNRide`;
  const today = new Date().toISOString().slice(0, 10);
  const user = Auth.getUser();
  const deposit = bike.effective_security_deposit;
  const MIN_DAYS = bike.is_package_bike ? 3 : 1;
  const MAX_DAYS = 30;
  let days = MIN_DAYS;

  root.innerHTML = `
    <h1 style="margin-bottom:6px;">Rent this bike</h1>
    <p style="color:var(--gray); margin-bottom:26px;">${escapeHtml(bike.name)} — ${escapeHtml(bike.location)}</p>
    <div id="bookError" class="flash flash-danger" style="display:none; margin-bottom:16px;"></div>
    <div class="detail-layout">
      <form id="bookForm" class="auth-card" style="box-shadow:var(--shadow); padding:28px;">
        <div class="form-row">
          <div class="form-group">
            <label>Pickup date</label>
            <input type="date" id="checkin" min="${today}" value="${today}" required>
          </div>
          <div class="form-group">
            <label>Return date</label>
            <input type="date" id="checkout" min="${today}" value="${today}" required readonly>
          </div>
        </div>
        <div class="form-group">
          <label>Number of days${bike.is_package_bike ? " (minimum 3)" : ""}</label>
          <div class="stepper">
            <button type="button" class="stepper-btn" id="daysMinus" aria-label="Decrease days">−</button>
            <span class="stepper-value" id="daysValue">${days}</span>
            <button type="button" class="stepper-btn" id="daysPlus" aria-label="Increase days">+</button>
          </div>
        </div>
        <div class="form-group">
          <label>Full name</label>
          <input type="text" value="${user ? escapeHtml(user.name) : ""}" required>
        </div>
        <div class="form-group">
          <label>Phone number</label>
          <input type="tel" placeholder="+91 9XXXXXXXXX" required>
        </div>
        <div class="form-group">
          <label>Driving license number</label>
          <input type="text" placeholder="DL-XXXXXXXXXXXX" required>
        </div>
        <button type="submit" class="btn-solid btn-block btn-lg" id="bookBtn">Confirm Rental</button>
      </form>
      <div class="booking-box">
        <h3>Price summary</h3>
        <div class="unit">${formatMoney(bike.price_per_day)} / day</div>
        ${bike.is_package_bike ? `<div class="tag" style="margin-bottom:10px; display:inline-block;">📦 ${formatMoney(deposit)} security deposit for this bike</div>` : ""}
        <div class="summary-row"><span>Days</span><span id="bikeDaysCount">${days}</span></div>
        <div class="summary-row"><span>Rental charge</span><span id="bikeRentalTotal">${formatMoney(days * bike.price_per_day)}</span></div>
        <div class="summary-row"><span>Security deposit</span><span>${formatMoney(deposit)} (refundable)</span></div>
        <div class="summary-total"><span>Total payable</span><span id="bikeGrandTotal">${formatMoney(days * bike.price_per_day + deposit)}</span></div>
      </div>
    </div>
  `;

  const checkin = document.getElementById("checkin") as HTMLInputElement;
  const checkout = document.getElementById("checkout") as HTMLInputElement;
  const daysValueEl = document.getElementById("daysValue") as HTMLElement;
  const daysCountEl = document.getElementById("bikeDaysCount") as HTMLElement;
  const rentalTotalEl = document.getElementById("bikeRentalTotal") as HTMLElement;
  const grandTotalEl = document.getElementById("bikeGrandTotal") as HTMLElement;
  const minusBtn = document.getElementById("daysMinus") as HTMLButtonElement;
  const plusBtn = document.getElementById("daysPlus") as HTMLButtonElement;
  const form = document.getElementById("bookForm") as HTMLFormElement;
  const errorBox = document.getElementById("bookError") as HTMLElement;
  const submitBtn = document.getElementById("bookBtn") as HTMLButtonElement;

  const toDateStr = (d: Date): string => d.toISOString().slice(0, 10);

  const syncCheckout = (): void => {
    const d1 = new Date(checkin.value);
    if (isNaN(d1.getTime())) return;
    const d2 = new Date(d1);
    d2.setDate(d2.getDate() + days);
    checkout.value = toDateStr(d2);
  };

  const recalc = (): void => {
    daysValueEl.textContent = String(days);
    daysCountEl.textContent = String(days);
    const rentalTotal = days * bike.price_per_day;
    rentalTotalEl.textContent = formatMoney(rentalTotal);
    grandTotalEl.textContent = formatMoney(rentalTotal + deposit);
    minusBtn.disabled = days <= MIN_DAYS;
    plusBtn.disabled = days >= MAX_DAYS;
  };

  minusBtn.addEventListener("click", () => {
    if (days > MIN_DAYS) {
      days--;
      syncCheckout();
      recalc();
    }
  });
  plusBtn.addEventListener("click", () => {
    if (days < MAX_DAYS) {
      days++;
      syncCheckout();
      recalc();
    }
  });
  checkin.addEventListener("change", () => {
    syncCheckout();
    recalc();
  });

  syncCheckout();
  recalc();

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorBox.style.display = "none";
    submitBtn.disabled = true;
    submitBtn.textContent = "Booking...";

    const bookRes = await Api.createBooking({
      item_type: "bike",
      bike: bike.id,
      checkin: checkin.value,
      checkout: checkout.value,
    });

    if (bookRes.ok && bookRes.data) {
      window.location.href = `/confirmation/${bookRes.data.id}`;
      return;
    }

    submitBtn.disabled = false;
    submitBtn.textContent = "Confirm Rental";
    errorBox.textContent =
      bookRes.status === 0
        ? "Can't reach the server. Please check your connection and try again."
        : "Couldn't complete the rental. Please check your details and try again.";
    errorBox.style.display = "block";
  });
});
