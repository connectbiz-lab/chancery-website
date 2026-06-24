import { notFound } from 'next/navigation'
import { BookButton } from '@/components/BookButton'
import { HotelSplitHero } from '@/components/HotelSplitHero'
import { MediaGallery } from '@/components/MediaGallery'
import { getHotel, getPage, getRooms, type HotelSlug } from '@/lib/queries/content'
import { buildMetadata } from '@/lib/seo'
import type { Metadata } from 'next'
import './AccommodationPage.css'

export const revalidate = 3600

export async function generateMetadata({ params }: { params: Promise<{ hotel: string }> }): Promise<Metadata> {
  const { hotel } = await params
  const [page, h] = await Promise.all([getPage('accommodation', hotel), getHotel(hotel)])
  return buildMetadata({
    title: page?.meta_title || 'Accommodation',
    description: page?.meta_description ?? undefined,
    path: `/${hotel}/accommodation`,
    ogImagePath: page?.hero_image ?? h?.hero_image,
  })
}

export default async function AccommodationPage({ params }: { params: Promise<{ hotel: string }> }) {
  const { hotel } = await params
  const [page, h, rooms] = await Promise.all([
    getPage('accommodation', hotel),
    getHotel(hotel),
    getRooms(hotel),
  ])
  if (!h) notFound()
  const p = page

  return (
    <>
      <HotelSplitHero
        eyebrow={h.name}
        title={p?.hero_heading ?? 'Rooms & suites'}
        description={p?.hero_subheading ?? null}
        image={p?.hero_image ?? h.hero_image ?? null}
      />
      <section className="section">
        <div className="container">
          {p?.intro_body && (
            <div className="section-head">
              <p className="lede">{p.intro_body}</p>
            </div>
          )}
          <div className="rooms-list">
            {rooms.map((room, idx) => (
              <article key={room.id} className={`room-row ${idx % 2 === 1 ? 'flip' : ''}`}>
                <MediaGallery hero={room.hero_image} images={room.images} name={room.name} />
                <div className="room-text">
                  <p className="eyebrow">{room.size_sqft ? `${room.size_sqft} sq. ft.` : 'Room'}</p>
                  <h2 className="h2">{room.name}</h2>
                  <p className="meta">
                    {room.bed_type && <span>{room.bed_type}</span>}
                    {room.max_guests > 0 && <span>· {room.max_guests} guests</span>}
                  </p>
                  <p className="copy">{room.description}</p>
                  {room.amenities_list.length > 0 && (
                    <ul className="amenities">
                      {room.amenities_list.map((a: string, i: number) => <li key={i}>{a}</li>)}
                    </ul>
                  )}
                  <div className="room-cta">
                    <BookButton hotel={hotel as HotelSlug} className="btn">Book this room</BookButton>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
