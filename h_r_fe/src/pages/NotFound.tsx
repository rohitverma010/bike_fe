import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="container confirm-wrap">
      <div className="confirm-icon" style={{ background: "#fde8e8", color: "#c0292d" }}>✕</div>
      <h1>404 - Page Not Found</h1>
      <p style={{ color: "var(--gray)" }}>The page you're looking for doesn't exist or has been moved.</p>
      <Link to="/" className="btn-solid btn-lg" style={{ marginTop: 20 }}>Back to Home</Link>
    </div>
  );
}
