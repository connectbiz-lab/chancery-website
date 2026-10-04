import Link from 'next/link'
import { notFound } from 'next/navigation'
import { BookButton } from '@/components/BookButton'
import { CinematicHero } from '@/components/CinematicHero'
import { Media } from '@/components/Media'
import { OfferCopy } from '@/components/OfferCopy'
import { Reveal } from '@/components/Reveal'
import {
  getGallery,
  getHotel,
  getOffers,
  getPage,
  getRestaurants,
  getRooms,
  getVenues,
  type HotelSlug,
} from '@/lib/queries/content'
import { buildMetadata, hotelJsonLd } from '@/lib/seo'
import { mediaUrl } from '@/lib/media'
import { JsonLd } from '@/components/JsonLd'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import type { Metadata } from 'next'
import './HotelHomePage.css'
import { hotelHomePath } from '@/lib/routes'
import { HOTEL_AMENITIES } from '@/lib/amenities'
import { ODC } from '@/lib/catering'
import { PLACE_GROUPS } from '@/lib/destination'

export const revalidate = 3600

// Per-hotel section copy supplied by the hotel teams ("Website Content" sheet,
// Oct 2026). `aboutEyebrow: null` renders the About block with no kicker.
const HOME_COPY: Record<HotelSlug, { aboutEyebrow: string | null; aboutHeading: string; diningHeading: string }> = {
  pavilion: { aboutEyebrow: null, aboutHeading: 'Hospitality in the Heart of Bangalore', diningHeading: 'Symphony of Flavors' },
  chancery: { aboutEyebrow: 'Business Hotel', aboutHeading: 'A Welcome That Has Lasted Generations', diningHeading: 'Tables of Distinction' },
}

// Slug → human name fallback so metadata/hero can resolve before the hotel row.
const HOTEL_NAME_FALLBACK: Record<HotelSlug, string> = {
  chancery: 'The Chancery Hotel',
  pavilion: 'The Chancery Pavilion',
}

export async function generateMetadata({ params }: { params: Promise<{ hotel: string }> }): Promise<Metadata> {
  const { hotel } = await params
  const [page, h] = await Promise.all([getPage('hotel_home', hotel), getHotel(hotel)])
  if (!h) return {}
  const fallbackName = HOTEL_NAME_FALLBACK[hotel as HotelSlug] ?? h.name
  return buildMetadata({
    title: page?.meta_title || h.name || fallbackName,
    description: page?.meta_description || h.tagline,
    path: hotelHomePath(hotel),
    ogImagePath: h.hero_image,
  })
}

