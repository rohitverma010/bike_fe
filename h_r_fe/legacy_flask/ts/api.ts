// Shared API client for talking to the Django backend (h_r_be), which is the
// single source of truth for homestays, bikes, users and bookings.

const API_BASE = "http://127.0.0.1:8010/api";

interface ApiUser {
  id: number;
  username: string;
  email: string;
  name: string;
  profile?: { phone: string; created_at: string };
}

interface ApiHomestay {
  id: number;
  name: string;
  location: string;
  price_per_night: number;
  rating: string;
  image: string;
  description: string;
  guests: number;
  beds: number;
  amenities: string;
  amenities_list: string[];
}

interface ApiBike {
  id: number;
  name: string;
  type: string;
  location: string;
  price_per_day: number;
  security_deposit: number;
  rating: string;
  image: string;
  description: string;
  gear: string;
  quantity: number;
  is_package_bike: boolean;
  package_security_deposit: number;
  effective_security_deposit: number;
}

interface ApiBooking {
  id: number;
  item_type: "homestay" | "bike";
  homestay: number | null;
  bike: number | null;
  item_name: string;
  checkin: string;
  checkout: string;
  guests_or_days: number;
  rental_charge: number;
  security_deposit: number;
  total_price: number;
  status: "Confirmed" | "Cancelled";
  created_at: string;
}

const TOKEN_KEY = "staynride_token";
const USER_KEY = "staynride_user";

const Auth = {
  getToken(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  getUser(): ApiUser | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as ApiUser) : null;
    } catch {
      return null;
    }
  },
  setSession(token: string, user: ApiUser): void {
    try {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch {
      /* ignore storage failures (private browsing, etc.) */
    }
  },
  clearSession(): void {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch {
      /* ignore */
    }
  },
  isLoggedIn(): boolean {
    return !!Auth.getToken();
  },
};

async function apiRequest<T>(
  path: string,
  options: { method?: string; body?: unknown; auth?: boolean } = {}
): Promise<{ ok: boolean; status: number; data: T | null }> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (options.auth) {
    const token = Auth.getToken();
    if (token) headers["Authorization"] = `Token ${token}`;
  }

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method: options.method || "GET",
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
    let data: T | null = null;
    try {
      data = (await res.json()) as T;
    } catch {
      data = null;
    }
    return { ok: res.ok, status: res.status, data };
  } catch {
    // Backend unreachable (not running, wrong port, network error, etc.)
    return { ok: false, status: 0, data: null };
  }
}

const Api = {
  signup: (name: string, email: string, password: string, phone?: string) =>
    apiRequest<{ token: string; user: ApiUser }>("/auth/signup/", {
      method: "POST",
      body: { name, email, password, phone },
    }),
  login: (email: string, password: string) =>
    apiRequest<{ token: string; user: ApiUser }>("/auth/login/", {
      method: "POST",
      body: { email, password },
    }),
  me: () => apiRequest<ApiUser>("/auth/me/", { auth: true }),

  homestays: (params: string = "") =>
    apiRequest<ApiHomestay[]>(`/homestays/${params}`),
  homestay: (id: number | string) => apiRequest<ApiHomestay>(`/homestays/${id}/`),

  bikes: (params: string = "") => apiRequest<ApiBike[]>(`/bikes/${params}`),
  bike: (id: number | string) => apiRequest<ApiBike>(`/bikes/${id}/`),

  myBookings: () => apiRequest<ApiBooking[]>("/bookings/", { auth: true }),
  booking: (id: number | string) => apiRequest<ApiBooking>(`/bookings/${id}/`, { auth: true }),
  createBooking: (payload: Record<string, unknown>) =>
    apiRequest<ApiBooking>("/bookings/", { method: "POST", body: payload, auth: true }),
  cancelBooking: (id: number) =>
    apiRequest<ApiBooking>(`/bookings/${id}/cancel/`, { method: "POST", auth: true }),
};

function formatMoney(n: number): string {
  return "₹" + n.toLocaleString("en-IN");
}

function escapeHtml(s: string): string {
  const div = document.createElement("div");
  div.textContent = s;
  return div.innerHTML;
}
