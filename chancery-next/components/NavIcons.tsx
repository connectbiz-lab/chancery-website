/**
 * Editorial line-icons for hero icon row + side drawer menu.
 * 24x24 viewBox, single-stroke, currentColor — inherit text color and
 * hover transitions from the parent button/anchor.
 */

type IconProps = { size?: number; className?: string };

const baseProps = (size = 24, className?: string) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.25,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  className,
});

export function HotelsIcon({ size, className }: IconProps) {
  return (
    <svg {...baseProps(size, className)}>
      {/* Claridges-style boutique-hotel facade — flat-top block with a small
         central pediment, four rows of square windows, central entrance. */}
      <path d="M4.5 21V6h15v15" />
      <path d="M4 21h16" />
      <path d="M11 6V3.5h2V6" />
      {/* Windows — 3 columns × 3 rows, plus entrance below */}
      <rect x="6.5" y="8" width="2" height="2" />
      <rect x="11" y="8" width="2" height="2" />
      <rect x="15.5" y="8" width="2" height="2" />
      <rect x="6.5" y="11.5" width="2" height="2" />
      <rect x="11" y="11.5" width="2" height="2" />
      <rect x="15.5" y="11.5" width="2" height="2" />
      <rect x="6.5" y="15" width="2" height="2" />
      <rect x="15.5" y="15" width="2" height="2" />
      {/* Central entrance */}
      <path d="M10.5 21v-5.5h3V21" />
    </svg>
  );
}

export function StayIcon({ size, className }: IconProps) {
  return (
    <svg {...baseProps(size, className)}>
      {/* Hotel bed silhouette — headboard, mattress, pillow, base. */}
      <path d="M3 19v-7" />
      <path d="M21 19v-3" />
      <path d="M3 16h18" />
      <path d="M3 19h18" />
      <path d="M5 16v-3a2 2 0 0 1 2-2h14" />
      <rect x="7.5" y="11" width="6" height="2.5" rx="0.4" />
    </svg>
  );
}

export function DiningIcon({ size, className }: IconProps) {
  return (
    <svg {...baseProps(size, className)}>
      {/* Cloche — domed serving cover with knob and tray. */}
      <path d="M12 4.5v1.5" />
      <path d="M4 16.5a8 8 0 0 1 16 0" />
      <path d="M3 16.5h18" />
      <path d="M5 19.5h14" />
    </svg>
  );
}

export function EventsIcon({ size, className }: IconProps) {
  return (
    <svg {...baseProps(size, className)}>
      {/* Chandelier — central rod, three-arm bowl, hanging drop crystals. */}
      <path d="M12 3v3" />
      <circle cx="12" cy="6" r="0.6" fill="currentColor" stroke="none" />
      <path d="M6 12c1.5 2 3.5 3 6 3s4.5-1 6-3" />
      <path d="M4 11h16" />
      <path d="M8 14v4" />
      <path d="M12 15v5" />
      <path d="M16 14v4" />
      <circle cx="8" cy="19" r="0.9" />
      <circle cx="12" cy="21" r="0.9" />
      <circle cx="16" cy="19" r="0.9" />
    </svg>
  );
}

export function OffersIcon({ size, className }: IconProps) {
  return (
    <svg {...baseProps(size, className)}>
      {/* Luggage tag with a knotted ribbon — heritage hospitality cue. */}
      <path d="M4 11V6a1 1 0 0 1 1-1h7l8 8-8 8-8-8z" />
      <circle cx="8.5" cy="8.5" r="1.2" fill="currentColor" stroke="none" />
      <path d="M3 5c-0.6 -1.2 0.6 -2.4 1.8 -1.8" />
    </svg>
  );
}

export function GalleryIcon({ size, className }: IconProps) {
  return (
    <svg {...baseProps(size, className)}>
      {/* Framed landscape — ornate outer trim + inner mat + horizon scene. */}
      <rect x="3" y="4" width="18" height="16" rx="0.5" />
      <rect x="5" y="6" width="14" height="12" rx="0.5" />
      <circle cx="9" cy="10" r="1.1" />
      <path d="M5 16l4-4 3 3 3-3 4 4" />
    </svg>
  );
}

