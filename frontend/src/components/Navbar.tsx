import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { api, useAsync } from "@/lib/api";
import { useHotel } from "@/lib/hotel";
import type { HotelSlug } from "@/lib/types";
import "./Navbar.css";

interface NavItem {
  label: string;
  to?: string;
  /** When set, the link path is built per active hotel. */
  scoped?: string;
}

const PROPERTIES: Array<{ slug: HotelSlug; label: string; sublabel: string }> = [
  { slug: "pavilion", label: "The Chancery Pavilion", sublabel: "Residency Road" },
  { slug: "chancery", label: "The Chancery Hotel", sublabel: "Lavelle Road" },
];

const PRIMARY: NavItem[] = [
  { label: "Stay", scoped: "/accommodation" },
  { label: "Dining", scoped: "/dining" },
  { label: "Events", scoped: "/plan-your-event" },
  { label: "Offers", scoped: "/special-offers" },
  { label: "Gallery", scoped: "/gallery" },
];

export function Navbar() {
  const { active, fallback } = useHotel();
  const { pathname } = useLocation();
  const site = useAsync(() => api.siteContent(), []);
  const hotels = useAsync(() => api.hotels(), []);
  const [scrolled, setScrolled] = useState(false);
  const [openProp, setOpenProp] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const onHome = pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpenProp(false);
    setMobileOpen(false);
  }, [pathname]);

  const scope: HotelSlug = active ?? fallback;

  // Active scope drives the logo: brand-wide on the root tree, hotel-specific
  // inside /chancery and /pavilion. Falls back to the brand mark if a hotel's
  // logo hasn't been uploaded.
  const activeHotel = useMemo(
    () => hotels.data?.find((h) => h.slug === active),
    [hotels.data, active],
  );
  const brandLogo = site.data?.brand_logo ?? null;
  const logoSrc = activeHotel?.logo ?? brandLogo;
  const logoAlt = activeHotel
    ? `${activeHotel.name} — home`
    : `${site.data?.site_title ?? "Chancery Hotels"} — home`;
  // Hotel logos are tall portrait marks (esp. Pavilion). Brand logo is squarer.
  const logoClass = activeHotel ? `nav-logo nav-logo-hotel ${active}` : "nav-logo nav-logo-brand";

  const navClass = [
    "navbar",
    onHome && !scrolled ? "transparent" : "solid",
    scrolled ? "scrolled" : "",
    mobileOpen ? "mobile-open" : "",
  ].filter(Boolean).join(" ");

  return (
    <header className={navClass}>
      <div className="navbar-inner container wide">
        <Link to="/" className="brand" aria-label={logoAlt}>
          {logoSrc ? (
            <img src={logoSrc} alt={logoAlt} className={logoClass} />
          ) : (
            <span className="brand-mark" aria-hidden="true">C</span>
          )}
        </Link>

        <nav className="primary" aria-label="Primary">
          <ul>
            <li
              className={`has-mega ${openProp ? "open" : ""}`}
              onMouseEnter={() => setOpenProp(true)}
              onMouseLeave={() => setOpenProp(false)}
            >
              <button
                type="button"
                className="nav-trigger"
                onClick={() => setOpenProp((v) => !v)}
                aria-expanded={openProp}
              >
                Our Hotels
              </button>
              <div className="mega" role="menu">
                {PROPERTIES.map((p) => (
                  <Link key={p.slug} to={`/${p.slug}`} className="mega-item" role="menuitem">
                    <span className="mega-label">{p.label}</span>
                    <span className="mega-sub">{p.sublabel}</span>
                  </Link>
                ))}
              </div>
            </li>
            {PRIMARY.map((item) => (
              <li key={item.label}>
                <NavLink
                  to={item.scoped ? `/${scope}${item.scoped}` : item.to ?? "/"}
                  className={({ isActive }) => (isActive ? "active" : undefined)}
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
            <li>
              <NavLink to={`/${scope}/contact-us`}>Contact</NavLink>
            </li>
          </ul>
        </nav>

        <div className="nav-cta">
          <Link to={`/book?hotel=${scope}`} className="btn small gold">Book Now</Link>
        </div>

        <button
          type="button"
          className="hamburger"
          aria-label="Menu"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((v) => !v)}
        >
          <span /><span /><span />
        </button>
      </div>

      {mobileOpen && (
        <div className="mobile-panel" role="dialog" aria-label="Site menu">
          <div className="mobile-section">
            <p className="eyebrow center">Our hotels</p>
            {PROPERTIES.map((p) => (
              <Link key={p.slug} to={`/${p.slug}`} className="mobile-link">
                {p.label}
                <span className="mobile-sub">{p.sublabel}</span>
              </Link>
            ))}
          </div>
          <div className="mobile-section">
            <p className="eyebrow center">{scope === "chancery" ? "Chancery Hotel" : "Chancery Pavilion"}</p>
            {PRIMARY.map((item) => (
              <Link key={item.label} to={`/${scope}${item.scoped}`} className="mobile-link">{item.label}</Link>
            ))}
            <Link to={`/${scope}/contact-us`} className="mobile-link">Contact</Link>
          </div>
          <div className="mobile-section">
            <p className="eyebrow center">More</p>
            <Link to="/rooms" className="mobile-link">All Rooms</Link>
            <Link to="/faq" className="mobile-link">FAQ</Link>
            <Link to="/careers" className="mobile-link">Careers</Link>
            <Link to="/catering" className="mobile-link">Outdoor Catering</Link>
          </div>
          <div className="mobile-cta">
            <Link to={`/book?hotel=${scope}`} className="btn gold">Book Your Stay</Link>
          </div>
        </div>
      )}
    </header>
  );
}
