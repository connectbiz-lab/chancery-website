import type { CSSProperties, ReactNode } from "react";
import { buildSynxisUrl, type BookingParams } from "@/lib/booking";

interface BookButtonProps extends BookingParams {
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}

/**
 * CTA that opens the SynXis booking engine in a NEW TAB so the Chancery
 * tab stays put. Replaces the prior <Link to="/book?..."> pattern which
 * navigated the same tab through BookRedirect.tsx and made it hard for
 * guests to return to the site. The /book route still exists as a
 * fallback for direct URLs (marketing emails, shared links).
 */
export function BookButton({ className, style, children, ...booking }: BookButtonProps) {
  const url = buildSynxisUrl(booking);
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      style={style}
    >
      {children}
    </a>
  );
}
