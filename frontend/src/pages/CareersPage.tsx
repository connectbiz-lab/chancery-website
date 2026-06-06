import { Link } from "react-router-dom";
import { Hero } from "@/components/Hero";
import { Loading } from "@/components/Loading";
import { PageMeta } from "@/components/PageMeta";
import { api, useAsync } from "@/lib/api";
import "./pages.css";

const PILLARS = [
  ["Hospitality", "Service shaped by decades of welcoming Bangalore's most discerning guests."],
  ["Craft", "Kitchens, banqueting, front office — every role is treated as a craft."],
  ["Growth", "Structured paths for career growth across the Chancery Group."],
];

export function CareersPage() {
  const page = useAsync(() => api.page("careers"), []);
  if (page.loading) return <Loading />;
  const p = page.data;

  return (
    <>
      <PageMeta title={p?.meta_title ?? "Careers"} description={p?.meta_description} />
      <Hero
        image={p?.hero_image ?? null}
        eyebrow={p?.hero_eyebrow ?? "Careers"}
        heading={p?.hero_heading ?? "Build a career with us"}
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
          <div className="section-head">
            <p className="eyebrow center">What we look for</p>
            <h2 className="h1">Three things we hire for</h2>
          </div>
          <div className="card-grid three">
            {PILLARS.map(([title, body]) => (
              <div key={title} className="card" style={{ textAlign: "center", alignItems: "center" }}>
                <h3 style={{ marginBottom: "0.75rem" }}>{title}</h3>
                <p className="copy" style={{ maxWidth: "32ch" }}>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-navy tight">
        <div className="container narrow text-center">
          <p className="eyebrow center" style={{ color: "var(--c-gold-soft)" }}>Apply</p>
          <h2 className="h2" style={{ color: "var(--c-ivory)" }}>Write to our HR team</h2>
          <p className="lede" style={{ color: "rgba(246,241,231,0.85)" }}>
            Send a one-page CV and a short note about the role you're interested in.
            Tell us a little about the kind of hospitality you'd like to be part of.
          </p>
          <Link to="/pavilion/contact-us" className="btn light">Send your application</Link>
        </div>
      </section>
    </>
  );
}
