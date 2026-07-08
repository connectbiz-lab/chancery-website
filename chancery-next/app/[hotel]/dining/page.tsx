import { notFound } from 'next/navigation'
import { CinematicHero } from '@/components/CinematicHero'
import { MediaGallery } from '@/components/MediaGallery'
import { DiningBookButton } from '@/components/DiningBookButton'
import { getHotel, getPage, getRestaurants, type HotelSlug } from '@/lib/queries/content'
import { buildMetadata, restaurantsJsonLd } from '@/lib/seo'
import { mediaUrl } from '@/lib/media'
import { JsonLd } from '@/components/JsonLd'
import { Breadcrumbs } from '@/components/Breadcrumbs'
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

  // Pavilion's dining hero leads with a looping montage of Alchemy — its
  // award-winning rooftop restaurant & microbrewery; other hotels keep the photo.
  const heroVideo = hotel === 'pavilion' ? mediaUrl('video/alchemy-dining-hero.mp4') : null
  const heroPoster = hotel === 'pavilion' ? mediaUrl('video/alchemy-dining-hero-poster.jpg') : null

  return (
    <>
      {restaurants.length > 0 && <JsonLd data={restaurantsJsonLd(restaurants, h)} />}
      <Breadcrumbs
        items={[
          { name: 'Home', path: '/' },
          { name: h.name, path: `/${hotel}` },
          { name: 'Dining', path: `/${hotel}/dining` },
        ]}
      />
      <CinematicHero
        image={p?.hero_image ?? h.hero_image ?? null}
        video={heroVideo}
        poster={heroPoster}
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
            {restaurants.map((r, idx) => {
              // Imageless outlets (e.g. In-Room Dining) render as a centered
              // text block instead of a half-empty two-column row.
              const hasMedia = Boolean(r.hero_image || (r.images && r.images.length > 0))
              return (
                <article
                  key={r.id}
                  className={`dining-row ${hasMedia ? (idx % 2 === 1 ? 'flip' : '') : 'dining-row--text-only'}`}
                >
                  {hasMedia && (
                    <MediaGallery hero={r.hero_image} images={r.images} name={r.name} aspect="4 / 5" />
                  )}
                  <div className="dining-text">
                    <p className="eyebrow">{r.cuisine}</p>
                    <h2 className="h2">{r.name}</h2>
                    <p className="meta">{r.timing}</p>
                    <p className="copy">{r.description}</p>
                    {hasMedia && (
                      <div className="dining-cta">
                        <DiningBookButton hotel={hotel as HotelSlug} restaurant={r.name} />
                      </div>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </section>
    </>
  )
}
