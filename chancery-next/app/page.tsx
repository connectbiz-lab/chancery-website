import Link from 'next/link'
import { BookButton } from '@/components/BookButton'
import { Hero } from '@/components/Hero'
import { HeroIconNav } from '@/components/HeroIconNav'
import { HomeShowcaseHero } from '@/components/HomeShowcaseHero'
import { Media } from '@/components/Media'
import { Reveal } from '@/components/Reveal'
import { TestimonialCarousel } from '@/components/TestimonialCarousel'
import {
  getHotels,
  getOffers,
  getPage,
  getRestaurants,
  getSiteContent,
  getTestimonials,
} from '@/lib/queries/content'
import { buildMetadata } from '@/lib/seo'
import './HomePage.css'

export const revalidate = 3600

export async function generateMetadata() {
  const [page, site] = await Promise.all([getPage('home'), getSiteContent()])
  return buildMetadata({
    title: page?.meta_title || site.site_title,
    description: page?.meta_description || site.tagline,
    path: '/',
    ogImagePath: page?.hero_image,
  })
}

export default async function Home() {
  const [page, hotels, offers, testimonials, restaurants] = await Promise.all([
    getPage('home'),
    getHotels(),
    getOffers(),
    getTestimonials(),
    getRestaurants(),
  ])

  const p = page
  const chancery = hotels.find((h) => h.slug === 'chancery')
  const pavilion = hotels.find((h) => h.slug === 'pavilion')
  const heroImage = p?.hero_image ?? pavilion?.hero_image ?? '/media/pages/brand-home-hero.webp'
  const introImage = chancery?.about_image ?? chancery?.hero_image ?? null

  return (
    <>
      {pavilion && chancery ? (
        <HomeShowcaseHero
          pavilion={pavilion}
          pavilionImage={pavilion.hero_image}
          chancery={chancery}
          chanceryImage={chancery.hero_image}
        />
      ) : (
        <Hero
          image={heroImage}
          eyebrow={p?.hero_eyebrow ?? 'The Chancery Group of Hotels'}
          heading={p?.hero_heading ?? 'Redefining hospitality'}
          subheading={p?.hero_subheading ?? 'Understated luxury with purpose.'}
          size="full"
          align="center"
          footerNav={<HeroIconNav />}
        >
          {hotels.map((h) => (
            <Link key={h.slug} href={`/${h.slug}`} className="btn light">
              {h.short_name}
            </Link>
          ))}
        </Hero>
      )}

      {/* Brand introduction — Claridges-style two-column */}
      <section className="section bg-cream">
        <Reveal className="container">
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
                {introImage && (
                  <Media
                    path={introImage}
                    alt="The Chancery Hotel lobby"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                )}
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Our journey — three-generation heritage timeline */}
      <section className="section bg-ivory journey">
        <Reveal className="container">
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
        </Reveal>
      </section>

      {/* Two hotels showcase */}
      <section id="hotels" className="section bg-ivory" style={{ scrollMarginTop: '120px' }}>
        <Reveal className="container wide">
          <div className="section-head">
            <p className="eyebrow center">Our hotels</p>
            <h2 className="h1">Two addresses, one promise</h2>
          </div>
          <div className="two-up">
            {hotels.map((h) => (
              <Link key={h.slug} href={`/${h.slug}`} className="property-card">
                <div className="figure aspect-43">
                  {h.hero_image && (
                    <Media
                      path={h.hero_image}
                      alt={h.name}
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  )}
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
        </Reveal>
      </section>

      {/* Dining strip */}
      <section className="section bg-cream">
        <Reveal className="container">
          <div className="section-head">
            <p className="eyebrow center">Dining</p>
            <h2 className="h1">A reputation built around the table</h2>
            <p className="lede">
              From Chef Okada&apos;s sashimi at Matsuri to rooftop craft beers above
              Cubbon Park, Chancery restaurants are destinations in themselves.
            </p>
          </div>
          <div className="card-grid">
            {restaurants.slice(0, 4).map((r) => (
              <Link
                key={r.id}
                href={`/${r.hotel.slug}/dining`}
                className="card"
              >
                <div className="figure">
                  {r.hero_image && (
                    <Media
                      path={r.hero_image}
                      alt={r.name}
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                  )}
                </div>
                <p className="card-eyebrow">{r.hotel.short_name}</p>
                <h3>{r.name}</h3>
                <p className="meta">{r.cuisine} · {r.timing}</p>
                <p className="copy">{r.description.slice(0, 120)}…</p>
              </Link>
            ))}
          </div>
        </Reveal>
      </section>

      {/* Offers */}
      {offers.length > 0 && (
        <section className="section bg-navy">
          <Reveal className="container">
            <div className="section-head">
              <p className="eyebrow center">Special offers</p>
              <h2 className="h1" style={{ color: 'var(--c-ivory)' }}>
                Curated packages
              </h2>
            </div>
            <div className="card-grid three">
              {offers.slice(0, 3).map((o) => (
                <div key={o.id} className="card offer-card">
                  <div className="figure aspect-43">
                    {o.image && (
                      <Media
                        path={o.image}
                        alt={o.title}
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    )}
                  </div>
                  <p className="card-eyebrow" style={{ color: 'var(--c-gold-soft)' }}>{o.tag}</p>
                  <h3 style={{ color: 'var(--c-ivory)' }}>{o.title}</h3>
                  <p className="copy" style={{ color: 'rgba(246,241,231,0.85)' }}>{o.description}</p>
                  <BookButton
                    hotel={o.hotel?.slug ?? 'pavilion'}
                    promo={o.promo_code || undefined}
                    className="link-arrow"
                    style={{ color: 'var(--c-gold-soft)', borderColor: 'var(--c-gold-soft)' }}
                  >
                    Book
                  </BookButton>
                </div>
              ))}
            </div>
          </Reveal>
        </section>
      )}

      {/* Awards & Accolades — credibility row sourced from Chancery PPT (Dec) */}
      <section className="section bg-cream awards">
        <Reveal className="container">
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
        </Reveal>
      </section>

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section className="section tight bg-ivory">
          <Reveal className="container narrow text-center">
            <p className="eyebrow center">Guest stories</p>
            <TestimonialCarousel testimonials={testimonials.slice(0, 5)} />
          </Reveal>
        </section>
      )}
    </>
  )
}
