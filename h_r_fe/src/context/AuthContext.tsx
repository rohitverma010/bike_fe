import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { Api, Auth, type ApiUser } from "../api";

interface AuthContextValue {
  user: ApiUser | null;
  loading: boolean;
  login: (token: string, user: ApiUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ApiUser | null>(Auth.getUser());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!Auth.isLoggedIn()) {
      setLoading(false);
      return;
    }
    // Confirm the cached user against the backend in the background.
    Api.me().then((res) => {
      if (res.ok && res.data) {
        Auth.setSession(Auth.getToken() as string, res.data);
        setUser(res.data);
      } else if (res.status === 401) {
        Auth.clearSession();
        setUser(null);
      }
      setLoading(false);
    });
  }, []);

  const login = (token: string, u: ApiUser) => {
    Auth.setSession(token, u);
    setUser(u);
  };

  const logout = () => {
    Auth.clearSession();
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
