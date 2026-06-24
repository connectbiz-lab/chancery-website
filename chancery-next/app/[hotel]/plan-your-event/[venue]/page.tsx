import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Hero } from '@/components/Hero'
import { Media } from '@/components/Media'
import { EventEnquiryButton } from '@/components/EventEnquiryButton'
import { getVenues, type HotelSlug } from '@/lib/queries/content'
import { buildMetadata } from '@/lib/seo'
import type { Metadata } from 'next'
import './VenueDetailPage.css'

export const revalidate = 3600

const KINDS: Record<string, string> = {
  ballroom: 'Ballroom',
  banquet: 'Banquet',
  conference: 'Conference Suite',
  private_dining: 'Private Dining',
  executive: 'Executive Boardroom',
  al_fresco: 'Al Fresco',
  divisible: 'Divisible Hall',
}

const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`

export async function generateMetadata(
  { params }: { params: Promise<{ hotel: string; venue: string }> },
): Promise<Metadata> {
  const { hotel, venue } = await params
  const venues = await getVenues(hotel)
  const v = venues.find((x: any) => x.slug === venue)
  if (!v) return {}
  return buildMetadata({
    title: `${v.name} — ${v.hotel.name}`,
    description: v.description ?? undefined,
    path: `/${hotel}/plan-your-event/${venue}`,
    ogImagePath: v.hero_image,
  })
}

export default async function VenueDetailPage(
  { params }: { params: Promise<{ hotel: string; venue: string }> },
) {
  const { hotel, venue } = await params
  const venues = await getVenues(hotel)
  const v = venues.find((x: any) => x.slug === venue)
  if (!v) notFound()

  const facts: Array<[string, string]> = (
    [
      v.area_sqft ? ['Area', `${v.area_sqft.toLocaleString()} sq. ft.`] : null,
      v.dimensions ? ['Dimensions', v.dimensions] : null,
      v.ceiling_ft ? ['Ceiling', `${v.ceiling_ft} ft`] : null,
      v.guests_max ? ['Max guests', `${v.guests_max}`] : null,
    ] as Array<[string, string] | null>
  ).filter(Boolean) as Array<[string, string]>

  const capacities: Array<[string, number]> = (
    [
      ['Theatre', v.cap_theatre],
      ['Banquet', v.cap_banquet],
      ['Classroom', v.cap_classroom],
      ['U-Shape', v.cap_ushape],
      ['Cocktail / Reception', v.cap_cocktail],
    ] as Array<[string, number | null]>
  ).filter(([, n]) => n != null) as Array<[string, number]>

  const pricing: Array<[string, number]> = (
    [
      ['Half day', v.half_day_inr],
      ['Full day', v.full_day_inr],
      ['Per plate', v.per_plate_inr],
    ] as Array<[string, number | null]>
  ).filter(([, n]) => n != null) as Array<[string, number]>

  const gallery = v.images.length > 0
    ? v.images
    : (v.hero_image ? [{ image: v.hero_image, alt: v.name, order: 0 }] : [])

  const kindLabel = (v.kind && (KINDS[v.kind] || v.kind)) || 'Event Space'

  return (
    <>
      <Hero
        image={v.hero_image}
        eyebrow={
          <span className="hero-eyebrow-stack">
            <span>{v.hotel.name}</span>
            <span>{kindLabel}</span>
          </span>
        }
        heading={v.name}
        size="page"
      />

      <section className="section">
        <div className="container">
          <Link href={`/${hotel}/plan-your-event`} className="link-arrow back">← All event spaces</Link>

          <div className="venue-detail">
            <div className="venue-detail__main">
              <p className="eyebrow">{kindLabel}</p>
              <h2 className="h2">{v.name}</h2>
              {v.description && <p className="lede">{v.description}</p>}

              {facts.length > 0 && (
                <ul className="venue-facts">
                  {facts.map(([k, val]) => (
                    <li key={k}><span className="vf-label">{k}</span><span className="vf-value">{val}</span></li>
                  ))}
                </ul>
              )}
            </div>

            <aside className="venue-detail__aside">
              {capacities.length > 0 && (
                <div className="venue-panel">
                  <h3 className="vp-title">Capacity by layout</h3>
                  <table className="venue-cap">
                    <tbody>
                      {capacities.map(([label, n]) => (
                        <tr key={label}><th>{label}</th><td>{n}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {pricing.length > 0 && (
                <div className="venue-panel">
                  <h3 className="vp-title">Indicative pricing</h3>
                  <table className="venue-cap">
                    <tbody>
                      {pricing.map(([label, n]) => (
                        <tr key={label}><th>{label}</th><td>{inr(n)}</td></tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="vp-note">Final pricing depends on dates, menu and setup.</p>
                </div>
              )}
              <EventEnquiryButton hotel={hotel as HotelSlug} venue={v.name} label="Enquire about this venue" />
            </aside>
          </div>

          {gallery.length > 0 && (
            <div className="venue-gallery">
              {gallery.map((img: any, i: number) => (
                <div className="figure" key={i}>
                  <Media path={img.image} alt={img.alt || v.name} sizes="(max-width: 768px) 100vw, 33vw" />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
