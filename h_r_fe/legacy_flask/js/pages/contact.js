"use strict";
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("contactForm");
    const success = document.getElementById("contactSuccess");
    if (!form || !success)
        return;
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        success.style.display = "block";
        form.reset();
    });
});
