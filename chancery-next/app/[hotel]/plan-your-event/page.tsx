import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CinematicHero } from '@/components/CinematicHero'
import { Media } from '@/components/Media'
import { EventEnquiryButton } from '@/components/EventEnquiryButton'
import { getHotel, getPage, getVenues, type HotelSlug } from '@/lib/queries/content'
import { buildMetadata } from '@/lib/seo'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import type { Metadata } from 'next'
import './EventsPage.css'

export const revalidate = 3600

const OCCASIONS = [
  { title: 'Weddings', copy: 'Grand celebrations and intimate ceremonies, styled to your vision.' },
  { title: 'Conferences & Meetings', copy: 'Boardrooms to ballrooms with full AV and business support.' },
  { title: 'Social Gatherings', copy: 'Birthdays, anniversaries and private dinners to remember.' },
  { title: 'Corporate Events', copy: 'Launches, offsites and award nights with seamless service.' },
]

const KINDS: Record<string, string> = {
  ballroom: 'Ballroom',
  banquet: 'Banquet',
  conference: 'Conference Suite',
  private_dining: 'Private Dining',
  executive: 'Executive Boardroom',
  al_fresco: 'Al Fresco',
  divisible: 'Divisible Hall',
}

export async function generateMetadata({ params }: { params: Promise<{ hotel: string }> }): Promise<Metadata> {
  const { hotel } = await params
  const [page, h] = await Promise.all([getPage('events', hotel), getHotel(hotel)])
  return buildMetadata({
    title: page?.meta_title || 'Plan Your Event',
    description: page?.meta_description ?? undefined,
    path: `/${hotel}/plan-your-event`,
    ogImagePath: page?.hero_image ?? h?.hero_image,
  })
}

export default async function EventsPage({ params }: { params: Promise<{ hotel: string }> }) {
  const { hotel } = await params
  const [page, h, venues] = await Promise.all([
    getPage('events', hotel),
    getHotel(hotel),
    getVenues(hotel),
  ])
  if (!h) notFound()
  const p = page

  return (
    <>
      <Breadcrumbs
        items={[
          { name: 'Home', path: '/' },
          { name: h.name, path: `/${hotel}` },
          { name: 'Plan Your Event', path: `/${hotel}/plan-your-event` },
        ]}
      />
      {/* Pavilion's events hero leads with the "Celebrate Every Occasion"
          banquet-hall photo as a full-bleed hero (same treatment as every other
          page), with the messaging overlaid in the site hero style. Other hotels
          keep their standard photo hero. */}
      <CinematicHero
        image={
          hotel === 'pavilion'
            ? 'pages/pavilion-events-hall.webp'
            : (p?.hero_image ?? h.hero_image ?? null)
        }
        eyebrow={hotel === 'pavilion' ? 'Celebrate every occasion' : h.name}
        title={hotel === 'pavilion' ? 'With The Chancery Pavilion' : (p?.hero_heading ?? 'Plan your event')}
        script={
          hotel === 'pavilion'
            ? 'Poolside venue · Banquet halls · Meeting rooms'
            : (p?.hero_subheading ?? undefined)
        }
        focal={hotel === 'pavilion' ? '50% 38%' : undefined}
      />
      <section className="section">
        <div className="container">
          {p?.intro_body && (
            <div className="section-head">
              <p className="lede">{p.intro_body}</p>
            </div>
          )}

          <div className="occasions">
            {OCCASIONS.map((o) => (
              <div className="occasion" key={o.title}>
                <h3>{o.title}</h3>
                <p>{o.copy}</p>
              </div>
            ))}
          </div>

          <div className="section-head" style={{ marginTop: '1rem' }}>
            <p className="eyebrow center">Our spaces</p>
            <h2 className="h2">Event spaces &amp; venues</h2>
          </div>
          <div className="venues-grid">
            {venues.map((v) => (
              <Link key={v.id} href={`/${hotel}/plan-your-event/${v.slug}`} className="venue-card">
                <div className="figure">
                  {v.hero_image
                    ? <Media path={v.hero_image} alt={v.name} sizes="(max-width: 768px) 100vw, 50vw" />
                    : <div className="figure-placeholder" />}
                </div>
                <div className="venue-body">
                  <p className="card-eyebrow">{(v.kind && KINDS[v.kind]) || v.kind || 'Venue'}</p>
                  <h3>{v.name}</h3>
                  <p className="meta">
                    {v.guests_max && <span>Up to {v.guests_max} guests</span>}
                    {v.area_sqft && <span> · {v.area_sqft.toLocaleString()} sq. ft.</span>}
                  </p>
                  <p className="copy">{v.description}</p>
                  <VenueCapacities v={v} />
                  <span className="link-arrow">View details</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-navy tight">
        <div className="container narrow text-center">
          <p className="eyebrow center" style={{ color: 'var(--c-gold-soft)' }}>Plan with us</p>
          <h2 className="h2" style={{ color: 'var(--c-ivory)' }}>
            Tell us about your occasion
          </h2>
          <p className="lede" style={{ color: 'rgba(246,241,231,0.85)' }}>
            Our Meetings &amp; Events team will craft a tailored proposal for your celebration —
            from intimate dinners to grand weddings.
          </p>
          <EventEnquiryButton hotel={hotel as HotelSlug} label="Request a proposal" className="btn light" />
        </div>
      </section>
    </>
  )
}

type Venue = Awaited<ReturnType<typeof getVenues>>[number]

function VenueCapacities({ v }: { v: Venue }) {
  const rows: Array<[string, number]> = (
    [
      ['Theatre', v.cap_theatre],
      ['Banquet', v.cap_banquet],
      ['Classroom', v.cap_classroom],
      ['U-Shape', v.cap_ushape],
      ['Cocktail', v.cap_cocktail],
    ] as Array<[string, number | null]>
  ).filter(([, n]) => n != null) as Array<[string, number]>
  if (rows.length === 0) return null
  return (
    <table className="capacity-table" aria-label={`${v.name} capacities`}>
      <tbody>
        {rows.map(([label, n]) => (
          <tr key={label}>
            <th>{label}</th>
            <td>{n}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
