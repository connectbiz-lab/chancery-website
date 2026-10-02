import Link from 'next/link'
import { Hero } from '@/components/Hero'
import { Media } from '@/components/Media'
import { Reveal } from '@/components/Reveal'
import { TestimonialCarousel } from '@/components/TestimonialCarousel'
import {
  getHotels,
  getPage,
  getTestimonials,
} from '@/lib/queries/content'
import { buildMetadata } from '@/lib/seo'
import { AWARD_GROUPS, awardLine, type AwardScope } from '@/lib/awards'
import { ODC } from '@/lib/catering'
import { mediaUrl } from '@/lib/media'
import './HomePage.css'
import { hotelHomePath } from '@/lib/routes'

export const revalidate = 3600

// Card kicker on the awards grid: which property (or the group) an award belongs to.
const AWARD_SCOPE_LABEL: Record<AwardScope, string> = {
  pavilion: 'The Chancery Pavilion',
  chancery: 'The Chancery Hotel',
  group: 'The Chancery Group of Hotels',
}

// Vision, mission and values — from the Chancery Group deck ("Who We Are").
const VISION =
  'To be a distinguished leader in hotel development and management — delivering exceptional value to stakeholders and a world-class workplace for our teams.'
const MISSION =
  'Warm, heartfelt hospitality and impeccable service — creating unforgettable moments for every guest, every time.'
const VALUES: { name: string; line: string }[] = [
  { name: 'Excellence', line: 'The highest standards at every touchpoint' },
  { name: 'Integrity', line: 'Honest and transparent with everyone' },
  { name: 'Guest-Centricity', line: 'Anticipating needs before they are voiced' },
  { name: 'Innovation', line: 'Evolving with purpose and agility' },
  { name: 'People-First', line: 'Nurturing talent and empowering growth' },
  { name: 'Sustainability', line: 'Minimising our environmental footprint' },
]

// Per-hotel facts the CMS does not hold: banqueting area (deck, "Brand
// Portfolio") and opening year (the journey timeline below).
const HOTEL_FACTS: Record<string, { banquetSqFt: string; opened: string }> = {
  pavilion: { banquetSqFt: '20,000', opened: '2006' },
  chancery: { banquetSqFt: '6,800', opened: '2000' },
}

export async function generateMetadata() {
  const page = await getPage('home')
  return buildMetadata({
    // The CMS 'home' meta title was written for the front door; this page is the group's story.
    title: 'About the Chancery Group',
    description:
      'The Chancery Group of Hotels — Bangalore’s homegrown hospitality group: The Chancery Pavilion on Residency Road, The Chancery Hotel on Lavelle Road, award-winning restaurants and outdoor catering.',
    path: '/about',
    ogImagePath: page?.hero_image,
  })
}

