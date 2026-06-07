import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { BookButton } from "@/components/BookButton";
import { Hero } from "@/components/Hero";
import { Loading } from "@/components/Loading";
import { PageMeta } from "@/components/PageMeta";
import { api, useAsync } from "@/lib/api";
import { useReveal } from "@/lib/reveal";
import "./pages.css";
import "./HomePage.css";

export function HomePage() {
  const page = useAsync(() => api.page("home"), []);
  const hotels = useAsync(() => api.hotels(), []);
  const offers = useAsync(() => api.offers(), []);
  const testimonials = useAsync(() => api.testimonials(), []);
  const restaurants = useAsync(() => api.restaurants(), []);

  const introRef = useReveal<HTMLDivElement>();
  const propertiesRef = useReveal<HTMLDivElement>();
  const diningRef = useReveal<HTMLDivElement>();
  const offersRef = useReveal<HTMLDivElement>();
  const testimonialsRef = useReveal<HTMLDivElement>();

  if (page.loading || hotels.loading) return <Loading />;

  const p = page.data;
  const pavilion = hotels.data?.find((h) => h.slug === "pavilion");
  const chancery = hotels.data?.find((h) => h.slug === "chancery");
  const heroImage = p?.hero_image ?? pavilion?.hero_image ?? null;
  const introImage = chancery?.about_image ?? chancery?.hero_image ?? null;

  return (
    <>
      <PageMeta
        title={p?.meta_title ?? "Chancery Hotels — Luxury Hotels in Bangalore"}
        description={p?.meta_description}
      />

      <Hero
        image={heroImage}
        eyebrow={p?.hero_eyebrow ?? "Two Bangalore landmarks"}
        heading={p?.hero_heading ?? "Refined hospitality across the city"}
        subheading={p?.hero_subheading}
        size="full"
        align="center"
      >
        {hotels.data?.map((h) => (
          <Link key={h.slug} to={`/${h.slug}`} className="btn light">
            {h.short_name}
          </Link>
        ))}
      </Hero>

      {/* Brand introduction — Claridges-style two-column */}
      <section className="section bg-cream">
        <div ref={introRef} className="container reveal">
          <div className="intro-claridges">
            <div className="intro-claridges__text">
              <p className="eyebrow">The Chancery Group</p>
              <h2 className="display">A quiet kind of luxury, since 1968.</h2>
              <p className="lede">
                {p?.intro_body ??
                  "Two distinguished hotels at the heart of Bangalore — bound by a shared commitment to timeless hospitality, elegant interiors and the city's most thoughtful dining."}
              </p>
              <hr className="divider" />
            </div>
            <span className="intro-claridges__divider" aria-hidden="true" />
            <div className="intro-claridges__media">
              <span className="intro-claridges__mat" aria-hidden="true" />
              <div className="figure aspect-43">
                {introImage && <img src={introImage} alt="The Chancery Hotel lobby" />}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Two hotels showcase */}
      <section className="section bg-ivory">
        <div ref={propertiesRef} className="container wide reveal">
          <div className="section-head">
            <p className="eyebrow center">Our hotels</p>
            <h2 className="h1">Two addresses, one promise</h2>
          </div>
          <div className="two-up">
            {hotels.data?.map((h) => (
              <Link key={h.slug} to={`/${h.slug}`} className="property-card">
                <div className="figure aspect-43">
                  {h.hero_image && <img src={h.hero_image} alt={h.name} />}
                </div>
                <div className="property-body">
                  <p className="eyebrow">{h.location_tag} · {h.location}</p>
                  <h3 className="h2">{h.name}</h3>
                  <p className="copy">{h.tagline}</p>
                  <span className="link-arrow">Discover</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Dining strip */}
      <section className="section bg-cream">
        <div ref={diningRef} className="container reveal">
          <div className="section-head">
            <p className="eyebrow center">Dining</p>
            <h2 className="h1">A reputation built around the table</h2>
            <p className="lede">
              From Chef Okada's sashimi at Matsuri to rooftop craft beers above
              Cubbon Park, Chancery restaurants are destinations in themselves.
            </p>
          </div>
          <div className="card-grid">
            {restaurants.data?.slice(0, 4).map((r) => (
              <Link
                key={r.id}
                to={`/${r.hotel.slug}/dining`}
                className="card"
              >
                <div className="figure">{r.hero_image && <img src={r.hero_image} alt={r.name} />}</div>
                <p className="card-eyebrow">{r.hotel.short_name}</p>
                <h3>{r.name}</h3>
                <p className="meta">{r.cuisine} · {r.timing}</p>
                <p className="copy">{r.description.slice(0, 120)}…</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Offers */}
      {offers.data && offers.data.length > 0 && (
        <section className="section bg-navy">
          <div ref={offersRef} className="container reveal">
            <div className="section-head">
              <p className="eyebrow center">Special offers</p>
              <h2 className="h1" style={{ color: "var(--c-ivory)" }}>
                Curated packages
              </h2>
            </div>
            <div className="card-grid three">
              {offers.data.slice(0, 3).map((o) => (
                <div key={o.id} className="card offer-card">
                  <div className="figure aspect-43">
                    {o.image && <img src={o.image} alt={o.title} />}
                  </div>
                  <p className="card-eyebrow" style={{ color: "var(--c-gold-soft)" }}>{o.tag}</p>
                  <h3 style={{ color: "var(--c-ivory)" }}>{o.title}</h3>
                  <p className="copy" style={{ color: "rgba(246,241,231,0.85)" }}>{o.description}</p>
                  <BookButton
                    hotel={o.hotel?.slug ?? "pavilion"}
                    promo={o.promo_code || undefined}
                    className="link-arrow"
                    style={{ color: "var(--c-gold-soft)", borderColor: "var(--c-gold-soft)" }}
                  >
                    Book
                  </BookButton>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      {testimonials.data && testimonials.data.length > 0 && (
        <section className="section tight bg-ivory">
          <div ref={testimonialsRef} className="container narrow reveal text-center">
            <p className="eyebrow center">Guest stories</p>
            <Testimonials items={testimonials.data} />
          </div>
        </section>
      )}
    </>
  );
}

function Testimonials({ items }: { items: { quote: string; name: string; title: string }[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const list = items.slice(0, 5);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const onScroll = () => {
      const i = Math.round(track.scrollLeft / track.clientWidth);
      setActive(i);
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => track.removeEventListener("scroll", onScroll);
  }, []);

  function goTo(i: number) {
    const track = trackRef.current;
    if (!track) return;
    track.scrollTo({ left: i * track.clientWidth, behavior: "smooth" });
  }

  return (
    <div className="testimonial-carousel">
      <div
        ref={trackRef}
        className="testimonial-track"
        aria-roledescription="carousel"
        aria-label="Guest testimonials"
      >
        {list.map((t, i) => (
          <figure
            key={i}
            className="testimonial"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${list.length}`}
          >
            <blockquote className="italic-quote">&ldquo;{t.quote}&rdquo;</blockquote>
            <figcaption>
              <span className="t-name">{t.name}</span>
              <span className="t-title">{t.title}</span>
            </figcaption>
          </figure>
        ))}
      </div>
      {list.length > 1 && (
        <div className="testimonial-dots" role="tablist">
          {list.map((_, i) => (
            <button
              key={i}
              type="button"
              className="testimonial-dot"
              aria-current={active === i}
              aria-label={`Show testimonial ${i + 1}`}
              onClick={() => goTo(i)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
