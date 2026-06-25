import { notFound } from 'next/navigation'
import { CinematicHero } from '@/components/CinematicHero'
import { MediaGallery } from '@/components/MediaGallery'
import { DiningBookButton } from '@/components/DiningBookButton'
import { getHotel, getPage, getRestaurants, type HotelSlug } from '@/lib/queries/content'
import { buildMetadata } from '@/lib/seo'
import type { Metadata } from 'next'
import '../accommodation/AccommodationPage.css' // shared `.room-gallery`/`.thumb` styles for MediaGallery
import './DiningPage.css'

export const revalidate = 3600

export async function generateMetadata({ params }: { params: Promise<{ hotel: string }> }): Promise<Metadata> {
  const { hotel } = await params
  const [page, h] = await Promise.all([getPage('dining', hotel), getHotel(hotel)])
  return buildMetadata({
    title: page?.meta_title || 'Dining',
    description: page?.meta_description ?? undefined,
    path: `/${hotel}/dining`,
    ogImagePath: page?.hero_image ?? h?.hero_image,
  })
}

export default async function DiningPage({ params }: { params: Promise<{ hotel: string }> }) {
  const { hotel } = await params
  const [page, h, restaurants] = await Promise.all([
    getPage('dining', hotel),
    getHotel(hotel),
    getRestaurants(hotel),
  ])
  if (!h) notFound()
  const p = page

  return (
    <>
      <CinematicHero
        image={p?.hero_image ?? h.hero_image ?? null}
        eyebrow={h.name}
        title={p?.hero_heading ?? 'Dining'}
        script={p?.hero_subheading ?? undefined}
      />
      <section className="section">
        <div className="container">
          {p?.intro_body && (
            <div className="section-head">
              <p className="lede">{p.intro_body}</p>
            </div>
          )}
          <div className="dining-list">
            {restaurants.map((r, idx) => (
              <article key={r.id} className={`dining-row ${idx % 2 === 1 ? 'flip' : ''}`}>
                <MediaGallery hero={r.hero_image} images={r.images} name={r.name} aspect="4 / 5" />
                <div className="dining-text">
                  <p className="eyebrow">{r.cuisine}</p>
                  <h2 className="h2">{r.name}</h2>
                  <p className="meta">{r.timing}</p>
                  <p className="copy">{r.description}</p>
                  <div className="dining-cta">
                    <DiningBookButton hotel={hotel as HotelSlug} restaurant={r.name} />
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
