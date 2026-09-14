// StayNRide front-end behaviour: site-wide chrome only (nav, hero tabs, flashes).
// Page-specific data + booking logic lives in static/ts/pages/*.ts, since all
// data now comes from the Django backend API (see static/ts/api.ts).

document.addEventListener("DOMContentLoaded", () => {
  // ---------------- Mobile nav toggle ----------------
  const toggle = document.getElementById("navToggle");
  const nav = document.getElementById("mainNav");
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      nav.classList.toggle("open");
    });
    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        nav.classList.remove("open");
      });
    });
  }

  // ---------------- Home hero search tabs (Homestay / Bike) ----------------
  const tabs = document.querySelectorAll<HTMLButtonElement>(".search-tab");
  const forms = document.querySelectorAll<HTMLFormElement>(".search-form");
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("active"));
      forms.forEach((f) => f.classList.add("hidden"));
      tab.classList.add("active");
      const targetId = tab.dataset.target;
      if (targetId) {
        const target = document.getElementById(targetId);
        if (target) target.classList.remove("hidden");
      }
    });
  });

  // ---------------- Auto-dismiss flash messages ----------------
  setTimeout(() => {
    document.querySelectorAll<HTMLElement>(".flash").forEach((el) => {
      el.style.transition = "opacity .5s ease";
      el.style.opacity = "0";
      setTimeout(() => el.remove(), 500);
    });
  }, 4000);
});