export default async function HotelHome({ params }: { params: Promise<{ hotel: string }> }) {
  const { hotel } = await params
  const [page, h, rooms, restaurants, venues, offers, gallery, destination] = await Promise.all([
    getPage('hotel_home', hotel),
    getHotel(hotel),
    getRooms(hotel),
    getRestaurants(hotel),
    getVenues(hotel),
    getOffers(hotel),
    getGallery(hotel),
    getPage('destination', hotel),
  ])
  if (!h) notFound()

  // Photogenic dine-in restaurants only — excludes imageless service entries
  // (e.g. In-Room Dining) from the count and card preview; they still show on
  // the full dining page.
  const diningRestaurants = restaurants.filter((r) => r.hero_image)
  const heroHeading = h.name || HOTEL_NAME_FALLBACK[hotel as HotelSlug]
  const copy = HOME_COPY[hotel as HotelSlug]
  const amenities = HOTEL_AMENITIES[hotel] ?? []
  // Photos already on this page, so the gallery strip can show something else.
  const shownAbove = new Set<string | null | undefined>([
    h.hero_image, h.about_image,
    ...rooms.slice(0, 3).map((r) => r.hero_image),
    ...diningRestaurants.map((r) => r.hero_image),
    ...offers.slice(0, 3).map((o) => o.image),
  ])
  const galleryStrip = gallery.filter((g) => !shownAbove.has(g.image)).slice(0, 6)
  // Pavilion leads with a looping montage video hero; other hotels keep the photo.
  // A new cut gets a new file name: browsers that saved the previous file keep
  // playing it (it was served with a 24-hour cache), so the name must change.
  const heroVideo = hotel === 'pavilion' ? mediaUrl('video/tcp-pavilion-hero-v3.mp4') : null
  const heroPoster = hotel === 'pavilion' ? mediaUrl('video/tcp-pavilion-hero-poster.jpg') : null

  return (
    <>
      <JsonLd data={hotelJsonLd(h)} />
      <Breadcrumbs
        items={[
          { name: 'Home', path: '/' },
          { name: h.name, path: hotelHomePath(hotel) },
        ]}
      />
      <CinematicHero
        image={h.hero_image ?? null}
        video={heroVideo}
        poster={heroPoster}
        title={heroHeading}
        script={h.tagline || undefined}
        focal={heroVideo ? undefined : hotel === 'pavilion' ? '50% 22%' : undefined}
        foot={
          <>
            <BookButton hotel={hotel as HotelSlug} className="btn gold">Book your stay</BookButton>
            <a href="#rooms" className="btn ghost">Explore rooms</a>
            <span className="chero-foot-meta">
              {h.address && <span>{h.address}</span>}
              {h.phone && <a href={`tel:${h.phone.replace(/\s+/g, '')}`}>{h.phone}</a>}
            </span>
          </>
        }
      />

      {/* Stats / intro */}
      <section className="section bg-cream">
        <Reveal className="container">
          <div className="section-head">
            <p className="eyebrow center">{h.name}</p>
            <h2 className="display">
              {page?.intro_body ? (h.intro_heading || h.tagline) : h.tagline}
            </h2>
            <p className="lede">{page?.intro_body || h.intro_body}</p>
          </div>

          <div className="stat-row three">
            <div className="stat">
              <span className="stat-num">{h.rooms_count}</span>
              <span className="stat-label">Rooms & suites</span>
            </div>
            <div className="stat">
              <span className="stat-num">{diningRestaurants.length || '—'}</span>
              <span className="stat-label">Restaurants</span>
            </div>
            <div className="stat">
              <span className="stat-num">{venues.length || '—'}</span>
              <span className="stat-label">Event venues</span>
            </div>
          </div>
        </Reveal>
      </section>

      {/* About — image + text, group-home editorial style (white, dashed frame). */}
      <section className="section bg-cream editorial-framed">
        <Reveal className="container">
          <div className="editorial-row">
            <div className="editorial-figure">
              <div className="figure aspect-port">
                {h.about_image && <Media path={h.about_image} alt={h.name} sizes="(max-width: 768px) 100vw, 50vw" />}
              </div>
            </div>
            <div className="editorial-text">
              {copy.aboutEyebrow && <p className="eyebrow">{copy.aboutEyebrow}</p>}
              <h2 className="h2">{copy.aboutHeading}</h2>
              <p className="lede">
                {h.intro_body}
              </p>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Rooms preview — anchor target for the hero "Explore rooms" button. */}
      {rooms.length > 0 && (
        <section id="rooms" className="section bg-cream" style={{ scrollMarginTop: '120px' }}>
          <div className="container">
            <div className="section-head">
              <p className="eyebrow center">Stay</p>
              <h2 className="h1">Rooms & Suites</h2>
              <p className="lede">Designed for Discerning Travellers</p>
            </div>
            <div className="card-grid three">
              {rooms.slice(0, 3).map((r) => (
                <Link key={r.id} href={`/${hotel}/accommodation`} className="card">
                  <div className="figure">{r.hero_image && <Media path={r.hero_image} alt={r.name} sizes="(max-width: 768px) 50vw, 25vw" />}</div>
                  <h3>{r.name}</h3>
                  <p className="meta">{r.size_sqft ? `${r.size_sqft} sq. ft.` : ''} · {r.bed_type}</p>
                  <p className="copy">{r.description}</p>
                </Link>
              ))}
            </div>
            <div className="text-center" style={{ marginTop: '3rem' }}>
              <Link href={`/${hotel}/accommodation`} className="btn ghost">View all rooms</Link>
            </div>
          </div>
        </section>
      )}

      {/* Dining preview */}
      {diningRestaurants.length > 0 && (
        <section className="section bg-ivory">
          <div className="container">
            <div className="section-head">
              <p className="eyebrow center">Dining</p>
              <h2 className="h1">{copy.diningHeading}</h2>
            </div>
            <div className={`card-grid three${diningRestaurants.length === 2 ? ' center-two' : ''}`}>
              {diningRestaurants.map((r) => (
                <Link key={r.id} href={`/${hotel}/dining`} className="card">
                  <div className="figure">{r.hero_image && <Media path={r.hero_image} alt={r.name} sizes="(max-width: 768px) 50vw, 25vw" />}</div>
                  <h3>{r.name}</h3>
                  <p className="meta">{r.cuisine}</p>
                  <p className="copy">{r.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Venue / events teaser */}
      {venues.length > 0 && (
        <section className="section bg-navy">
          <div className="container">
            <div className="section-head">
              <p className="eyebrow center" style={{ color: 'var(--c-gold-soft)' }}>Plan your event</p>
              <h2 className="h1" style={{ color: 'var(--c-ivory)' }}>
                {hotel === 'pavilion' ? 'From Boardrooms to Ballrooms' : 'Celebrations at a Lavelle Address'}
              </h2>
              <p className="lede" style={{ color: 'rgba(246,241,231,0.85)' }}>
                {venues.length} distinctive venues — each one engineered for the kind of occasion you have in mind.
              </p>
            </div>
            <div className="text-center">
              <Link href={`/${hotel}/plan-your-event`} className="btn light">Explore venues</Link>
            </div>
          </div>
        </section>
      )}

      {/* Outdoor Catering — centred heading like the other sections, photo beneath. */}
      <section className="section bg-cream">
        <Reveal className="container">
          <div className="section-head wide">
            <p className="eyebrow center">Outdoor Catering</p>
            <h2 className="h1">{ODC.tagline}</h2>
            <p className="lede">{ODC.teaser}</p>
          </div>
          <div className="odc-teaser-figure">
            <div className="figure">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={ODC.photo.src}
                srcSet={`${ODC.photo.srcSmall} 640w, ${ODC.photo.srcMedium} 800w, ${ODC.photo.src} 1200w`}
                sizes="(max-width: 900px) 100vw, 56rem"
                alt={ODC.photo.alt}
                loading="lazy"
              />
            </div>
          </div>
          <div className="text-center" style={{ marginTop: '2.5rem' }}>
            <Link href={ODC.path} className="btn ghost">Explore Outdoor Catering</Link>
          </div>
        </Reveal>
      </section>

      {/* General amenities — icon grid; Restaurant and Bar link to the dining page. */}
      {amenities.length > 0 && (
        <section className="section bg-ivory">
          <div className="container">
            <div className="section-head">
              <p className="eyebrow center">Amenities</p>
              <h2 className="h1">Hotel Amenities</h2>
            </div>
            <ul className="amenities-grid">
              {amenities.map(({ Icon, label, to }) => {
                const inner = (
                  <>
                    <span className="amenity-icon"><Icon size={28} /></span>
                    <span className="amenity-label">{label}</span>
                  </>
                )
                return (
                  <li key={label} className="amenity">
                    {to ? <Link href={`/${hotel}/${to}`}>{inner}</Link> : inner}
                  </li>
                )
              })}
            </ul>
          </div>
        </section>
      )}

      {/* Destination & Activities teaser — last of the hotel sections (team feedback):
          the neighbourhood line from the CMS 'destination' page and the five place groups. */}
      <section className="section bg-navy dest-teaser">
        <Reveal className="container">
          <div className="section-head">
            <p className="eyebrow center">Destination &amp; Activities</p>
            <h2 className="h1">{destination?.hero_heading || 'Bangalore, on Your Doorstep'}</h2>
            {destination?.intro_body && <p className="lede">{destination.intro_body}</p>}
          </div>
          <ul className="amenities-grid">
            {PLACE_GROUPS.map(({ Icon, title }) => (
              <li key={title} className="amenity">
                <Link href={`/${hotel}/destination`}>
                  <span className="amenity-icon"><Icon size={28} /></span>
                  <span className="amenity-label">{title}</span>
                </Link>
              </li>
            ))}
          </ul>
          <div className="text-center" style={{ marginTop: '3rem' }}>
            <Link href={`/${hotel}/destination`} className="btn light">Explore the Destination</Link>
          </div>
        </Reveal>
      </section>

      {/* Offers teaser */}
      {offers.length > 0 && (
        <section className="section bg-cream">
          <div className="container">
            <div className="section-head">
              <p className="eyebrow center">Offers</p>
              <h2 className="h1">Curated Packages</h2>
            </div>
            <div className="card-grid three">
              {offers.slice(0, 3).map((o) => (
                <div key={o.id} className="card">
                  <div className="figure">{o.image && <Media path={o.image} alt={o.title} sizes="(max-width: 768px) 100vw, 33vw" />}</div>
                  <p className="card-eyebrow">{o.tag}</p>
                  <h3>{o.title}</h3>
                  <OfferCopy text={o.description} />
                  <BookButton hotel={hotel as HotelSlug} promo={o.promo_code || undefined} className="link-arrow">Book</BookButton>
                </div>
              ))}
            </div>
            <div className="text-center" style={{ marginTop: '3rem' }}>
              <Link href={`/${hotel}/special-offers`} className="btn ghost">All offers</Link>
            </div>
          </div>
        </section>
      )}

      {/* Gallery preview — skips photos the page has already shown (hero, about,
          room, dining and offer cards), so the strip adds new views instead of repeats. */}
      {galleryStrip.length > 0 && (
        <section className="section bg-ivory tight">
          <div className="container">
            <div className="section-head left">
              <p className="eyebrow">Gallery</p>
              <h2 className="h2">Inside {h.short_name || heroHeading}</h2>
            </div>
            <div className="image-grid">
              {galleryStrip.map((g) => (
                <Link key={g.id} href={`/${hotel}/gallery`} className="figure">
                  <Media path={g.image} alt={g.alt} sizes="(max-width: 768px) 50vw, 33vw" />
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact teaser */}
      <section className="section bg-navy tight">
        <div className="container narrow text-center">
          <p className="eyebrow center" style={{ color: 'var(--c-gold-soft)' }}>Reach the team</p>
          <h2 className="h2" style={{ color: 'var(--c-ivory)' }}>{h.address}</h2>
          <p className="lede" style={{ color: 'rgba(246,241,231,0.85)' }}>
            <a href={`tel:${h.phone.replace(/\s+/g, '')}`} style={{ color: 'var(--c-ivory)' }}>{h.phone}</a>
            {/* On phones the two links stack, so the separator is hidden there. */}
            <span className="contact-sep">{' · '}</span>
            <a href={`mailto:${h.email}`} style={{ color: 'var(--c-ivory)' }}>{h.email}</a>
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem', flexWrap: 'wrap' }}>
            <Link href={`/${hotel}/contact-us`} className="btn light">Contact us</Link>
            <BookButton hotel={hotel as HotelSlug} className="btn gold">Book your stay</BookButton>
          </div>
        </div>
      </section>
    </>
  )
}
