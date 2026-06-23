import { notFound } from 'next/navigation'
import { getHotel } from '@/lib/queries/content'
import { buildMetadata } from '@/lib/seo'
import type { Metadata } from 'next'

export const revalidate = 3600

export async function generateMetadata({ params }: { params: Promise<{ hotel: string }> }): Promise<Metadata> {
  const { hotel } = await params
  const h = await getHotel(hotel)
  if (!h) return {}
  return buildMetadata({ title: h.name, description: h.tagline, path: `/${hotel}`, ogImagePath: h.hero_image })
}

export default async function HotelHome({ params }: { params: Promise<{ hotel: string }> }) {
  const { hotel } = await params
  const h = await getHotel(hotel)
  if (!h) notFound()
  return (
    <main className="container section">
      <p className="eyebrow">{h.location_tag || h.location}</p>
      <h1 style={{ fontFamily: 'var(--f-display)' }}>{h.name}</h1>
      <p className="lede">{h.tagline}</p>
    </main>
  )
}
