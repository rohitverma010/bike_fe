document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("signupForm") as HTMLFormElement | null;
  const errorBox = document.getElementById("signupError");
  const nameInput = document.getElementById("name") as HTMLInputElement | null;
  const emailInput = document.getElementById("email") as HTMLInputElement | null;
  const phoneInput = document.getElementById("phone") as HTMLInputElement | null;
  const passwordInput = document.getElementById("password") as HTMLInputElement | null;
  const submitBtn = document.getElementById("signupBtn") as HTMLButtonElement | null;
  if (!form || !nameInput || !emailInput || !passwordInput || !submitBtn) return;

  const showError = (msg: string): void => {
    if (!errorBox) return;
    errorBox.textContent = msg;
    errorBox.style.display = "block";
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (errorBox) errorBox.style.display = "none";
    submitBtn.disabled = true;
    submitBtn.textContent = "Creating account...";

    const res = await Api.signup(
      nameInput.value.trim(),
      emailInput.value.trim(),
      passwordInput.value,
      phoneInput ? phoneInput.value.trim() : ""
    );

    if (res.ok && res.data) {
      Auth.setSession(res.data.token, res.data.user);
      window.location.href = "/";
      return;
    }

    submitBtn.disabled = false;
    submitBtn.textContent = "Sign Up";
    if (res.status === 0) {
      showError("Can't reach the server. Please check your connection and try again.");
    } else if (res.data && typeof res.data === "object") {
      const data = res.data as unknown as Record<string, string[]>;
      const firstError = Object.values(data)[0];
      showError(Array.isArray(firstError) ? firstError[0] : "Please check your details and try again.");
    } else {
      showError("Something went wrong. Please try again.");
    }
  });
});
