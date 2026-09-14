document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm") as HTMLFormElement | null;
  const errorBox = document.getElementById("loginError");
  const emailInput = document.getElementById("email") as HTMLInputElement | null;
  const passwordInput = document.getElementById("password") as HTMLInputElement | null;
  const submitBtn = document.getElementById("loginBtn") as HTMLButtonElement | null;
  if (!form || !emailInput || !passwordInput || !submitBtn) return;

  const showError = (msg: string): void => {
    if (!errorBox) return;
    errorBox.textContent = msg;
    errorBox.style.display = "block";
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (errorBox) errorBox.style.display = "none";
    submitBtn.disabled = true;
    submitBtn.textContent = "Logging in...";

    const res = await Api.login(emailInput.value.trim(), passwordInput.value);

    if (res.ok && res.data) {
      Auth.setSession(res.data.token, res.data.user);
      const params = new URLSearchParams(window.location.search);
      window.location.href = params.get("next") || "/";
      return;
    }

    submitBtn.disabled = false;
    submitBtn.textContent = "Log In";
    if (res.status === 0) {
      showError("Can't reach the server. Please check your connection and try again.");
    } else if (res.status === 401) {
      showError("Invalid email or password.");
    } else {
      showError("Something went wrong. Please try again.");
    }
  });
});
