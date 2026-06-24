import type { CSSProperties, ReactNode } from "react";
import { Media } from "./Media";
import "./Hero.css";

interface HeroProps {
  image: string | null;
  eyebrow?: ReactNode;
  heading: string;
  subheading?: string;
  size?: "full" | "page" | "compact";
  align?: "left" | "center";
  children?: ReactNode;
  /** Optional row pinned at the very bottom of the hero (e.g. icon shortcuts). */
  footerNav?: ReactNode;
  /** CSS object-position for the background crop. Defaults to `center top`;
   *  override per page when the photo's subject sits lower (e.g. `center 60%`). */
  focal?: string;
  /** Two background images shown side by side (a diptych) instead of one — used
   *  on the group home to feature both hotels behind the shared heading. */
  splitImages?: [string | null, string | null];
}

export function Hero({
  image,
  eyebrow,
  heading,
  subheading,
  size = "page",
  align = "center",
  children,
  footerNav,
  focal,
  splitImages,
}: HeroProps) {
  const cls = ["hero", `hero-${size}`, `hero-align-${align}`].join(" ");
  return (
    <section className={cls} role="banner">
      {splitImages ? (
        <div className="hero-bg hero-split" aria-hidden="true">
          <div className="hero-split-half">
            <Media path={splitImages[0]} alt="" priority sizes="50vw" />
          </div>
          <div className="hero-split-half">
            <Media path={splitImages[1]} alt="" priority sizes="50vw" />
          </div>
          <div className="hero-overlay" />
        </div>
      ) : image && (
        <div
          className="hero-bg"
          aria-hidden="true"
          style={focal ? ({ "--hero-focal": focal } as CSSProperties) : undefined}
        >
          <Media path={image} alt={heading} priority sizes="100vw" />
          <div className="hero-overlay" />
        </div>
      )}
      <div className="hero-inner container narrow">
        {eyebrow && <p className={`eyebrow ${align === "center" ? "center" : ""}`}>{eyebrow}</p>}
        <h1 className={size === "full" ? "display" : "h1"}>{heading}</h1>
        {subheading && <p className="hero-sub">{subheading}</p>}
        {children && <div className="hero-children">{children}</div>}
      </div>
      {footerNav && <div className="hero-footer-nav">{footerNav}</div>}
    </section>
  );
}
