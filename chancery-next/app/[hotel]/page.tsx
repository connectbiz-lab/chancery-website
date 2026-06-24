import Link from 'next/link'
import { notFound } from 'next/navigation'
import { BookButton } from '@/components/BookButton'
import { HotelSplitHero } from '@/components/HotelSplitHero'
import { Media } from '@/components/Media'
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
import { buildMetadata } from '@/lib/seo'
import type { Metadata } from 'next'
import './HotelHomePage.css'

export const revalidate = 3600

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
    path: `/${hotel}`,
    ogImagePath: h.hero_image,
  })
}

export default async function HotelHome({ params }: { params: Promise<{ hotel: string }> }) {
  const { hotel } = await params
  const [page, h, rooms, restaurants, venues, offers, gallery] = await Promise.all([
    getPage('hotel_home', hotel),
    getHotel(hotel),
    getRooms(hotel),
    getRestaurants(hotel),
    getVenues(hotel),
    getOffers(hotel),
    getGallery(hotel),
  ])
  if (!h) notFound()

  const heroHeading = h.name || HOTEL_NAME_FALLBACK[hotel as HotelSlug]
  const heroEyebrow = `${h.location_tag} · ${h.location}`

  return (
    <>
      <HotelSplitHero
        slug={hotel as HotelSlug}
        name={heroHeading}
        eyebrow={heroEyebrow}
        description={h.tagline || h.intro_body || ''}
        image={h.hero_image ?? null}
        address={h.address}
        phone={h.phone}
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
              <span className="stat-num">{restaurants.length || '—'}</span>
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
              <p className="eyebrow">Heritage & service</p>
              <h2 className="h2">A welcome that has lasted generations</h2>
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
              <h2 className="h1">Rooms & suites</h2>
              <p className="lede">
                Spaces of quiet luxury — designed for travellers who notice the details.
              </p>
            </div>
            <div className="card-grid three">
              {rooms.slice(0, 3).map((r) => (
                <Link key={r.id} href={`/${hotel}/accommodation`} className="card">
                  <div className="figure">{r.hero_image && <Media path={r.hero_image} alt={r.name} sizes="(max-width: 768px) 50vw, 25vw" />}</div>
                  <h3>{r.name}</h3>
                  <p className="meta">{r.size_sqft ? `${r.size_sqft} sq. ft.` : ''} · {r.bed_type}</p>
                  <p className="copy">{r.description.slice(0, 120)}…</p>
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
      {restaurants.length > 0 && (
        <section className="section bg-ivory">
          <div className="container">
            <div className="section-head">
              <p className="eyebrow center">Dining</p>
              <h2 className="h1">Tables of distinction</h2>
            </div>
            <div className="card-grid three">
              {restaurants.map((r) => (
                <Link key={r.id} href={`/${hotel}/dining`} className="card">
                  <div className="figure">{r.hero_image && <Media path={r.hero_image} alt={r.name} sizes="(max-width: 768px) 50vw, 25vw" />}</div>
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
      {venues.length > 0 && (
        <section className="section bg-navy">
          <div className="container">
            <div className="section-head">
              <p className="eyebrow center" style={{ color: 'var(--c-gold-soft)' }}>Plan your event</p>
              <h2 className="h1" style={{ color: 'var(--c-ivory)' }}>
                {hotel === 'pavilion' ? 'From boardrooms to ballrooms' : 'Celebrations at a Lavelle address'}
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

      {/* Offers teaser */}
      {offers.length > 0 && (
        <section className="section bg-cream">
          <div className="container">
            <div className="section-head">
              <p className="eyebrow center">Offers</p>
              <h2 className="h1">Curated packages</h2>
            </div>
            <div className="card-grid three">
              {offers.slice(0, 3).map((o) => (
                <div key={o.id} className="card">
                  <div className="figure">{o.image && <Media path={o.image} alt={o.title} sizes="(max-width: 768px) 100vw, 33vw" />}</div>
                  <p className="card-eyebrow">{o.tag}</p>
                  <h3>{o.title}</h3>
                  <p className="copy">{o.description}</p>
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

      {/* Gallery preview */}
      {gallery.length > 0 && (
        <section className="section bg-ivory tight">
          <div className="container">
            <div className="section-head left">
              <p className="eyebrow">Gallery</p>
              <h2 className="h2">Inside {h.short_name || heroHeading}</h2>
            </div>
            <div className="image-grid">
              {gallery.slice(0, 6).map((g) => (
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
            {' · '}
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
