import { Link } from "react-router-dom";
import { BookButton } from "@/components/BookButton";
import { Hero } from "@/components/Hero";
import { HeroIconNav } from "@/components/HeroIconNav";
import { Loading } from "@/components/Loading";
import { PageMeta } from "@/components/PageMeta";
import { ResponsiveImage } from "@/components/ResponsiveImage";
import { api, useAsync } from "@/lib/api";
import { useReveal } from "@/lib/reveal";
import type { HotelSlug } from "@/lib/types";
import "./pages.css";
import "./HotelHomePage.css";

export function HotelHomePage({ hotel }: { hotel: HotelSlug }) {
  const page = useAsync(() => api.page("hotel_home", hotel), [hotel]);
  const h = useAsync(() => api.hotel(hotel), [hotel]);
  const rooms = useAsync(() => api.rooms(hotel), [hotel]);
  const restaurants = useAsync(() => api.restaurants(hotel), [hotel]);
  const venues = useAsync(() => api.venues(hotel), [hotel]);
  const offers = useAsync(() => api.offers(hotel), [hotel]);
  const gallery = useAsync(() => api.gallery(hotel), [hotel]);

  const introRef = useReveal<HTMLDivElement>();
  const aboutRef = useReveal<HTMLDivElement>();

  const hotelData = h.data;
  const pageData = page.data;
  // Slug → human name fallback so the Hero shell can render the moment the
  // route mounts, without waiting on /api/hotels/<slug>/. The CMS still
  // overwrites these once the API resolves; this only fills the loading gap.
  const HOTEL_NAME_FALLBACK: Record<HotelSlug, string> = {
    chancery: "The Chancery Hotel",
    pavilion: "The Chancery Pavilion",
  };
  const heroHeading = hotelData?.name ?? HOTEL_NAME_FALLBACK[hotel];
  const heroEyebrow = hotelData
    ? `${hotelData.location_tag} · ${hotelData.location}`
    : "Bangalore";

  return (
    <>
      <PageMeta
        title={pageData?.meta_title ?? hotelData?.name ?? heroHeading}
        description={pageData?.meta_description ?? hotelData?.tagline}
      />

      <Hero
        image={hotelData?.hero_image ?? null}
        eyebrow={heroEyebrow}
        heading={heroHeading}
        subheading={hotelData?.address}
        size="full"
        align="center"
        footerNav={<HeroIconNav scope={hotel} />}
      >
        <BookButton hotel={hotel} className="btn gold">Book your stay</BookButton>
        <a href="#rooms" className="btn light">Explore rooms</a>
      </Hero>

      {!hotelData && <Loading />}

      {hotelData && (
        <>
          {/* Stats / intro */}
          <section className="section bg-cream">
            <div ref={introRef} className="container reveal">
              <div className="section-head">
                <p className="eyebrow center">{hotelData.name}</p>
                <h2 className="display">
                  {pageData?.intro_body ? hotelData.intro_heading || hotelData.tagline : hotelData.tagline}
                </h2>
                <p className="lede">{pageData?.intro_body ?? hotelData.intro_body}</p>
              </div>

              <div className="stat-row three">
                <div className="stat">
                  <span className="stat-num">{hotelData.rooms_count}</span>
                  <span className="stat-label">Rooms & suites</span>
                </div>
                <div className="stat">
                  <span className="stat-num">{restaurants.data?.length ?? "—"}</span>
                  <span className="stat-label">Restaurants</span>
                </div>
                <div className="stat">
                  <span className="stat-num">{venues.data?.length ?? "—"}</span>
                  <span className="stat-label">Event venues</span>
                </div>
              </div>
            </div>
          </section>

          {/* About — image + text */}
          <section className="section bg-ivory">
            <div ref={aboutRef} className="container reveal">
              <div className="editorial-row">
                <div className="editorial-figure">
                  <div className="figure aspect-port">
                    {hotelData.about_image && <ResponsiveImage src={hotelData.about_image} alt={hotelData.name} sizes="(max-width: 768px) 100vw, 50vw" />}
                  </div>
                </div>
                <div className="editorial-text">
                  <p className="eyebrow">Heritage & service</p>
                  <h2 className="h2">A welcome that has lasted generations</h2>
                  <p className="lede">
                    {hotelData.intro_body}
                  </p>
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      {/* Rooms preview — anchor target for the hero "Explore rooms" button. */}
      {rooms.data && rooms.data.length > 0 && (
        <section id="rooms" className="section bg-cream" style={{ scrollMarginTop: "120px" }}>
          <div className="container">
            <div className="section-head">
              <p className="eyebrow center">Stay</p>
              <h2 className="h1">Rooms & suites</h2>
              <p className="lede">
                Spaces of quiet luxury — designed for travellers who notice the details.
              </p>
            </div>
            <div className="card-grid three">
              {rooms.data.slice(0, 3).map((r) => (
                <Link key={r.id} to={`/${hotel}/accommodation`} className="card">
                  <div className="figure">{r.hero_image && <ResponsiveImage src={r.hero_image} alt={r.name} sizes="(max-width: 768px) 50vw, 25vw" />}</div>
                  <h3>{r.name}</h3>
                  <p className="meta">{r.size_sqft ? `${r.size_sqft} sq. ft.` : ""} · {r.bed_type}</p>
                  <p className="copy">{r.description.slice(0, 120)}…</p>
                </Link>
              ))}
            </div>
            <div className="text-center" style={{ marginTop: "3rem" }}>
              <Link to={`/${hotel}/accommodation`} className="btn ghost">View all rooms</Link>
            </div>
          </div>
        </section>
      )}

      {/* Dining preview */}
      {restaurants.data && restaurants.data.length > 0 && (
        <section className="section bg-ivory">
          <div className="container">
            <div className="section-head">
              <p className="eyebrow center">Dining</p>
              <h2 className="h1">Tables of distinction</h2>
            </div>
            <div className="card-grid three">
              {restaurants.data.map((r) => (
                <Link key={r.id} to={`/${hotel}/dining`} className="card">
                  <div className="figure">{r.hero_image && <ResponsiveImage src={r.hero_image} alt={r.name} sizes="(max-width: 768px) 50vw, 25vw" />}</div>
                  <h3>{r.name}</h3>
                  <p className="meta">{r.cuisine}</p>
                  <p className="copy">{r.description.slice(0, 130)}…</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Venue / events teaser */}
      {venues.data && venues.data.length > 0 && (
        <section className="section bg-navy">
          <div className="container">
            <div className="section-head">
              <p className="eyebrow center" style={{ color: "var(--c-gold-soft)" }}>Plan your event</p>
              <h2 className="h1" style={{ color: "var(--c-ivory)" }}>
                {hotel === "pavilion" ? "From boardrooms to ballrooms" : "Celebrations at a Lavelle address"}
              </h2>
              <p className="lede" style={{ color: "rgba(246,241,231,0.85)" }}>
                {venues.data.length} distinctive venues — each one engineered for the kind of occasion you have in mind.
              </p>
            </div>
            <div className="text-center">
              <Link to={`/${hotel}/plan-your-event`} className="btn light">Explore venues</Link>
            </div>
          </div>
        </section>
      )}

      {/* Offers teaser */}
      {offers.data && offers.data.length > 0 && (
        <section className="section bg-cream">
          <div className="container">
            <div className="section-head">
              <p className="eyebrow center">Offers</p>
              <h2 className="h1">Curated packages</h2>
            </div>
            <div className="card-grid three">
              {offers.data.slice(0, 3).map((o) => (
                <div key={o.id} className="card">
                  <div className="figure">{o.image && <ResponsiveImage src={o.image} alt={o.title} sizes="(max-width: 768px) 100vw, 33vw" />}</div>
                  <p className="card-eyebrow">{o.tag}</p>
                  <h3>{o.title}</h3>
                  <p className="copy">{o.description}</p>
                  <BookButton hotel={hotel} promo={o.promo_code || undefined} className="link-arrow">Book</BookButton>
                </div>
              ))}
            </div>
            <div className="text-center" style={{ marginTop: "3rem" }}>
              <Link to={`/${hotel}/special-offers`} className="btn ghost">All offers</Link>
            </div>
          </div>
        </section>
      )}

      {/* Gallery preview */}
      {gallery.data && gallery.data.length > 0 && (
        <section className="section bg-ivory tight">
          <div className="container">
            <div className="section-head left">
              <p className="eyebrow">Gallery</p>
              <h2 className="h2">Inside {hotelData?.short_name ?? heroHeading}</h2>
            </div>
            <div className="image-grid">
              {gallery.data.slice(0, 6).map((g) => (
                <Link key={g.id} to={`/${hotel}/gallery`} className="figure">
                  <ResponsiveImage src={g.image} alt={g.alt} sizes="(max-width: 768px) 50vw, 33vw" />
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact teaser */}
      {hotelData && (
        <section className="section bg-navy tight">
          <div className="container narrow text-center">
            <p className="eyebrow center" style={{ color: "var(--c-gold-soft)" }}>Reach the team</p>
            <h2 className="h2" style={{ color: "var(--c-ivory)" }}>{hotelData.address}</h2>
            <p className="lede" style={{ color: "rgba(246,241,231,0.85)" }}>
              <a href={`tel:${hotelData.phone.replace(/\s+/g, "")}`} style={{ color: "var(--c-ivory)" }}>{hotelData.phone}</a>
              {" · "}
              <a href={`mailto:${hotelData.email}`} style={{ color: "var(--c-ivory)" }}>{hotelData.email}</a>
            </p>
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center", marginTop: "2rem", flexWrap: "wrap" }}>
              <Link to={`/${hotel}/contact-us`} className="btn light">Contact us</Link>
              <BookButton hotel={hotel} className="btn gold">Book your stay</BookButton>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
