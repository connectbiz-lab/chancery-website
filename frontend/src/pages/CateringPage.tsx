import { Link } from "react-router-dom";
import { Hero } from "@/components/Hero";
import { Loading } from "@/components/Loading";
import { PageMeta } from "@/components/PageMeta";
import { api, useAsync } from "@/lib/api";
import "./pages.css";

const OCCASIONS = [
  ["Weddings & receptions", "Multi-cuisine menus crafted around your traditions."],
  ["Corporate events", "Lunch, dinner and cocktail catering for offices and venues."],
  ["Private celebrations", "Anniversaries, milestones, milestone family gatherings."],
  ["Premium cocktail experiences", "Curated bar service from our beverage team."],
];

export function CateringPage() {
  const page = useAsync(() => api.page("catering"), []);
  if (page.loading) return <Loading />;
  const p = page.data;

  return (
    <>
      <PageMeta title={p?.meta_title ?? "Outdoor catering"} description={p?.meta_description} />
      <Hero
        image={p?.hero_image ?? null}
        eyebrow={p?.hero_eyebrow ?? "Outdoor catering"}
        heading={p?.hero_heading ?? "Chancery hospitality, wherever you celebrate"}
        subheading={p?.hero_subheading}
        size="page"
      />
      <section className="section">
        <div className="container narrow">
          {p?.intro_body && <p className="lede">{p.intro_body}</p>}
        </div>
      </section>

      <section className="section bg-ivory">
        <div className="container">
          <div className="section-head left">
            <p className="eyebrow">We cater for</p>
            <h2 className="h2">Occasions of every scale</h2>
          </div>
          <ul className="amenities" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
            {OCCASIONS.map(([title, body]) => (
              <li key={title}>
                <span style={{ display: "block" }}>
                  <strong style={{ fontFamily: "var(--f-display)", fontSize: "1.15rem", color: "var(--c-navy)", display: "block", marginBottom: "0.25rem" }}>{title}</strong>
                  <span style={{ color: "var(--c-muted)" }}>{body}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section bg-navy tight">
        <div className="container narrow text-center">
          <p className="eyebrow center" style={{ color: "var(--c-gold-soft)" }}>Request a proposal</p>
          <h2 className="h2" style={{ color: "var(--c-ivory)" }}>Tell us about your event</h2>
          <Link to="/pavilion/contact-us" className="btn light">Contact our catering team</Link>
        </div>
      </section>
    </>
  );
}
