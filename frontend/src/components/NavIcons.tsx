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

export function CloseIcon({ size, className }: IconProps) {
  return (
    <svg {...baseProps(size, className)}>
      <path d="M5 5l14 14" />
      <path d="M19 5L5 19" />
    </svg>
  );
}
