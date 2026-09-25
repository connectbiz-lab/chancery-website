import Link from 'next/link'
import { Hero } from '@/components/Hero'
import { Media } from '@/components/Media'
import { getHotels, getPage, getRooms } from '@/lib/queries/content'
import { buildMetadata } from '@/lib/seo'

export const revalidate = 3600

export async function generateMetadata() {
  const page = await getPage('rooms')
  return buildMetadata({
    title: page?.meta_title || page?.title || 'Suites & Rooms',
    description: page?.meta_description ?? undefined,
    path: '/rooms',
    ogImagePath: page?.hero_image,
  })
}

export default async function RoomsPage() {
  const [page, hotels, allRooms] = await Promise.all([
    getPage('rooms'),
    getHotels(),
    getRooms(),
  ])
  const p = page

  return (
    <>
      <Hero
        image={p?.hero_image ?? hotels.find((h) => h.slug === 'pavilion')?.hero_image ?? null}
        eyebrow={p?.hero_eyebrow ?? 'Stays'}
        heading={p?.hero_heading ?? 'Rooms & suites'}
        subheading={p?.hero_subheading ?? undefined}
        size="page"
      />

      {hotels.map((hotel) => {
        const hotelRooms = allRooms.filter((r) => r.hotel?.slug === hotel.slug)
        if (hotelRooms.length === 0) return null
        return (
          <section key={hotel.slug} className="section">
            <div className="container">
              <div className="section-head left">
                <p className="eyebrow">{hotel.location}</p>
                <h2 className="h1">{hotel.name}</h2>
                <p className="lede">{hotel.tagline}</p>
              </div>
              <div className="card-grid three">
                {hotelRooms.map((room) => (
                  <Link key={room.id} href={`/${hotel.slug}/accommodation`} className="card">
                    <div className="figure">
                      {room.hero_image && (
                        <Media path={room.hero_image} alt={room.name} sizes="(max-width: 768px) 100vw, 50vw" />
                      )}
                    </div>
                    <h3>{room.name}</h3>
                    <p className="meta">
                      {room.size_sqft ? `${room.size_sqft} sq. ft.` : ''}
                      {room.bed_type ? ` · ${room.bed_type}` : ''}
                    </p>
                    <p className="copy">{room.description.slice(0, 130)}…</p>
                  </Link>
                ))}
              </div>
              <div className="text-center" style={{ marginTop: '3rem' }}>
                <Link href={`/${hotel.slug}/accommodation`} className="btn ghost">
                  View all rooms at {hotel.short_name}
                </Link>
              </div>
            </div>
          </section>
        )
      })}
    </>
  )
}
