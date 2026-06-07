import { Link } from "react-router-dom";
import { Hero } from "@/components/Hero";
import { PageMeta } from "@/components/PageMeta";
import { api, useAsync } from "@/lib/api";
import "./pages.css";

const HOTEL_PAGES: Array<[string, string]> = [
  ["accommodation", "Accommodation"],
  ["dining", "Dining"],
  ["plan-your-event", "Plan your event"],
  ["special-offers", "Special offers"],
  ["gallery", "Gallery"],
  ["contact-us", "Contact us"],
  ["destination", "Destination"],
];

const SITE_PAGES: Array<[string, string]> = [
  ["/", "Home"],
  ["/rooms", "All rooms"],
  ["/faq", "FAQ"],
  ["/careers", "Careers"],
  ["/catering", "Outdoor catering"],
  ["/book", "Book your stay"],
  ["/privacy", "Privacy policy"],
  ["/terms", "Terms & conditions"],
  ["/accessibility-statement", "Accessibility statement"],
];

export function SiteMapPage() {
  const page = useAsync(() => api.page("sitemap"), []);
  const hotels = useAsync(() => api.hotels(), []);
  const p = page.data;
  return (
    <>
      <PageMeta title={p?.meta_title ?? "Site map"} description={p?.meta_description} />
      <Hero
        image={p?.hero_image ?? null}
        eyebrow={p?.hero_eyebrow ?? "Index"}
        heading={p?.hero_heading ?? "Site map"}
        size="compact"
      />
      <section className="section">
        <div className="container narrow">
          <div className="sitemap-columns" style={{ display: "grid", gap: "3rem", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
            <div>
              <p className="eyebrow">Brand</p>
              <ul className="list-clean" style={{ display: "grid", gap: "0.5rem" }}>
                {SITE_PAGES.map(([to, label]) => (
                  <li key={to}><Link to={to}>{label}</Link></li>
                ))}
              </ul>
            </div>
            {hotels.data?.map((h) => (
              <div key={h.slug}>
                <p className="eyebrow">{h.short_name}</p>
                <ul className="list-clean" style={{ display: "grid", gap: "0.5rem" }}>
                  <li><Link to={`/${h.slug}`}>{h.short_name} home</Link></li>
                  {HOTEL_PAGES.map(([slug, label]) => (
                    <li key={slug}><Link to={`/${h.slug}/${slug}`}>{label}</Link></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
