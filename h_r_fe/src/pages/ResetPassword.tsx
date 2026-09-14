import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Api } from "../api";
import { useAuth } from "../context/AuthContext";

export default function ResetPassword() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!token) {
    return (
      <div className="auth-wrap">
        <div className="auth-card">
          <h2>Invalid reset link</h2>
          <p className="subtitle">This link is missing its token. Please request a new one.</p>
          <div className="auth-foot">
            <Link to="/forgot-password">Request a new link</Link>
          </div>
        </div>
      </div>
    );
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }

    setSubmitting(true);
    const res = await Api.resetPassword(token, password);
    setSubmitting(false);

    if (res.ok && res.data) {
      login(res.data.token, res.data.user);
      navigate("/");
      return;
    }
    if (res.status === 0) {
      setError("Can't reach the server. Please check your connection and try again.");
    } else {
      const detail = (res.data as unknown as { detail?: string })?.detail;
      setError(detail || "This reset link is invalid or has expired. Please request a new one.");
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <h2>Set a new password</h2>
        <p className="subtitle">Choose a new password for your account</p>
        {error && <div className="flash flash-danger" style={{ marginBottom: 16 }}>{error}</div>}
        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label>New password</label>
            <input
              type="password"
              placeholder="At least 6 characters"
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Confirm new password</label>
            <input
              type="password"
              placeholder="Re-enter your new password"
              minLength={6}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn-solid btn-block btn-lg" disabled={submitting}>
            {submitting ? "Resetting..." : "Reset password"}
          </button>
        </form>
        <div className="auth-foot">
          <Link to="/login">Back to log in</Link>
        </div>
      </div>
    </div>
  );
}