// About the Chancery Group — who the group is, its story, purpose, the two
// hotels it runs, its scale, catering, awards and guest stories.
export default async function AboutPage() {
  const [page, hotels, testimonials] = await Promise.all([
    getPage('home'),
    getHotels(),
    getTestimonials(),
  ])

  const p = page
  const chancery = hotels.find((h) => h.slug === 'chancery')
  const pavilion = hotels.find((h) => h.slug === 'pavilion')
  const heroImage = p?.hero_image ?? pavilion?.hero_image ?? '/media/pages/brand-home-hero.webp'
  const introImage = chancery?.about_image ?? chancery?.hero_image ?? null

  return (
    <>
      <Hero
        image={heroImage}
        splitImages={pavilion && chancery ? [pavilion.hero_image, chancery.hero_image] : undefined}
        eyebrow="The Chancery Group of Hotels"
        heading="Understated Luxury with Purpose"
        subheading="Bangalore’s distinguished homegrown hospitality brand for over two decades."
        size="page"
      />

      {/* Brand introduction — Claridges-style two-column */}
      <section id="group-intro" className="section bg-cream" style={{ scrollMarginTop: '110px' }}>
        <Reveal className="container">
          <div className="intro-claridges">
            <div className="intro-claridges__text">
              <p className="eyebrow">The Chancery Group</p>
              <h2 className="display">A Quiet Kind of Luxury, Since 1968.</h2>
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
            <h2 className="h1">Three Generations, One Address Book</h2>
            <p className="lede">
              An integrated family group with interests in farming, real estate and
              hospitality — Chancery&rsquo;s story across Bengaluru began long before
              its first hotel opened.
            </p>
          </div>
          <ol className="journey-timeline" aria-label="Chancery Hotels history">
            <li>
              <span className="journey-year">1960s&ndash;90s</span>
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
            <li>
              <span className="journey-year">2015</span>
              <span className="journey-mark" aria-hidden="true" />
              <p className="journey-note">
                Catering and food &amp; beverage operations expand.
              </p>
            </li>
            <li>
              <span className="journey-year">2020+</span>
              <span className="journey-mark" aria-hidden="true" />
              <p className="journey-note">
                Planning begins for expansion across India.
              </p>
            </li>
          </ol>
        </Reveal>
      </section>

      {/* Who we are — vision, mission and the six values. */}
      <section className="section bg-navy purpose">
        <Reveal className="container">
          <div className="section-head">
            <p className="eyebrow center">Who We Are</p>
            <h2 className="h1">Vision, Mission &amp; Values</h2>
          </div>
          <div className="purpose-pair">
            <div>
              <h3>Vision</h3>
              <p>{VISION}</p>
            </div>
            <div>
              <h3>Mission</h3>
              <p>{MISSION}</p>
            </div>
          </div>
          <ul className="values-grid">
            {VALUES.map((v) => (
              <li key={v.name}>
                <strong>{v.name}</strong>
                <span>{v.line}</span>
              </li>
            ))}
          </ul>
        </Reveal>
      </section>

      {/* The group's hotels — logo cards, each leading to that hotel's home. */}
      <section id="hotels" className="section bg-ivory" style={{ scrollMarginTop: '120px' }}>
        <Reveal className="container">
          <div className="section-head">
            <p className="eyebrow center">Our Hotels</p>
            <h2 className="h1">Two Iconic Properties in Bangalore</h2>
          </div>
          <div className="group-hotels">
            {hotels.map((h) => {
              const facts = HOTEL_FACTS[h.slug]
              const logo = mediaUrl(h.logo)
              return (
                <Link key={h.slug} href={hotelHomePath(h.slug)} className="group-hotel">
                  {logo && (
                    <span className="group-hotel__logo">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={logo} alt="" loading="lazy" />
                    </span>
                  )}
                  <h3>{h.name}</h3>
                  <p className="group-hotel__address">{h.address}</p>
                  <dl className="group-hotel__facts">
                    <div><dd>{h.rooms_count}</dd><dt>Rooms &amp; suites</dt></div>
                    {facts && <div><dd>{facts.banquetSqFt}</dd><dt>Sq ft of banqueting</dt></div>}
                    {facts && <div><dd>{facts.opened}</dd><dt>Opened</dt></div>}
                  </dl>
                  <span className="link-arrow">Explore the Hotel</span>
                </Link>
              )
            })}
          </div>
        </Reveal>
      </section>

      {/* By the numbers — group scale, led by event-space strength. Stats
          sourced from the group's snapshot. */}
      <section className="section bg-cream metrics">
        <Reveal className="container">
          <div className="metrics-head">
            <p className="eyebrow">The Chancery Group at a glance</p>
            <h2 className="display">By the Numbers</h2>
            <p className="lede">
              From 26,800 sq ft of banqueting to 2,500 events a year, the Chancery
              Group is one of Bangalore&rsquo;s largest stages for weddings,
              conferences and celebrations — backed by the depth of a homegrown
              hospitality brand a quarter-century in the making.
            </p>
          </div>
          <div className="metrics-grid">
            {([
              { n: '26,800', label: 'Sq ft of banqueting', sub: 'Combined across both hotels' },
              { n: '2,500+', label: 'Events hosted / year', sub: 'Weddings, conferences & socials' },
              { n: '10,000+', label: 'Catering capacity', sub: 'Outdoor events of any scale' },
              { n: '1.2L+', label: 'F&B covers / year', sub: 'Restaurant, banquet & catering' },
              { n: '349', label: 'Rooms & suites', sub: '223 Pavilion + 126 Chancery' },
              { n: '25+', label: 'Years of excellence', sub: 'Award-winning operations in Bangalore' },
              { n: '94+%', label: 'Occupancy rate', sub: 'Consistently above benchmark' },
              { rating: 4.5, label: 'Guest satisfaction', sub: '4.5 / 5 · Tripadvisor, Google & Booking.com' },
              { n: '600+', label: 'Staff strength', sub: 'Trained hospitality professionals' },
            ] as { n?: string; rating?: number; label: string; sub: string }[]).map((m) => (
              <div key={m.label} className="metric-card">
                {m.rating != null
                  ? <StarRating value={m.rating} />
                  : <span className="metric-num">{m.n}</span>}
                <span className="metric-label">{m.label}</span>
                <span className="metric-sub">{m.sub}</span>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* Outdoor Catering — one of the group's main lines; teaser to /catering. */}
      <section className="section bg-ivory">
        <Reveal className="container">
          <div className="editorial-row flip">
            <div className="editorial-figure">
              <div className="figure">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={ODC.photo.src}
                  srcSet={`${ODC.photo.srcSmall} 640w, ${ODC.photo.srcMedium} 800w, ${ODC.photo.src} 1200w`}
                  sizes="(max-width: 900px) 100vw, 50vw"
                  alt={ODC.photo.alt}
                  loading="lazy"
                />
              </div>
            </div>
            <div className="editorial-text">
              <p className="eyebrow">Outdoor Catering</p>
              <h2 className="h2">{ODC.tagline}</h2>
              <p className="lede">{ODC.teaser}</p>
              <Link href={ODC.path} className="btn ghost">Explore Outdoor Catering</Link>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Awards & Accolades — credibility row sourced from Chancery PPT (Dec) */}
      <section className="section bg-cream awards">
        <Reveal className="container">
          <div className="section-head">
            <p className="eyebrow center">Awards &amp; accolades</p>
            <h2 className="h1">Recognised by the City, the Press, and Our Guests</h2>
          </div>
          <div className="awards-grid">
            {AWARD_GROUPS.map((g) => (
              <article className="awards-card" key={g.owner}>
                <p className="awards-card__hotel">{AWARD_SCOPE_LABEL[g.scope]}</p>
                <p className="awards-card__owner">{g.owner}</p>
                <ul className="awards-list">
                  {g.awards.map((a) => (
                    <li key={a.title + a.years}><strong>{a.title}</strong> &mdash; {awardLine(a)}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
          <div className="text-center" style={{ marginTop: '2.5rem', display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {hotels.map((h) => (
              <Link key={h.slug} href={`/${h.slug}/awards`} className="btn ghost">{h.short_name} Awards</Link>
            ))}
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

// Star rating for the guest-satisfaction metric: a base row of muted stars with
// a gold-filled row clipped to value/outOf, giving a crisp half-star at 4.5.
function StarRating({ value, outOf = 5 }: { value: number; outOf?: number }) {
  const star = 'M10 1.6l2.47 5.01 5.53.8-4 3.9.94 5.5L10 14.2l-4.95 2.6.95-5.5-4-3.9 5.53-.8L10 1.6z'
  const stars = Array.from({ length: outOf }, (_, i) => (
    <svg key={i} viewBox="0 0 20 20" aria-hidden="true"><path d={star} /></svg>
  ))
  return (
    <span className="metric-stars" role="img" aria-label={`${value} out of ${outOf} stars`}>
      <span className="metric-stars__row metric-stars__base" aria-hidden="true">{stars}</span>
      <span
        className="metric-stars__row metric-stars__fill"
        style={{ width: `${(value / outOf) * 100}%` }}
        aria-hidden="true"
      >
        {stars}
      </span>
    </span>
  )
}
