import { CinematicHero } from '@/components/CinematicHero'
import { GalleryLightbox } from '@/components/GalleryLightbox'
import { getHotel, getPage, getGallery } from '@/lib/queries/content'
import { buildMetadata } from '@/lib/seo'
import type { Metadata } from 'next'
import './GalleryPage.css'

export const revalidate = 3600

export async function generateMetadata({ params }: { params: Promise<{ hotel: string }> }): Promise<Metadata> {
  const { hotel } = await params
  const [page, h] = await Promise.all([getPage('gallery', hotel), getHotel(hotel)])
  return buildMetadata({
    title: page?.meta_title || 'Gallery',
    description: page?.meta_description ?? undefined,
    path: `/${hotel}/gallery`,
    ogImagePath: page?.hero_image ?? h?.hero_image,
  })
}

export default async function GalleryPage({ params }: { params: Promise<{ hotel: string }> }) {
  const { hotel } = await params
  const [page, h, gallery] = await Promise.all([
    getPage('gallery', hotel),
    getHotel(hotel),
    getGallery(hotel),
  ])
  const p = page

  return (
    <>
      <CinematicHero
        image={p?.hero_image ?? h?.hero_image ?? null}
        eyebrow={h?.name ?? 'The Chancery'}
        title={p?.hero_heading ?? 'Gallery'}
        script={p?.hero_subheading ?? undefined}
      />
      <section className="section">
        <div className="container">
          <GalleryLightbox images={gallery.map((g) => ({ image: g.image, alt: g.alt, category: g.category }))} />
        </div>
      </section>
    </>
  )
}