export function ContactIcon({ size, className }: IconProps) {
  return (
    <svg {...baseProps(size, className)}>
      {/* Envelope */}
      <rect x="3" y="5" width="18" height="14" rx="0.5" />
      <path d="M3 7l9 7 9-7" />
    </svg>
  );
}

/* ── Amenity + occasion marks (hotel amenities grid, Events page occasions) ── */

export function RestaurantIcon({ size, className }: IconProps) {
  return (
    <svg {...baseProps(size, className)}>
      {/* Fork and knife. */}
      <path d="M7 3.5v6a2 2 0 0 0 2 2v9" />
      <path d="M5 3.5v5" />
      <path d="M9 3.5v5" />
      <path d="M11 3.5v6a2 2 0 0 1-2 2" />
      <path d="M17 20.5v-17c-2 1.5-3 4-3 7.5h3" />
    </svg>
  );
}

export function BarIcon({ size, className }: IconProps) {
  return (
    <svg {...baseProps(size, className)}>
      {/* Cocktail coupe with a garnish pick. */}
      <path d="M5 5h14l-7 8z" />
      <path d="M12 13v6" />
      <path d="M8.5 19.5h7" />
      <path d="M14 8l4-4.5" />
    </svg>
  );
}

export function FitnessIcon({ size, className }: IconProps) {
  return (
    <svg {...baseProps(size, className)}>
      {/* Dumbbell. */}
      <path d="M8 12h8" />
      <rect x="5" y="8" width="3" height="8" rx="0.6" />
      <rect x="16" y="8" width="3" height="8" rx="0.6" />
      <path d="M3 10.5v3" />
      <path d="M21 10.5v3" />
    </svg>
  );
}

export function PoolIcon({ size, className }: IconProps) {
  return (
    <svg {...baseProps(size, className)}>
      {/* Pool ladder over two waves. */}
      <path d="M8 14V6a2 2 0 0 1 4 0" />
      <path d="M14 14V6a2 2 0 0 1 4 0" />
      <path d="M8 9h6" />
      <path d="M8 12h6" />
      <path d="M3 17c1.5-1.2 3-1.2 4.5 0s3 1.2 4.5 0 3-1.2 4.5 0 3 1.2 4.5 0" />
      <path d="M3 20.5c1.5-1.2 3-1.2 4.5 0s3 1.2 4.5 0 3-1.2 4.5 0 3 1.2 4.5 0" />
    </svg>
  );
}

export function RoomServiceIcon({ size, className }: IconProps) {
  return (
    <svg {...baseProps(size, className)}>
      {/* Service bell on a tray, with a 24h arc. */}
      <path d="M12 6v1.5" />
      <path d="M10.5 6h3" />
      <path d="M5 16a7 7 0 0 1 14 0" />
      <path d="M3.5 16h17" />
      <path d="M6 19.5h12" />
    </svg>
  );
}

export function TurndownIcon({ size, className }: IconProps) {
  return (
    <svg {...baseProps(size, className)}>
      {/* Bed beneath a crescent moon. */}
      <path d="M3 20v-6" />
      <path d="M21 20v-3" />
      <path d="M3 17h18" />
      <path d="M5 17v-2a2 2 0 0 1 2-2h14" />
      <path d="M17.5 4.5a3.5 3.5 0 1 0 3 5.2 3 3 0 0 1-3-5.2z" />
    </svg>
  );
}

export function BusinessIcon({ size, className }: IconProps) {
  return (
    <svg {...baseProps(size, className)}>
      {/* Briefcase. */}
      <rect x="3.5" y="8" width="17" height="11" rx="1" />
      <path d="M9 8V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
      <path d="M3.5 13h17" />
      <path d="M11 13v1.5h2V13" />
    </svg>
  );
}

