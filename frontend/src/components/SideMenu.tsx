import { useEffect } from "react";
import { Link } from "react-router-dom";
import { BookButton } from "./BookButton";
import {
  HotelsIcon,
  DiningIcon,
  EventsIcon,
  OffersIcon,
  GalleryIcon,
  ContactIcon,
  CloseIcon,
} from "./NavIcons";
import type { HotelSlug } from "@/lib/types";
import "./SideMenu.css";

interface SideMenuProps {
  open: boolean;
  scope: HotelSlug;
  onClose: () => void;
}

const items = [
  { Icon: HotelsIcon,  label: "Our Hotels", to: (s: HotelSlug) => `/${s}` },
  { Icon: DiningIcon,  label: "Dining",     to: (s: HotelSlug) => `/${s}/dining` },
  { Icon: EventsIcon,  label: "Events",     to: (s: HotelSlug) => `/${s}/plan-your-event` },
  { Icon: OffersIcon,  label: "Offers",     to: (s: HotelSlug) => `/${s}/special-offers` },
  { Icon: GalleryIcon, label: "Gallery",    to: (s: HotelSlug) => `/${s}/gallery` },
  { Icon: ContactIcon, label: "Contact",    to: (s: HotelSlug) => `/${s}/contact-us` },
];

export function SideMenu({ open, scope, onClose }: SideMenuProps) {
  // ESC to close + body scroll lock while open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return (
    <>
      <div
        className={`side-menu-backdrop ${open ? "open" : ""}`}
        onClick={onClose}
        aria-hidden={!open}
      />
      <aside
        className={`side-menu ${open ? "open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Site navigation"
        aria-hidden={!open}
      >
        <div className="side-menu__head">
          <BookButton hotel={scope} className="btn small gold">Book Now</BookButton>
          <button
            type="button"
            className="side-menu__close"
            aria-label="Close menu"
            onClick={onClose}
          >
            <CloseIcon size={22} />
          </button>
        </div>

        <nav className="side-menu__nav" aria-label="Main menu">
          <ul>
            {items.map(({ Icon, label, to }) => (
              <li key={label}>
                <Link to={to(scope)} onClick={onClose}>
                  <span className="side-menu__label">{label}</span>
                  <span className="side-menu__icon"><Icon size={22} /></span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="side-menu__foot">
          <p className="side-menu__tagline">The Chancery Group of Hotels</p>
          <p className="side-menu__meta">Bangalore · Since 1968</p>
        </div>
      </aside>
    </>
  );
}
