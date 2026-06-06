import { Link } from "react-router-dom";
import { Hero } from "@/components/Hero";
import { Loading } from "@/components/Loading";
import { PageMeta } from "@/components/PageMeta";
import { api, useAsync } from "@/lib/api";
import type { HotelSlug } from "@/lib/types";
import "./pages.css";

export function OffersPage({ hotel }: { hotel: HotelSlug }) {
  const page = useAsync(() => api.page("offers", hotel), [hotel]);
  const h = useAsync(() => api.hotel(hotel), [hotel]);
  const offers = useAsync(() => api.offers(hotel), [hotel]);

  if (page.loading || offers.loading || h.loading) return <Loading />;
  const p = page.data;

  return (
    <>
      <PageMeta title={p?.meta_title ?? "Special offers"} description={p?.meta_description} />
      <Hero
        image={p?.hero_image ?? h.data?.hero_image ?? null}
        eyebrow={p?.hero_eyebrow}
        heading={p?.hero_heading ?? "Special offers"}
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
          <div className="card-grid">
            {offers.data?.map((o) => (
              <article key={o.id} className="card">
                <div className="figure aspect-43">
                  {o.image && <img src={o.image} alt={o.title} />}
                </div>
                {o.tag && <p className="card-eyebrow">{o.tag}</p>}
                <h3>{o.title}</h3>
                <p className="copy">{o.description}</p>
                {o.min_nights && <p className="meta">Minimum {o.min_nights} nights</p>}
                <div className="card-cta">
                  <Link
                    to={`/book?hotel=${hotel}${o.promo_code ? `&promo=${o.promo_code}` : ""}`}
                    className="link-arrow"
                  >
                    Book
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
