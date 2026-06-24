import { useCallback, useState } from "react";
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

/**
 * The variant URL the browser would pick for a full-bleed (`sizes="100vw"`)
 * image at the current viewport — i.e. exactly what a `<Hero>` `<img>` requests.
 *
 * Use this for `rel="prefetch"` of an upcoming hero: prefetch ignores
 * `imagesrcset` (only `preload` honours it), so prefetching the bare master
 * warms a cache key the destination never requests. Prefetching the computed
 * variant warms the exact entry, so navigation paints from cache.
 */
export function fullBleedVariant(src: string): string {
  if (!src.endsWith(".webp") || typeof window === "undefined") return src;
  const base = src.slice(0, -".webp".length);
  const need = window.innerWidth * (window.devicePixelRatio || 1);
  const w = WIDTHS.find((x) => x >= need) ?? WIDTHS[WIDTHS.length - 1];
  return `${base}-${w}.webp`;
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
  const [loaded, setLoaded] = useState(false);
  // Fade lazy images in once decoded so they don't pop/flash against the
  // figure's placeholder background. The hero (eager) renders instantly to
  // protect LCP. Seed `loaded` from `img.complete` so browser-cached images
  // (which may not fire onLoad) are never stuck invisible.
  const markIfCached = useCallback((img: HTMLImageElement | null) => {
    if (img?.complete) setLoaded(true);
  }, []);

  if (!src) return null;
  const srcSet = buildSrcSet(src);
  const fade = !eager;
  const cls = [className, fade ? "imgfade" : "", fade && loaded ? "is-loaded" : ""]
    .filter(Boolean)
    .join(" ");
  return (
    <img
      ref={fade ? markIfCached : undefined}
      src={src}
      srcSet={srcSet}
      sizes={srcSet ? sizes : undefined}
      alt={alt}
      className={cls || undefined}
      style={style}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      fetchPriority={eager ? "high" : "auto"}
      onLoad={fade ? () => setLoaded(true) : undefined}
    />
  );
}
