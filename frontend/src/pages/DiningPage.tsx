import { useState } from "react";
import { Link } from "react-router-dom";
import { Hero } from "@/components/Hero";
import { HeroIconNav } from "@/components/HeroIconNav";
import { Loading } from "@/components/Loading";
import { PageMeta } from "@/components/PageMeta";
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
        eyebrow={p?.hero_eyebrow ?? h.data?.name}
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
  const images = r.images.length > 0
    ? r.images
    : (r.hero_image ? [{ image: r.hero_image, alt: r.name, order: 0 }] : []);

  return (
    <article className={`dining-row ${flip ? "flip" : ""}`}>
      <div className="dining-gallery">
        <div className="figure">
          {images[active] && <img src={images[active].image} alt={images[active].alt || r.name} />}
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
                <img src={img.image} alt="" />
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
          <Link to={`/${hotel}/contact-us`} className="btn">Make a reservation</Link>
        </div>
      </div>
    </article>
  );
}
