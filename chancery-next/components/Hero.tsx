import type { ReactNode } from "react";
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
}: HeroProps) {
  const cls = ["hero", `hero-${size}`, `hero-align-${align}`].join(" ");
  return (
    <section className={cls} role="banner">
      {image && (
        <div className="hero-bg" aria-hidden="true">
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
