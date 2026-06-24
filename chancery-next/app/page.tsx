import { getHotels, getSiteContent } from '@/lib/queries/content'
import { buildMetadata } from '@/lib/seo'
import Link from 'next/link'
export const revalidate = 3600
export async function generateMetadata() {
  const site = await getSiteContent()
  return buildMetadata({ title: site.site_title, description: site.tagline, path: '/' })
}
export default async function Home() {
  const hotels = await getHotels()
  return (
    <main className="container section">
      <p className="eyebrow center">Bengaluru</p>
      <h1 className="text-center" style={{ fontFamily: 'var(--f-display)' }}>Chancery Hotels</h1>
      <div className="card-grid">
        {hotels.map((h) => (
          <Link key={h.slug} href={`/${h.slug}`} className="link-arrow">{h.name}</Link>
        ))}
      </div>
    </main>
  )
}
