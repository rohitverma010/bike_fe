import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <Link to="/" className="brand">
            RohitStay<span>N</span>Ride
          </Link>
          <p>Book unique homestays and rent bikes for your next adventure — all in one place.</p>
        </div>
        <div>
          <h4>Explore</h4>
          <Link to="/homestays">Homestays</Link>
          <Link to="/bikes">Bike Rentals</Link>
          <Link to="/about">About Us</Link>
        </div>
        <div>
          <h4>Support</h4>
          <Link to="/contact">Contact</Link>
          <Link to="/my-bookings">My Bookings</Link>
        </div>
        <div>
          <h4>Get in touch</h4>
          <p>
            bike@outlook.com
            <br />
            +91 78766 43552
          </p>
        </div>
      </div>
      <p className="copyright">© {new Date().getFullYear()} RohitStayNRide. All rights reserved.</p>
    </footer>
  );
}
