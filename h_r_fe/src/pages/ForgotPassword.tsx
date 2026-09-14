import { useState } from "react";
import { Link } from "react-router-dom";
import { Api } from "../api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const res = await Api.forgotPassword(email.trim());
    setSubmitting(false);

    if (res.status === 0) {
      setError("Can't reach the server. Please check your connection and try again.");
      return;
    }
    // The backend always returns a generic success message here, whether or
    // not the email is registered — so we show the same "check your email"
    // state regardless, rather than leaking which emails have accounts.
    setSent(true);
  };

  if (sent) {
    return (
      <div className="auth-wrap">
        <div className="auth-card">
          <h2>Check your email</h2>
          <p className="subtitle">
            If an account exists for <strong>{email}</strong>, we've sent a link to reset your password.
            The link expires in 30 minutes.
          </p>
          <div className="auth-foot">
            <Link to="/login">Back to log in</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <h2>Forgot password</h2>
        <p className="subtitle">Enter your email and we'll send you a reset link</p>
        {error && <div className="flash flash-danger" style={{ marginBottom: 16 }}>{error}</div>}
        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label>Email address</label>
            <input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <button type="submit" className="btn-solid btn-block btn-lg" disabled={submitting}>
            {submitting ? "Sending..." : "Send reset link"}
          </button>
        </form>
        <div className="auth-foot">
          <Link to="/login">Back to log in</Link>
        </div>
      </div>
    </div>
  );
}
