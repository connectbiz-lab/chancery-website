import { useState } from "react";
import { Link } from "react-router-dom";
import { api, useAsync } from "@/lib/api";
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
                {s?.instagram_url && <a href={s.instagram_url} target="_blank" rel="noopener" aria-label="Instagram">IG</a>}
                {s?.facebook_url && <a href={s.facebook_url} target="_blank" rel="noopener" aria-label="Facebook">FB</a>}
                {s?.tripadvisor_url && <a href={s.tripadvisor_url} target="_blank" rel="noopener" aria-label="TripAdvisor">TA</a>}
              </div>
            </div>

            {hotels.data?.map((h) => (
              <div key={h.slug} className="footer-col">
                <p className="eyebrow">{h.short_name}</p>
                <p className="footer-address">{h.address}</p>
                <p className="footer-line"><a href={`tel:${h.phone.replace(/\s+/g, "")}`}>{h.phone}</a></p>
                <p className="footer-line"><a href={`mailto:${h.email}`}>{h.email}</a></p>
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
