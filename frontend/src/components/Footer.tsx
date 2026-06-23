import { useState } from "react";
import { Link } from "react-router-dom";
import { api, useAsync } from "@/lib/api";
import { mapsUrl } from "@/lib/maps";
import "./Footer.css";

export function Footer() {
  const site = useAsync(() => api.siteContent(), []);
  const hotels = useAsync(() => api.hotels(), []);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "err">("idle");

  async function subscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus("sending");
    try {
      await api.subscribeNewsletter(email);
      setStatus("ok");
      setEmail("");
    } catch {
      setStatus("err");
    }
  }

  const year = new Date().getFullYear();
  const s = site.data;

  return (
    <footer className="footer">
      {/* Newsletter band */}
      <section className="newsletter">
        <div className="container narrow">
          <p className="eyebrow center">{s?.newsletter_heading ?? "Stay in touch"}</p>
          <h2 className="h2" style={{ textAlign: "center" }}>
            News, openings and seasonal offers
          </h2>
          <p className="lede" style={{ margin: "0 auto", textAlign: "center" }}>
            {s?.newsletter_description ??
              "Receive periodic updates on new offers, dining experiences and events from The Chancery Group of Hotels."}
          </p>
          <form className="newsletter-form" onSubmit={subscribe}>
            <label htmlFor="nl-email" className="visually-hidden">Email</label>
            <input
              id="nl-email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit" className="btn gold" disabled={status === "sending"}>
              {status === "sending" ? "Subscribing…" : "Subscribe"}
            </button>
          </form>
          {status === "ok" && <p className="newsletter-status ok">Thank you — we'll be in touch.</p>}
          {status === "err" && <p className="newsletter-status err">Something went wrong. Please try again.</p>}
        </div>
      </section>

      <section className="footer-main bg-navy">
        <div className="container wide">
          <div className="footer-grid">
            <div className="footer-brand">
              <Link to="/" className="brand light" aria-label="Chancery Hotels — home">
                {s?.brand_logo ? (
                  <img src={s.brand_logo} alt="Chancery Hotels" className="footer-logo" />
                ) : (
                  <>
                    <span className="brand-mark" aria-hidden="true">C</span>
                    <span className="brand-text">
                      <span className="brand-name">Chancery</span>
                      <span className="brand-line">Hotels Bangalore</span>
                    </span>
                  </>
                )}
              </Link>
              <p className="brand-note">
                {s?.footer_note ??
                  "The Chancery Group of Hotels — two distinguished properties in Bangalore offering timeless hospitality, refined dining and thoughtfully crafted experiences."}
              </p>
              <div className="socials">
                {s?.instagram_url && (
                  <a href={s.instagram_url} target="_blank" rel="noopener" aria-label="Instagram">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
                    </svg>
                  </a>
                )}
                {s?.facebook_url && (
                  <a href={s.facebook_url} target="_blank" rel="noopener" aria-label="Facebook">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </a>
                )}
                {s?.tripadvisor_url && <a href={s.tripadvisor_url} target="_blank" rel="noopener" aria-label="TripAdvisor">TA</a>}
              </div>
            </div>

            {hotels.data?.map((h) => (
              <div key={h.slug} className="footer-col">
                <p className="eyebrow">{h.short_name}</p>
                <p className="footer-address">{h.address}</p>
                <p className="footer-line"><a href={`tel:${h.phone.replace(/\s+/g, "")}`}>{h.phone}</a></p>
                {h.phone_alt && (
                  <p className="footer-line"><a href={`tel:${h.phone_alt.replace(/[\s-]+/g, "")}`}>{h.phone_alt}</a></p>
                )}
                <p className="footer-line"><a href={`mailto:${h.email}`}>{h.email}</a></p>
                <p className="footer-line">
                  <a href={mapsUrl(h.name, h.address)} target="_blank" rel="noopener">View on map ↗</a>
                </p>
                <p className="footer-links">
                  <Link to={`/${h.slug}/accommodation`}>Rooms</Link>
                  <Link to={`/${h.slug}/dining`}>Dining</Link>
                  <Link to={`/${h.slug}/plan-your-event`}>Events</Link>
                  <Link to={`/${h.slug}/contact-us`}>Contact</Link>
                </p>
              </div>
            ))}

            <div className="footer-col">
              <p className="eyebrow">Site</p>
              <p className="footer-links column">
                <Link to="/rooms">All Rooms</Link>
                <Link to="/faq">FAQ</Link>
                <Link to="/careers">Careers</Link>
                <Link to="/catering">Outdoor Catering</Link>
                <Link to="/site-map">Site Map</Link>
                <Link to="/privacy">Privacy Policy</Link>
                <Link to="/terms">Terms & Conditions</Link>
                <Link to="/accessibility-statement">Accessibility</Link>
              </p>
            </div>
          </div>

          <div className="footer-bottom">
            <p>© {year} Chancery Hotels. All rights reserved.</p>
            <p>{s?.tagline ?? "Luxury Hotels in Bangalore"}</p>
          </div>
        </div>
      </section>
    </footer>
  );
}
