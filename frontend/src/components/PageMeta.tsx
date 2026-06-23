import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";

// Absolute base for canonical / og:url / default share image. Update this here
// (and in index.html) when the site moves to a custom domain.
export const SITE_URL = "https://chancery-website-v2.vercel.app";
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-cover.jpg`;

interface PageMetaProps {
  title: string;
  description?: string;
  /** Hide from search engines (admin/staff-only pages). */
  noindex?: boolean;
  ogImage?: string | null;
}

export function PageMeta({ title, description, noindex, ogImage }: PageMetaProps) {
  const fullTitle = title.includes("Chancery") ? title : `${title} | Chancery Hotels`;
  const { pathname } = useLocation();
  const canonical = SITE_URL + (pathname === "/" ? "" : pathname.replace(/\/$/, ""));
  const image = ogImage || DEFAULT_OG_IMAGE;
  return (
    <Helmet>
      <title>{fullTitle}</title>
      {description && <meta name="description" content={description} />}
      <link rel="canonical" href={canonical} />
      <meta name="robots" content={noindex ? "noindex, nofollow" : "index, follow"} />

      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="Chancery Hotels" />
      <meta property="og:title" content={fullTitle} />
      {description && <meta property="og:description" content={description} />}
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={image} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      {description && <meta name="twitter:description" content={description} />}
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
}
