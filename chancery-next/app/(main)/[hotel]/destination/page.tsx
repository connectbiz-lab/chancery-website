// app/(main)/[hotel]/destination/page.tsx — "Destination & Activities" for one
// hotel: what to do under its roof, then what to see around Bangalore. Places
// carry a Google Maps directions link from the hotel instead of quoted distances.
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CinematicHero } from '@/components/CinematicHero'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { Media } from '@/components/Media'
import { Reveal } from '@/components/Reveal'
import { getGallery, getHotel, getPage, getRestaurants } from '@/lib/queries/content'
import { HOTEL_EXPERIENCES, PLACE_GROUPS, type Experience } from '@/lib/destination'
import { directionsUrl } from '@/lib/maps'
import { buildMetadata } from '@/lib/seo'
import { hotelHomePath } from '@/lib/routes'
import type { Metadata } from 'next'
import './DestinationPage.css'

export const revalidate = 3600

const TITLE = 'Destination & Activities'

export async function generateMetadata({ params }: { params: Promise<{ hotel: string }> }): Promise<Metadata> {
  const { hotel } = await params
  const [h, page] = await Promise.all([getHotel(hotel), getPage('destination', hotel)])
  if (!h) return {}
  return buildMetadata({
    title: `${TITLE} | ${h.name}`,
    description:
      page?.meta_description ||
      `Things to do at ${h.name} and around Bangalore — dining, wellness, landmarks, parks, shopping and day trips.`,
    path: `/${hotel}/destination`,
    ogImagePath: page?.hero_image ?? h.hero_image,
  })
}

export default async function DestinationPage({ params }: { params: Promise<{ hotel: string }> }) {
  const { hotel } = await params
  const [h, page, restaurants, gallery] = await Promise.all([
    getHotel(hotel), getPage('destination', hotel), getRestaurants(hotel), getGallery(hotel),
  ])
  if (!h) notFound()

  const experiences = HOTEL_EXPERIENCES[hotel] ?? []
  const photoFor = (e: Experience): string | null => {
    if ('restaurant' in e.photo) {
      const slug = e.photo.restaurant
      return restaurants.find((r) => r.slug === slug)?.hero_image ?? null
    }
    const alt = e.photo.galleryAlt
    return gallery.find((g) => alt.test(g.alt ?? ''))?.image ?? null
  }

  return (
    <>
      <Breadcrumbs
        items={[
          { name: 'Home', path: '/' },
          { name: h.name, path: hotelHomePath(hotel) },
          { name: TITLE, path: `/${hotel}/destination` },
        ]}
      />
      <CinematicHero image={page?.hero_image ?? h.hero_image ?? null} eyebrow={h.name} title={TITLE} />

      {/* The neighbourhood — heading and intro come from the CMS 'destination' page. */}
      <section className="section bg-cream">
        <Reveal className="container narrow text-center">
          <p className="eyebrow center">Destination</p>
          <h2 className="h1">{page?.hero_heading || 'Bangalore, on Your Doorstep'}</h2>
          {page?.intro_body && <p className="lede">{page.intro_body}</p>}
        </Reveal>
      </section>

      {/* Under our roof */}
      {experiences.length > 0 && (
        <section className="section bg-ivory">
          <Reveal className="container">
            <div className="section-head">
              <p className="eyebrow center">At the Hotel</p>
              <h2 className="h1">Experiences Under Our Roof</h2>
            </div>
            <div className={`card-grid ${experiences.length === 4 ? 'four' : 'three'}`}>
              {experiences.map((e) => {
                const photo = photoFor(e)
                const inner = (
                  <>
                    {photo && (
                      <div className="figure">
                        <Media path={photo} alt={e.title} sizes="(max-width: 600px) 100vw, (max-width: 1000px) 50vw, 25vw" />
                      </div>
                    )}
                    <p className="card-eyebrow">{e.kicker}</p>
                    <h3>{e.title}</h3>
                    <p className="copy">{e.body}</p>
                  </>
                )
                return e.to ? (
                  <Link key={e.title} href={`/${hotel}/${e.to}`} className="card">{inner}</Link>
                ) : (
                  <div key={e.title} className="card">{inner}</div>
                )
              })}
            </div>
          </Reveal>
        </section>
      )}

      {/* Around the city */}
      <section className="section bg-cream">
        <Reveal className="container">
          <div className="section-head">
            <p className="eyebrow center">Around Bangalore</p>
            <h2 className="h1">Explore the Garden City</h2>
            <p className="lede">
              Palaces and parks, galleries and high streets — a short list of places our guests ask
              about most, each with directions from the hotel.
            </p>
          </div>
          <div className="dest-groups">
            {PLACE_GROUPS.map(({ Icon, title, places }) => (
              <article key={title} className="dest-group">
                <header className="dest-group__head">
                  <span className="dest-group__icon"><Icon size={26} /></span>
                  <h3>{title}</h3>
                </header>
                <ul className="dest-places">
                  {places.map((p) => (
                    <li key={p.name}>
                      <div>
                        <strong>{p.name}</strong>
                        <span>{p.note}</span>
                      </div>
                      <a
                        href={directionsUrl(h.name, h.address, p.mapQuery ?? `${p.name}, Bengaluru`)}
                        target="_blank"
                        rel="noopener"
                        aria-label={`Directions to ${p.name} from ${h.name}`}
                      >
                        Directions ↗
                      </a>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </Reveal>
      </section>

      <section className="section bg-navy tight">
        <div className="container narrow text-center">
          <p className="eyebrow center" style={{ color: 'var(--c-gold-soft)' }}>Planning Your Day</p>
          <h2 className="h2" style={{ color: 'var(--c-ivory)' }}>Tell Us What You Would Like to See</h2>
          <p className="lede" style={{ color: 'rgba(250, 249, 248, 0.88)' }}>
            Our team at {h.name} will gladly help you plan it.
          </p>
          <Link href={`/${hotel}/contact-us`} className="btn light">Contact the Hotel</Link>
        </div>
      </section>
    </>
  )
}
