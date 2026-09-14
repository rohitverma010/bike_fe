import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Api } from "../api";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const res = await Api.login(email.trim(), password);

    if (res.ok && res.data) {
      login(res.data.token, res.data.user);
      navigate(params.get("next") || "/");
      return;
    }
    setSubmitting(false);
    if (res.status === 0) setError("Can't reach the server. Please check your connection and try again.");
    else if (res.status === 401) setError("Invalid email or password.");
    else if (res.status === 403) {
      const detail = (res.data as unknown as { detail?: string })?.detail;
      setError(detail || "Please verify your account before logging in.");
    } else setError("Something went wrong. Please try again.");
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <h2>Welcome back</h2>
        <p className="subtitle">Log in to manage your bookings</p>
        {error && <div className="flash flash-danger" style={{ marginBottom: 16 }}>{error}</div>}
        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label>Email address</label>
            <input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <div style={{ textAlign: "right", marginTop: 6 }}>
              <Link to="/forgot-password" className="link-btn">Forgot password?</Link>
            </div>
          </div>
          <button type="submit" className="btn-solid btn-block btn-lg" disabled={submitting}>
            {submitting ? "Logging in..." : "Log In"}
          </button>
        </form>
        <div className="auth-foot">
          Don't have an account? <Link to="/signup">Sign up</Link>
        </div>
      </div>
    </div>
  );
}
