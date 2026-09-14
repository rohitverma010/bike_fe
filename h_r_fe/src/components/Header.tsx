import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Header() {
  const { user, loading, logout } = useAuth();
  const [navOpen, setNavOpen] = useState(false);
  const navigate = useNavigate();

  const linkClass = ({ isActive }: { isActive: boolean }) => (isActive ? "active" : "");

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="site-header">
      <div className="container nav-wrap">
        <NavLink to="/" className="brand">
          RohitStay<span>N</span>Ride
        </NavLink>

        <button
          className="nav-toggle"
          aria-label="Toggle navigation"
          onClick={() => setNavOpen((v) => !v)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <nav className={`main-nav${navOpen ? " open" : ""}`}>
          <NavLink to="/" className={linkClass} onClick={() => setNavOpen(false)}>
            Home
          </NavLink>
          <NavLink to="/homestays" className={linkClass} onClick={() => setNavOpen(false)}>
            Homestays
          </NavLink>
          <NavLink to="/bikes" className={linkClass} onClick={() => setNavOpen(false)}>
            Bike Rentals
          </NavLink>
          <NavLink to="/about" className={linkClass} onClick={() => setNavOpen(false)}>
            About
          </NavLink>
          <NavLink to="/contact" className={linkClass} onClick={() => setNavOpen(false)}>
            Contact
          </NavLink>

          <div className="nav-auth">
            {loading ? (
              <span className="skeleton skeleton-pill"></span>
            ) : user ? (
              <>
                <NavLink to="/my-bookings" className="btn-ghost" onClick={() => setNavOpen(false)}>
                  My Bookings
                </NavLink>
                {user.is_staff && (
                  <NavLink to="/all-bookings" className="btn-ghost" onClick={() => setNavOpen(false)}>
                    All Bookings
                  </NavLink>
                )}
                <span className="nav-user">Hi, {user.name.split(" ")[0]}</span>
                <a
                  href="#"
                  className="btn-solid"
                  onClick={(e) => {
                    e.preventDefault();
                    setNavOpen(false);
                    handleLogout();
                  }}
                >
                  Logout
                </a>
              </>
            ) : (
              <>
                <NavLink to="/login" className="btn-ghost" onClick={() => setNavOpen(false)}>
                  Log in
                </NavLink>
                <NavLink to="/signup" className="btn-solid" onClick={() => setNavOpen(false)}>
                  Sign up
                </NavLink>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
