"use strict";
const API_BASE = "http://127.0.0.1:8010/api";
const TOKEN_KEY = "staynride_token";
const USER_KEY = "staynride_user";
const Auth = {
    getToken() {
        try {
            return localStorage.getItem(TOKEN_KEY);
        }
        catch (_a) {
            return null;
        }
    },
    getUser() {
        try {
            const raw = localStorage.getItem(USER_KEY);
            return raw ? JSON.parse(raw) : null;
        }
        catch (_a) {
            return null;
        }
    },
    setSession(token, user) {
        try {
            localStorage.setItem(TOKEN_KEY, token);
            localStorage.setItem(USER_KEY, JSON.stringify(user));
        }
        catch (_a) {
        }
    },
    clearSession() {
        try {
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(USER_KEY);
        }
        catch (_a) {
        }
    },
    isLoggedIn() {
        return !!Auth.getToken();
    },
};
async function apiRequest(path, options = {}) {
    const headers = { "Content-Type": "application/json" };
    if (options.auth) {
        const token = Auth.getToken();
        if (token)
            headers["Authorization"] = `Token ${token}`;
    }
    try {
        const res = await fetch(`${API_BASE}${path}`, {
            method: options.method || "GET",
            headers,
            body: options.body ? JSON.stringify(options.body) : undefined,
        });
        let data = null;
        try {
            data = (await res.json());
        }
        catch (_a) {
            data = null;
        }
        return { ok: res.ok, status: res.status, data };
    }
    catch (_b) {
        return { ok: false, status: 0, data: null };
    }
}
const Api = {
    signup: (name, email, password, phone) => apiRequest("/auth/signup/", {
        method: "POST",
        body: { name, email, password, phone },
    }),
    login: (email, password) => apiRequest("/auth/login/", {
        method: "POST",
        body: { email, password },
    }),
    me: () => apiRequest("/auth/me/", { auth: true }),
    homestays: (params = "") => apiRequest(`/homestays/${params}`),
    homestay: (id) => apiRequest(`/homestays/${id}/`),
    bikes: (params = "") => apiRequest(`/bikes/${params}`),
    bike: (id) => apiRequest(`/bikes/${id}/`),
    myBookings: () => apiRequest("/bookings/", { auth: true }),
    booking: (id) => apiRequest(`/bookings/${id}/`, { auth: true }),
    createBooking: (payload) => apiRequest("/bookings/", { method: "POST", body: payload, auth: true }),
    cancelBooking: (id) => apiRequest(`/bookings/${id}/cancel/`, { method: "POST", auth: true }),
};
function formatMoney(n) {
    return "₹" + n.toLocaleString("en-IN");
}
function escapeHtml(s) {
    const div = document.createElement("div");
    div.textContent = s;
    return div.innerHTML;
}
