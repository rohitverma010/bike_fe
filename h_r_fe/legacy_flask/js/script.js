"use strict";
document.addEventListener("DOMContentLoaded", () => {
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
    const tabs = document.querySelectorAll(".search-tab");
    const forms = document.querySelectorAll(".search-form");
    tabs.forEach((tab) => {
        tab.addEventListener("click", () => {
            tabs.forEach((t) => t.classList.remove("active"));
            forms.forEach((f) => f.classList.add("hidden"));
            tab.classList.add("active");
            const targetId = tab.dataset.target;
            if (targetId) {
                const target = document.getElementById(targetId);
                if (target)
                    target.classList.remove("hidden");
            }
        });
    });
    setTimeout(() => {
        document.querySelectorAll(".flash").forEach((el) => {
            el.style.transition = "opacity .5s ease";
            el.style.opacity = "0";
            setTimeout(() => el.remove(), 500);
        });
    }, 4000);
});
