import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Api } from "../api";
import { useAuth } from "../context/AuthContext";

export default function Signup() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const res = await Api.signup(name.trim(), email.trim(), password, phone.trim());

    if (res.ok && res.data) {
      login(res.data.token, res.data.user);
      navigate("/");
      return;
    }
    setSubmitting(false);
    if (res.status === 0) {
      setError("Can't reach the server. Please check your connection and try again.");
    } else if (res.data && typeof res.data === "object") {
      const data = res.data as unknown as Record<string, string[]>;
      const firstError = Object.values(data)[0];
      setError(Array.isArray(firstError) ? firstError[0] : "Please check your details and try again.");
    } else {
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <h2>Create your account</h2>
        <p className="subtitle">Join RohitStayNRide to book stays and bikes</p>
        {error && <div className="flash flash-danger" style={{ marginBottom: 16 }}>{error}</div>}
        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label>Full name</label>
            <input type="text" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Email address</label>
            <input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Phone number</label>
            <input
              type="tel"
              placeholder="+91 9XXXXXXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="At least 6 characters"
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn-solid btn-block btn-lg" disabled={submitting}>
            {submitting ? "Creating account..." : "Sign Up"}
          </button>
        </form>
        <div className="auth-foot">
          Already have an account? <Link to="/login">Log in</Link>
        </div>
      </div>
    </div>
  );
}
