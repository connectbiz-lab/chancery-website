import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { BookButton } from "@/components/BookButton";
import { Hero } from "@/components/Hero";
import { HeroIconNav } from "@/components/HeroIconNav";
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
  const { hash } = useLocation();

  // SPA arrivals at /#hotels (e.g., from a hotel page's "Our Hotels" icon)
  // need a manual scroll-into-view — react-router doesn't honor hashes.
  // Wait a tick so the section has actually mounted after the data loads.
  useEffect(() => {
    if (hash !== "#hotels") return;
    const id = setTimeout(() => {
      document.getElementById("hotels")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
    return () => clearTimeout(id);
  }, [hash]);

  const introRef = useReveal<HTMLDivElement>();
  const journeyRef = useReveal<HTMLDivElement>();
  const propertiesRef = useReveal<HTMLDivElement>();
  const diningRef = useReveal<HTMLDivElement>();
  const offersRef = useReveal<HTMLDivElement>();
  const testimonialsRef = useReveal<HTMLDivElement>();
  const awardsRef = useReveal<HTMLDivElement>();

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
        eyebrow={p?.hero_eyebrow ?? "The Chancery Group of Hotels"}
        heading={p?.hero_heading ?? "Redefining hospitality"}
        subheading={p?.hero_subheading ?? "Understated luxury with purpose."}
        size="full"
        align="center"
        footerNav={<HeroIconNav />}
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

      {/* Our journey — three-generation heritage timeline */}
      <section className="section bg-ivory journey">
        <div ref={journeyRef} className="container reveal">
          <div className="section-head">
            <p className="eyebrow center">Our journey</p>
            <h2 className="h1">Three generations, one address book</h2>
            <p className="lede">
              An integrated family group with interests in farming, real estate and
              hospitality — Chancery&rsquo;s story across Bengaluru began long before
              its first hotel opened.
            </p>
          </div>
          <ol className="journey-timeline" aria-label="Chancery Hotels history">
            <li>
              <span className="journey-year">1960s &ndash; 1990s</span>
              <span className="journey-mark" aria-hidden="true" />
              <p className="journey-note">
                The family group establishes itself across entertainment,
                cinema theatres, commercial and residential projects.
              </p>
            </li>
            <li>
              <span className="journey-year">2000</span>
              <span className="journey-mark" aria-hidden="true" />
              <p className="journey-note">
                The Chancery opens on Lavelle Road &mdash; the family&rsquo;s
                first hotel.
              </p>
            </li>
            <li>
              <span className="journey-year">2006</span>
              <span className="journey-mark" aria-hidden="true" />
              <p className="journey-note">
                The Chancery Pavilion opens on Residency Road &mdash; 223
                rooms, the flagship of the group.
              </p>
            </li>
            <li>
              <span className="journey-year">2012</span>
              <span className="journey-mark" aria-hidden="true" />
              <p className="journey-note">
                Joint venture with Toyota Enterprises brings Matsuri,
                Sara Spa and authentic Japanese hospitality to The Chancery.
              </p>
            </li>
          </ol>
        </div>
      </section>

      {/* Two hotels showcase */}
      <section id="hotels" className="section bg-ivory" style={{ scrollMarginTop: "120px" }}>
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

      {/* Awards & Accolades — credibility row sourced from Chancery PPT (Dec) */}
      <section className="section bg-cream awards">
        <div ref={awardsRef} className="container reveal">
          <div className="section-head">
            <p className="eyebrow center">Awards &amp; accolades</p>
            <h2 className="h1">Recognised by the city, the press, and our guests</h2>
          </div>
          <div className="awards-grid">
            <article className="awards-card">
              <p className="awards-card__owner">The Chancery Hotel</p>
              <p className="awards-card__lead">Tripadvisor Traveller&rsquo;s Choice Award &mdash; 2025</p>
              <p className="awards-card__lead">Tripadvisor Traveller&rsquo;s Choice Award &mdash; 2023 <span className="awards-card__sub">(The Chancery Pavilion)</span></p>
            </article>

            <article className="awards-card">
              <p className="awards-card__owner">Matsuri</p>
              <ul className="awards-list">
                <li><strong>Best Japanese Restaurant</strong> &mdash; Times Food Award, 2014, 2015 &amp; 2016</li>
                <li><strong>Best Sushi</strong> &mdash; Eazy Diner Food Award, 2017</li>
                <li><strong>Epicurean Restaurant Award</strong> &mdash; 2024</li>
                <li><strong>Best Japanese Premium Dining</strong> &mdash; Times Food &amp; Nightlife Award, 2025</li>
              </ul>
            </article>

            <article className="awards-card">
              <p className="awards-card__owner">Alchemy</p>
              <ul className="awards-list">
                <li><strong>Best Modern Indian Premium Dining</strong> &mdash; Times Food Nightlife Award, 2023, 2024 &amp; 2025</li>
                <li><strong>Best Microbrewery, Luxurious Nightout</strong> &mdash; Times Food Nightlife Award, 2025</li>
                <li><strong>Best Modern Indian Restaurant</strong> &mdash; EazyDiner Foodie Awards, 2019</li>
                <li><strong>Brewer World &mdash; Beer of India 2023:</strong> Gold (Fruited Sour Ale), Silver (American Porter), Silver (Experimental Grain Beer)</li>
              </ul>
            </article>
          </div>
        </div>
      </section>

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
