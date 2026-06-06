import { Link } from "react-router-dom";
import { Hero } from "@/components/Hero";
import { Loading } from "@/components/Loading";
import { PageMeta } from "@/components/PageMeta";
import { api, useAsync } from "@/lib/api";
import type { HotelSlug, Venue } from "@/lib/types";
import "./pages.css";
import "./EventsPage.css";

export function EventsPage({ hotel }: { hotel: HotelSlug }) {
  const page = useAsync(() => api.page("events", hotel), [hotel]);
  const h = useAsync(() => api.hotel(hotel), [hotel]);
  const venues = useAsync(() => api.venues(hotel), [hotel]);

  if (page.loading || venues.loading || h.loading) return <Loading />;
  const p = page.data;

  return (
    <>
      <PageMeta title={p?.meta_title ?? "Plan your event"} description={p?.meta_description} />
      <Hero
        image={p?.hero_image ?? h.data?.hero_image ?? null}
        eyebrow={p?.hero_eyebrow}
        heading={p?.hero_heading ?? "Plan your event"}
        subheading={p?.hero_subheading}
        size="page"
      />
      <section className="section">
        <div className="container">
          {p?.intro_body && (
            <div className="section-head">
              <p className="lede">{p.intro_body}</p>
            </div>
          )}
          <div className="venues-grid">
            {venues.data?.map((v) => <VenueCard key={v.id} v={v} />)}
          </div>
        </div>
      </section>

      <section className="section bg-navy tight">
        <div className="container narrow text-center">
          <p className="eyebrow center" style={{ color: "var(--c-gold-soft)" }}>Plan with us</p>
          <h2 className="h2" style={{ color: "var(--c-ivory)" }}>
            Tell us about your occasion
          </h2>
          <p className="lede" style={{ color: "rgba(246,241,231,0.85)" }}>
            Our events team will craft a tailored proposal for your celebration —
            from intimate dinners to grand weddings.
          </p>
          <Link to={`/${hotel}/contact-us`} className="btn light">Contact our events team</Link>
        </div>
      </section>
    </>
  );
}

const KINDS: Record<string, string> = {
  ballroom: "Ballroom",
  banquet: "Banquet",
  conference: "Conference Suite",
  private_dining: "Private Dining",
  executive: "Executive Boardroom",
  al_fresco: "Al Fresco",
  divisible: "Divisible Hall",
};

function VenueCard({ v }: { v: Venue }) {
  return (
    <article className="venue-card">
      <div className="figure">
        {v.hero_image ? <img src={v.hero_image} alt={v.name} /> : <div className="figure-placeholder" />}
      </div>
      <div className="venue-body">
        <p className="card-eyebrow">{KINDS[v.kind] || v.kind || "Venue"}</p>
        <h3>{v.name}</h3>
        <p className="meta">
          {v.guests_max && <span>Up to {v.guests_max} guests</span>}
          {v.area_sqft && <span> · {v.area_sqft.toLocaleString()} sq. ft.</span>}
        </p>
        <p className="copy">{v.description}</p>
        <VenueCapacities v={v} />
      </div>
    </article>
  );
}

function VenueCapacities({ v }: { v: Venue }) {
  const rows: Array<[string, number | null]> = [
    ["Theatre", v.cap_theatre],
    ["Banquet", v.cap_banquet],
    ["Classroom", v.cap_classroom],
    ["U-Shape", v.cap_ushape],
    ["Cocktail", v.cap_cocktail],
  ].filter(([, n]) => n != null) as Array<[string, number]>;
  if (rows.length === 0) return null;
  return (
    <table className="capacity-table" aria-label={`${v.name} capacities`}>
      <tbody>
        {rows.map(([label, n]) => (
          <tr key={label}>
            <th>{label}</th>
            <td>{n}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