export function ValetIcon({ size, className }: IconProps) {
  return (
    <svg {...baseProps(size, className)}>
      {/* Car, front three-quarter. */}
      <path d="M5 16l1.5-5a2 2 0 0 1 1.9-1.4h7.2a2 2 0 0 1 1.9 1.4L19 16" />
      <rect x="3.5" y="16" width="17" height="3" rx="0.8" />
      <path d="M6 19v1.5" />
      <path d="M18 19v1.5" />
      <path d="M7 13h10" />
    </svg>
  );
}

export function LaundryIcon({ size, className }: IconProps) {
  return (
    <svg {...baseProps(size, className)}>
      {/* Garment on a hanger. */}
      <path d="M12 8V6.5a1.5 1.5 0 1 0-1.5-1.5" />
      <path d="M12 8l8 5.5H4z" />
      <path d="M7 13.5V20h10v-6.5" />
    </svg>
  );
}

export function WakeUpIcon({ size, className }: IconProps) {
  return (
    <svg {...baseProps(size, className)}>
      {/* Alarm clock. */}
      <circle cx="12" cy="13" r="6.5" />
      <path d="M12 9.5V13l2.5 1.5" />
      <path d="M5 5.5L7.5 3.5" />
      <path d="M19 5.5l-2.5-2" />
      <path d="M7.5 19l-1.5 1.5" />
      <path d="M16.5 19l1.5 1.5" />
    </svg>
  );
}

export function WifiIcon({ size, className }: IconProps) {
  return (
    <svg {...baseProps(size, className)}>
      {/* Wi-Fi arcs. */}
      <path d="M3 9.5a13 13 0 0 1 18 0" />
      <path d="M6 13a9 9 0 0 1 12 0" />
      <path d="M9 16.5a5 5 0 0 1 6 0" />
      <circle cx="12" cy="19.5" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function WeddingIcon({ size, className }: IconProps) {
  return (
    <svg {...baseProps(size, className)}>
      {/* Interlocked rings, one set with a stone. */}
      <circle cx="9" cy="15" r="5" />
      <circle cx="15" cy="15" r="5" />
      <path d="M7.5 7.5L9 5.5l1.5 2L9 10z" />
    </svg>
  );
}

export function MeetingIcon({ size, className }: IconProps) {
  return (
    <svg {...baseProps(size, className)}>
      {/* Presentation screen on a stand. */}
      <rect x="4" y="4.5" width="16" height="10" rx="0.8" />
      <path d="M12 14.5V18" />
      <path d="M8.5 20.5L12 18l3.5 2.5" />
      <path d="M8 11l2.5-2.5 2 2 3.5-3.5" />
    </svg>
  );
}

export function SocialIcon({ size, className }: IconProps) {
  return (
    <svg {...baseProps(size, className)}>
      {/* Two flutes raised in a toast. */}
      <path d="M6.5 4l-1 6a3 3 0 0 0 5.6 1.2L9.5 4z" />
      <path d="M8 13v6" />
      <path d="M5.5 19.5h5" />
      <path d="M17.5 4l1 6a3 3 0 0 1-5.6 1.2L14.5 4z" />
      <path d="M16 13v6" />
      <path d="M13.5 19.5h5" />
    </svg>
  );
}

export function CorporateIcon({ size, className }: IconProps) {
  return (
    <svg {...baseProps(size, className)}>
      {/* Award trophy. */}
      <path d="M8 4h8v5a4 4 0 0 1-8 0z" />
      <path d="M8 5.5H5.5a2.5 2.5 0 0 0 2.6 3.4" />
      <path d="M16 5.5h2.5a2.5 2.5 0 0 1-2.6 3.4" />
      <path d="M12 13v4" />
      <path d="M8.5 20h7" />
      <path d="M9.5 17h5v3h-5z" />
    </svg>
  );
}

export function CloseIcon({ size, className }: IconProps) {
  return (
    <svg {...baseProps(size, className)}>
      <path d="M5 5l14 14" />
      <path d="M19 5L5 19" />
    </svg>
  );
}
