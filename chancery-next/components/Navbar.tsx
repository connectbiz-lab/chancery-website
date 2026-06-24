'use client'
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type HotelSlug } from "@/lib/hotel-scope";
import { mediaUrl } from "@/lib/media";
import type { Tables } from "@/lib/supabase/types";
import { BookButton } from "./BookButton";
import { SideMenu } from "./SideMenu";
import "./Navbar.css";

interface NavbarProps {
  site: Tables<"site_content">;
  hotels: Tables<"hotel">[];
}

export function Navbar({ site, hotels }: NavbarProps) {
  const pathname = usePathname();
  // Derive the active hotel from the route. The Navbar lives in the root
  // layout — above the <HotelScope> provider in app/[hotel]/layout — so it
  // can't read that context; the pathname is the reliable source here.
  const active: HotelSlug | null =
    pathname.startsWith("/pavilion") ? "pavilion"
    : pathname.startsWith("/chancery") ? "chancery"
    : null;
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  // Every page now leads with the editorial split hero on a light surface
  // (image left, text right) — no full-bleed photo behind the navbar — so the
  // navbar is always the SOLID fixed bar. The transparent-over-photo treatment
  // is retired.
  const onHeroPage = false;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the side menu whenever the route changes — adjusted during render on
  // pathname change rather than in an effect.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    if (menuOpen) setMenuOpen(false);
  }

  // Pavilion is the flagship — every brand-level page (home, /book, /careers,
  // etc.) defaults scoped links there. We deliberately do NOT remember the
  // last-visited hotel so scoped links don't drift to Chancery after a user
  // wanders into /chancery and returns to /.
  const scope: HotelSlug = active ?? "pavilion";

  // Active scope drives the logo: brand-wide on the root tree, hotel-specific
  // inside /chancery and /pavilion. Falls back to the brand mark if a hotel's
  // logo hasn't been uploaded.
  const activeHotel = useMemo(
    () => hotels.find((h) => h.slug === active),
    [hotels, active],
  );
  const brandLogo = mediaUrl(site.brand_logo);
  const logoSrc = mediaUrl(activeHotel?.logo) ?? brandLogo;
  const logoAlt = activeHotel
    ? `${activeHotel.name} — home`
    : `${site.site_title ?? "Chancery Hotels"} — home`;
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
          <Link href="/" className="brand" aria-label={logoAlt}>
            {logoSrc ? (
              <img src={logoSrc} alt={logoAlt} className={logoClass} />
            ) : (
              <span className="brand-mark" aria-hidden="true">C</span>
            )}
          </Link>

          <nav className="primary" aria-label="Primary">
            <ul>
              <li><Link href={`/${scope}`}>Hotels</Link></li>
              <li><Link href={`/${scope}/accommodation`}>Stay</Link></li>
              <li><Link href={`/${scope}/dining`}>Dining</Link></li>
              <li><Link href={`/${scope}/plan-your-event`}>Events</Link></li>
              <li><Link href={`/${scope}/special-offers`}>Offers</Link></li>
              <li><Link href={`/${scope}/gallery`}>Gallery</Link></li>
              <li><Link href={`/${scope}/contact-us`}>Contact</Link></li>
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
