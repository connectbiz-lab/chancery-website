import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { EventEnquiryModal } from "@/components/EventEnquiryModal";
import { Hero } from "@/components/Hero";
import { Loading } from "@/components/Loading";
import { PageMeta } from "@/components/PageMeta";
import { ResponsiveImage } from "@/components/ResponsiveImage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { api, useAsync } from "@/lib/api";
import type { HotelSlug } from "@/lib/types";
import "./pages.css";
import "./VenueDetailPage.css";

const KINDS: Record<string, string> = {
  ballroom: "Ballroom",
  banquet: "Banquet",
  conference: "Conference Suite",
  private_dining: "Private Dining",
  executive: "Executive Boardroom",
  al_fresco: "Al Fresco",
  divisible: "Divisible Hall",
};

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

export function VenueDetailPage({ hotel }: { hotel: HotelSlug }) {
  const { venue: slug } = useParams<{ venue: string }>();
  const venues = useAsync(() => api.venues(hotel), [hotel]);
  const [enquire, setEnquire] = useState(false);

  if (venues.loading) return <Loading />;
  const v = venues.data?.find((x) => x.slug === slug);
  if (!v) return <NotFoundPage />;

  const facts: Array<[string, string]> = [
    v.area_sqft ? ["Area", `${v.area_sqft.toLocaleString()} sq. ft.`] : null,
    v.dimensions ? ["Dimensions", v.dimensions] : null,
    v.ceiling_ft ? ["Ceiling", `${v.ceiling_ft} ft`] : null,
    v.guests_max ? ["Max guests", `${v.guests_max}`] : null,
  ].filter(Boolean) as Array<[string, string]>;

  const capacities: Array<[string, number]> = [
    ["Theatre", v.cap_theatre],
    ["Banquet", v.cap_banquet],
    ["Classroom", v.cap_classroom],
    ["U-Shape", v.cap_ushape],
    ["Cocktail / Reception", v.cap_cocktail],
  ].filter(([, n]) => n != null) as Array<[string, number]>;

  const pricing: Array<[string, number]> = [
    ["Half day", v.half_day_inr],
    ["Full day", v.full_day_inr],
    ["Per plate", v.per_plate_inr],
  ].filter(([, n]) => n != null) as Array<[string, number]>;

  const gallery = v.images.length > 0 ? v.images : (v.hero_image ? [{ image: v.hero_image, alt: v.name, order: 0 }] : []);

  return (
    <>
      <PageMeta title={`${v.name} — ${v.hotel.name}`} description={v.description} />
      <Hero
        image={v.hero_image}
        eyebrow={
          <span className="hero-eyebrow-stack">
            <span>{v.hotel.name}</span>
            <span>{KINDS[v.kind] || "Event Space"}</span>
          </span>
        }
        heading={v.name}
        size="page"
      />

      <section className="section">
        <div className="container">
          <Link to={`/${hotel}/plan-your-event`} className="link-arrow back">← All event spaces</Link>

          <div className="venue-detail">
            <div className="venue-detail__main">
              <p className="eyebrow">{KINDS[v.kind] || "Event Space"}</p>
              <h2 className="h2">{v.name}</h2>
              {v.description && <p className="lede">{v.description}</p>}

              {facts.length > 0 && (
                <ul className="venue-facts">
                  {facts.map(([k, val]) => (
                    <li key={k}><span className="vf-label">{k}</span><span className="vf-value">{val}</span></li>
                  ))}
                </ul>
              )}
            </div>

            <aside className="venue-detail__aside">
              {capacities.length > 0 && (
                <div className="venue-panel">
                  <h3 className="vp-title">Capacity by layout</h3>
                  <table className="venue-cap">
                    <tbody>
                      {capacities.map(([label, n]) => (
                        <tr key={label}><th>{label}</th><td>{n}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {pricing.length > 0 && (
                <div className="venue-panel">
                  <h3 className="vp-title">Indicative pricing</h3>
                  <table className="venue-cap">
                    <tbody>
                      {pricing.map(([label, n]) => (
                        <tr key={label}><th>{label}</th><td>{inr(n)}</td></tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="vp-note">Final pricing depends on dates, menu and setup.</p>
                </div>
              )}
              <button type="button" className="btn" onClick={() => setEnquire(true)}>
                Enquire about this space
              </button>
            </aside>
          </div>

          {gallery.length > 0 && (
            <div className="venue-gallery">
              {gallery.map((img, i) => (
                <div className="figure" key={i}>
                  <ResponsiveImage src={img.image} alt={img.alt || v.name} sizes="(max-width: 768px) 100vw, 33vw" />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <EventEnquiryModal open={enquire} onClose={() => setEnquire(false)} hotel={hotel} venue={v.name} />
    </>
  );
}
