import { Helmet } from "react-helmet-async";

interface PageMetaProps {
  title: string;
  description?: string;
  /** Hide from search engines (admin/staff-only pages). */
  noindex?: boolean;
  ogImage?: string | null;
}

export function PageMeta({ title, description, noindex, ogImage }: PageMetaProps) {
  const fullTitle = title.includes("Chancery") ? title : `${title} | Chancery Hotels`;
  return (
    <Helmet>
      <title>{fullTitle}</title>
      {description && <meta name="description" content={description} />}
      {description && <meta property="og:description" content={description} />}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="Chancery Hotels" />
      {ogImage && <meta property="og:image" content={ogImage} />}
      {noindex && <meta name="robots" content="noindex, nofollow" />}
    </Helmet>
  );
}
