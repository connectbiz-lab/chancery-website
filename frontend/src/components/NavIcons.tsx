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
      {/* Two-tower silhouette with windows */}
      <path d="M3 21h18" />
      <path d="M5 21V8l4-3v16" />
      <path d="M15 21V5l4 3v13" />
      <path d="M7 11h0M7 14h0M7 17h0" />
      <path d="M17 11h0M17 14h0M17 17h0" />
    </svg>
  );
}

export function DiningIcon({ size, className }: IconProps) {
  return (
    <svg {...baseProps(size, className)}>
      {/* Wine glass + plate */}
      <path d="M9 3v6a3 3 0 0 0 3 3 3 3 0 0 0 3-3V3" />
      <path d="M12 12v8" />
      <path d="M9 21h6" />
    </svg>
  );
}

export function EventsIcon({ size, className }: IconProps) {
  return (
    <svg {...baseProps(size, className)}>
      {/* 4-point star/sparkle */}
      <path d="M12 3v18" />
      <path d="M3 12h18" />
      <path d="M5.5 5.5l13 13" />
      <path d="M18.5 5.5l-13 13" />
    </svg>
  );
}

export function OffersIcon({ size, className }: IconProps) {
  return (
    <svg {...baseProps(size, className)}>
      {/* Tag */}
      <path d="M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9-9-9z" />
      <circle cx="7.5" cy="7.5" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function GalleryIcon({ size, className }: IconProps) {
  return (
    <svg {...baseProps(size, className)}>
      {/* Image frame + landscape */}
      <rect x="3" y="4" width="18" height="16" rx="0.5" />
      <circle cx="8.5" cy="9.5" r="1.2" />
      <path d="M3 17l5-5 4 4 3-3 6 6" />
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
