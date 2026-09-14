document.addEventListener("DOMContentLoaded", () => {
  const homestayCountEl = document.getElementById("homestayCount");
  const bikeCountEl = document.getElementById("bikeCount");

  if (homestayCountEl) {
    Api.homestays().then((res) => {
      homestayCountEl.textContent = res.ok && res.data ? String(res.data.length) : "—";
    });
  }
  if (bikeCountEl) {
    Api.bikes().then((res) => {
      bikeCountEl.textContent = res.ok && res.data ? String(res.data.length) : "—";
    });
  }
});
