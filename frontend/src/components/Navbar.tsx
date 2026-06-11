import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { api, useAsync } from "@/lib/api";
import { useHotel } from "@/lib/hotel";
import type { HotelSlug } from "@/lib/types";
import { BookButton } from "./BookButton";
import { SideMenu } from "./SideMenu";
import "./Navbar.css";

export function Navbar() {
  const { active } = useHotel();
  const { pathname } = useLocation();
  const site = useAsync(() => api.siteContent(), []);
  const hotels = useAsync(() => api.hotels(), []);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  // Pages that lead with a full-bleed hero — we float the navbar transparent
  // over the photograph so the building extends behind it instead of the
  // navbar carving a solid bar across the top. Includes every hotel-scoped
  // sub-page (Dining, Events, Offers, Gallery, etc.) so navigating inside
  // a hotel feels like one continuous editorial spread.
  const onHeroPage =
    pathname === "/" ||
    pathname.startsWith("/chancery") ||
    pathname.startsWith("/pavilion");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the side menu whenever the route changes.
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  // Pavilion is the flagship — every brand-level page (home, /book, /careers,
  // etc.) defaults scoped links there. We deliberately do NOT remember the
  // last-visited hotel so scoped links don't drift to Chancery after a user
  // wanders into /chancery and returns to /.
  const scope: HotelSlug = active ?? "pavilion";

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
  const logoClass = activeHotel ? `nav-logo nav-logo-hotel ${active}` : "nav-logo nav-logo-brand";

  const navClass = [
    "navbar",
    onHeroPage && !scrolled ? "transparent" : "solid",
    scrolled ? "scrolled" : "",
  ].filter(Boolean).join(" ");

  return (
    <>
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
              <li><Link to={`/${scope}`}>Hotels</Link></li>
              <li><Link to={`/${scope}/accommodation`}>Stay</Link></li>
              <li><Link to={`/${scope}/dining`}>Dining</Link></li>
              <li><Link to={`/${scope}/plan-your-event`}>Events</Link></li>
              <li><Link to={`/${scope}/special-offers`}>Offers</Link></li>
              <li><Link to={`/${scope}/gallery`}>Gallery</Link></li>
              <li><Link to={`/${scope}/contact-us`}>Contact</Link></li>
            </ul>
          </nav>

          <div className="nav-right">
            <BookButton hotel={scope} className="btn small gold">Book Now</BookButton>
            <button
              type="button"
              className="hamburger"
              aria-label="Open menu"
              aria-expanded={menuOpen}
              aria-controls="site-menu"
              onClick={() => setMenuOpen(true)}
            >
              <span /><span /><span />
            </button>
          </div>
        </div>
      </header>

      <SideMenu open={menuOpen} scope={scope} onClose={() => setMenuOpen(false)} />
    </>
  );
}
