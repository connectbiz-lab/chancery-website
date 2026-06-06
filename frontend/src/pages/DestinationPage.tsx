import { Link } from "react-router-dom";
import { Hero } from "@/components/Hero";
import { Loading } from "@/components/Loading";
import { PageMeta } from "@/components/PageMeta";
import { api, useAsync } from "@/lib/api";
import type { HotelSlug } from "@/lib/types";
import "./pages.css";

const NEIGHBOURHOOD_LIST: Record<HotelSlug, Array<[string, string]>> = {
  chancery: [
    ["Cubbon Park", "5 min drive — 100-acre heritage park in the heart of the city."],
    ["MG Road", "10 min — shopping, dining and Bangalore's most storied promenade."],
    ["Vidhana Soudha", "10 min — the iconic seat of Karnataka's legislature."],
    ["Bangalore Palace", "15 min — Tudor-style royal residence and event grounds."],
    ["UB City", "12 min — luxury shopping and rooftop dining."],
    ["Kempegowda Intl. Airport", "60 min via Bellary Road or NICE Road."],
  ],
  pavilion: [
    ["Cubbon Park", "5 min walk — visible from upper-floor suites."],
    ["MG Road & Brigade Road", "5 min — central shopping and entertainment."],
    ["Vidhana Soudha", "8 min — Karnataka's legislative landmark."],
    ["Karnataka Chitrakala Parishath", "15 min — the city's premier art gallery complex."],
    ["UB City", "10 min — luxury retail, fine dining."],
    ["Kempegowda Intl. Airport", "60 min via NICE Road or Bellary Road."],
  ],
};

export function DestinationPage({ hotel }: { hotel: HotelSlug }) {
  const page = useAsync(() => api.page("destination", hotel), [hotel]);
  const h = useAsync(() => api.hotel(hotel), [hotel]);
  if (page.loading || h.loading) return <Loading />;
  const p = page.data;
  const hotelData = h.data!;

  const list = NEIGHBOURHOOD_LIST[hotel];

  return (
    <>
      <PageMeta title={p?.meta_title ?? "Destination"} description={p?.meta_description} />
      <Hero
        image={p?.hero_image ?? hotelData.hero_image}
        eyebrow={p?.hero_eyebrow}
        heading={p?.hero_heading ?? hotelData.location}
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
            <p className="eyebrow">Around the hotel</p>
            <h2 className="h2">A neighbourhood at your doorstep</h2>
          </div>
          <ul className="amenities" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
            {list.map(([name, note]) => (
              <li key={name}>
                <span style={{ display: "block" }}>
                  <strong style={{ fontFamily: "var(--f-display)", fontSize: "1.15rem", color: "var(--c-navy)", display: "block", marginBottom: "0.25rem" }}>{name}</strong>
                  <span style={{ color: "var(--c-muted)" }}>{note}</span>
                </span>
              </li>
            ))}
          </ul>
          <p className="text-center" style={{ marginTop: "3rem" }}>
            <Link to={`/book?hotel=${hotel}`} className="btn">Book your stay</Link>
          </p>
        </div>
      </section>
    </>
  );
}
