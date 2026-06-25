import { CinematicHero } from '@/components/CinematicHero'
import { ContactForm } from '@/components/ContactForm'
import { DeptIcon } from '@/components/DeptIcon'
import { getHotel, getHotels, getPage, type HotelSlug } from '@/lib/queries/content'
import { mapsUrl } from '@/lib/maps'
import { buildMetadata } from '@/lib/seo'
import type { Metadata } from 'next'
import './ContactPage.css'

export const revalidate = 3600

type HotelWithDepts = Awaited<ReturnType<typeof getHotels>>[number]

export async function generateMetadata({ params }: { params: Promise<{ hotel: string }> }): Promise<Metadata> {
  const { hotel } = await params
  const [page, h] = await Promise.all([getPage('contact', hotel), getHotel(hotel)])
  return buildMetadata({
    title: page?.meta_title || 'Contact Us',
    description: page?.meta_description ?? undefined,
    path: `/${hotel}/contact-us`,
    ogImagePath: page?.hero_image ?? h?.hero_image,
  })
}

function HotelContact({ h }: { h: HotelWithDepts }) {
  const mapUrl = mapsUrl(h.name, h.address)
  return (
    <article className="hotel-contact">
      <p className="eyebrow">{h.short_name}</p>
      <h2 className="h3">{h.name}</h2>
      <p className="hc-address">
        {h.address}
        <a className="hc-map" href={mapUrl} target="_blank" rel="noopener">
          View on map
        </a>
      </p>
      <p className="hc-phones">
        <a href={`tel:${h.phone.replace(/[\s-]+/g, '')}`}>{h.phone}</a>
        {h.phone_alt && (
          <a href={`tel:${h.phone_alt.replace(/[\s-]+/g, '')}`}>{h.phone_alt}</a>
        )}
      </p>
      {(h.departments ?? []).length > 0 && (
        <ul className="hc-depts">
          {h.departments.map((d) => (
            <li key={d.label}>
              <span className="dept-icon"><DeptIcon department={d.department} /></span>
              <div className="dept-card__body">
                <span className="dept-name">{d.label}</span>
                <a href={`mailto:${d.email}`}>{d.email}</a>
                {d.phone && (
                  <a href={`tel:${d.phone.replace(/[\s-]+/g, '')}`} className="dept-phone">
                    {d.phone}
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </article>
  )
}

export default async function ContactUsPage({ params }: { params: Promise<{ hotel: string }> }) {
  const { hotel } = await params
  const [page, hotels] = await Promise.all([getPage('contact', hotel), getHotels()])
  const p = page
  const current = hotels.find((h) => h.slug === hotel)

  return (
    <>
      <CinematicHero
        image={p?.hero_image ?? current?.hero_image ?? null}
        eyebrow={current?.name ?? 'The Chancery Group of Hotels'}
        title="Get in touch"
        script={p?.hero_subheading ?? undefined}
      />

      <section className="section contact-section">
        <div className="container">
          {/* Both properties — every number is reachable here, whichever page you came from. */}
          <div className="contacts-duo">
            {hotels.map((h) => <HotelContact key={h.slug} h={h} />)}
          </div>

          {/* Enquiry form — landscape, below the contacts. */}
          <ContactForm hotel={hotel as HotelSlug} />
        </div>
      </section>
    </>
  )
}
