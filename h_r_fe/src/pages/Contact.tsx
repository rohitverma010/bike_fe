import { useState } from "react";

export default function Contact() {
  const [sent, setSent] = useState(false);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSent(true);
    e.currentTarget.reset();
  };

  return (
    <>
      <div className="page-hero">
        <div className="container">
          <h1>Contact Us</h1>
          <p>We'd love to hear from you</p>
        </div>
      </div>

      <div className="container section">
        <div className="detail-layout">
          <form className="auth-card" style={{ boxShadow: "var(--shadow)", padding: 28 }} onSubmit={onSubmit}>
            {sent && (
              <div className="flash flash-success" style={{ marginBottom: 16 }}>
                Thanks for reaching out! Our team will contact you shortly.
              </div>
            )}
            <div className="form-group">
              <label>Your name</label>
              <input type="text" placeholder="Full name" required />
            </div>
            <div className="form-group">
              <label>Email address</label>
              <input type="email" placeholder="you@example.com" required />
            </div>
            <div className="form-group">
              <label>Message</label>
              <textarea rows={5} placeholder="How can we help?" required></textarea>
            </div>
            <button type="submit" className="btn-solid btn-block btn-lg">Send Message</button>
          </form>

          <div>
            <h3>Get in touch</h3>
            <p style={{ color: "var(--gray)" }}>
              Our support team is available 24/7 to help with bookings, cancellations and any questions.
            </p>
            <div className="amenity-grid" style={{ gridTemplateColumns: "1fr", marginTop: 20 }}>
              <div className="amenity">📧 bike@outlook.com</div>
              <div className="amenity">📞 +91 78766 43552</div>
              <div className="amenity">📍 Rewalsar, Mandi, India</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
