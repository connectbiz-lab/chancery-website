import { useState } from "react";
import { BookTableModal } from "@/components/BookTableModal";
import { Hero } from "@/components/Hero";
import { HeroIconNav } from "@/components/HeroIconNav";
import { Loading } from "@/components/Loading";
import { PageMeta } from "@/components/PageMeta";
import { ResponsiveImage } from "@/components/ResponsiveImage";
import { api, useAsync } from "@/lib/api";
import type { HotelSlug, Restaurant } from "@/lib/types";
import "./pages.css";
import "./DiningPage.css";

export function DiningPage({ hotel }: { hotel: HotelSlug }) {
  const page = useAsync(() => api.page("dining", hotel), [hotel]);
  const h = useAsync(() => api.hotel(hotel), [hotel]);
  const restaurants = useAsync(() => api.restaurants(hotel), [hotel]);

  if (page.loading || restaurants.loading || h.loading) return <Loading />;
  const p = page.data;

  return (
    <>
      <PageMeta title={p?.meta_title ?? "Dining"} description={p?.meta_description} />
      <Hero
        image={p?.hero_image ?? h.data?.hero_image ?? null}
        eyebrow={
          <span className="hero-eyebrow-stack">
            <span>{h.data?.name}</span>
            <span>{p?.hero_eyebrow ?? "Dining"}</span>
          </span>
        }
        heading={p?.hero_heading ?? "Dining"}
        subheading={p?.hero_subheading}
        size="page"
        footerNav={<HeroIconNav scope={hotel} />}
      />
      <section className="section">
        <div className="container">
          {p?.intro_body && (
            <div className="section-head">
              <p className="lede">{p.intro_body}</p>
            </div>
          )}
          <div className="dining-list">
            {restaurants.data?.map((r, idx) => (
              <RestaurantBlock key={r.id} restaurant={r} flip={idx % 2 === 1} hotel={hotel} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function RestaurantBlock({ restaurant: r, flip, hotel }: { restaurant: Restaurant; flip: boolean; hotel: HotelSlug }) {
  const [active, setActive] = useState(0);
  const [booking, setBooking] = useState(false);
  const images = r.images.length > 0
    ? r.images
    : (r.hero_image ? [{ image: r.hero_image, alt: r.name, order: 0 }] : []);

  return (
    <article className={`dining-row ${flip ? "flip" : ""}`}>
      <div className="dining-gallery">
        <div className="figure">
          {images[active] && <ResponsiveImage src={images[active].image} alt={images[active].alt || r.name} sizes="(max-width: 768px) 100vw, 60vw" />}
        </div>
        {images.length > 1 && (
          <div className="thumbs">
            {images.map((img, i) => (
              <button
                key={i}
                type="button"
                className={`thumb ${i === active ? "active" : ""}`}
                onClick={() => setActive(i)}
                aria-label={`View image ${i + 1}`}
              >
                <ResponsiveImage src={img.image} alt="" sizes="(max-width: 768px) 25vw, 12vw" />
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="dining-text">
        <p className="eyebrow">{r.cuisine}</p>
        <h2 className="h2">{r.name}</h2>
        <p className="meta">{r.timing}</p>
        <p className="copy">{r.description}</p>
        <div className="dining-cta">
          <button type="button" className="btn" onClick={() => setBooking(true)}>
            Book a table
          </button>
        </div>
      </div>
      <BookTableModal
        open={booking}
        onClose={() => setBooking(false)}
        hotel={hotel}
        restaurant={r.name}
      />
    </article>
  );
}
