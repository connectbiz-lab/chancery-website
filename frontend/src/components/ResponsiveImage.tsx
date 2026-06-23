import type { CSSProperties } from "react";

/**
 * Renders an optimized image. The backend stores every photo as a WebP master
 * (`name.webp`) plus a fixed ladder of responsive variants (`name-480.webp`,
 * `name-960.webp`, `name-1600.webp`) — always present — so we can derive the
 * `srcset` from the master URL with no extra API field.
 *
 * Use `eager` for the above-the-fold LCP image (hero); everything else
 * lazy-loads by default.
 */

const WIDTHS = [480, 960, 1600] as const;

function buildSrcSet(src: string): string | undefined {
  if (!src.endsWith(".webp")) return undefined; // SVG logos etc. — single src
  const base = src.slice(0, -".webp".length);
  return WIDTHS.map((w) => `${base}-${w}.webp ${w}w`).join(", ");
}

interface Props {
  src: string | null;
  alt: string;
  /** Maps layout width to the browser for variant selection. Defaults to full-bleed. */
  sizes?: string;
  /** Above-the-fold LCP image: eager + high priority instead of lazy. */
  eager?: boolean;
  className?: string;
  style?: CSSProperties;
}

export function ResponsiveImage({
  src,
  alt,
  sizes = "100vw",
  eager = false,
  className,
  style,
}: Props) {
  if (!src) return null;
  const srcSet = buildSrcSet(src);
  return (
    <img
      src={src}
      srcSet={srcSet}
      sizes={srcSet ? sizes : undefined}
      alt={alt}
      className={className}
      style={style}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      fetchPriority={eager ? "high" : "auto"}
    />
  );
}
