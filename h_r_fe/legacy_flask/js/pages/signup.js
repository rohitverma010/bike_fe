"use strict";
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("signupForm");
    const errorBox = document.getElementById("signupError");
    const nameInput = document.getElementById("name");
    const emailInput = document.getElementById("email");
    const phoneInput = document.getElementById("phone");
    const passwordInput = document.getElementById("password");
    const submitBtn = document.getElementById("signupBtn");
    if (!form || !nameInput || !emailInput || !passwordInput || !submitBtn)
        return;
    const showError = (msg) => {
        if (!errorBox)
            return;
        errorBox.textContent = msg;
        errorBox.style.display = "block";
    };
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (errorBox)
            errorBox.style.display = "none";
        submitBtn.disabled = true;
        submitBtn.textContent = "Creating account...";
        const res = await Api.signup(nameInput.value.trim(), emailInput.value.trim(), passwordInput.value, phoneInput ? phoneInput.value.trim() : "");
        if (res.ok && res.data) {
            Auth.setSession(res.data.token, res.data.user);
            window.location.href = "/";
            return;
        }
        submitBtn.disabled = false;
        submitBtn.textContent = "Sign Up";
        if (res.status === 0) {
            showError("Can't reach the server. Please check your connection and try again.");
        }
        else if (res.data && typeof res.data === "object") {
            const data = res.data;
            const firstError = Object.values(data)[0];
            showError(Array.isArray(firstError) ? firstError[0] : "Please check your details and try again.");
        }
        else {
            showError("Something went wrong. Please try again.");
        }
    });
});
