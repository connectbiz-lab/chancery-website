import { Link } from "react-router-dom";
import { Hero } from "@/components/Hero";
import { Loading } from "@/components/Loading";
import { PageMeta } from "@/components/PageMeta";
import { api, useAsync } from "@/lib/api";
import type { HotelSlug } from "@/lib/types";
import "./pages.css";

export function ExperiencePage({ hotel }: { hotel: HotelSlug }) {
  const page = useAsync(() => api.page("experience", hotel), [hotel]);
  const h = useAsync(() => api.hotel(hotel), [hotel]);
  const gallery = useAsync(() => api.gallery(hotel), [hotel]);
  if (page.loading || h.loading) return <Loading />;
  const p = page.data;
  const hotelData = h.data!;

  return (
    <>
      <PageMeta title={p?.meta_title ?? "Experience"} description={p?.meta_description} />
      <Hero
        image={p?.hero_image ?? hotelData.about_image ?? hotelData.hero_image}
        eyebrow={p?.hero_eyebrow}
        heading={p?.hero_heading ?? `Experience ${hotelData.short_name}`}
        subheading={p?.hero_subheading}
        size="page"
      />
      <section className="section">
        <div className="container narrow">
          <div className="section-head">
            {p?.intro_body && <p className="lede" style={{ margin: "0 auto" }}>{p.intro_body}</p>}
          </div>
          <div className="callout">
            <p className="italic-quote">
              "Hospitality is not what we do — it's who we have always been."
            </p>
          </div>
        </div>
      </section>

      {gallery.data && gallery.data.length > 0 && (
        <section className="section bg-ivory tight">
          <div className="container">
            <div className="section-head left">
              <p className="eyebrow">Moments</p>
              <h2 className="h2">A few moments inside</h2>
            </div>
            <div className="image-grid">
              {gallery.data.slice(0, 9).map((g) => (
                <div className="figure" key={g.id}>
                  <img src={g.image} alt={g.alt} loading="lazy" />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="section bg-navy tight">
        <div className="container narrow text-center">
          <p className="eyebrow center" style={{ color: "var(--c-gold-soft)" }}>Plan a stay</p>
          <h2 className="h2" style={{ color: "var(--c-ivory)" }}>
            Reserve your visit
          </h2>
          <Link to={`/book?hotel=${hotel}`} className="btn gold">Book your stay</Link>
        </div>
      </section>
    </>
  );
}
