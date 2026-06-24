import Link from 'next/link'
import { Hero } from '@/components/Hero'
import { getHotels, getPage } from '@/lib/queries/content'
import { buildMetadata } from '@/lib/seo'

export const revalidate = 3600

const HOTEL_PAGES: Array<[string, string]> = [
  ['accommodation', 'Accommodation'],
  ['dining', 'Dining'],
  ['plan-your-event', 'Plan your event'],
  ['special-offers', 'Special offers'],
  ['gallery', 'Gallery'],
  ['contact-us', 'Contact us'],
  ['destination', 'Destination'],
]

const SITE_PAGES: Array<[string, string]> = [
  ['/', 'Home'],
  ['/rooms', 'All rooms'],
  ['/faq', 'FAQ'],
  ['/careers', 'Careers'],
  ['/catering', 'Outdoor catering'],
  ['/book', 'Book your stay'],
  ['/privacy', 'Privacy policy'],
  ['/terms', 'Terms & conditions'],
  ['/accessibility-statement', 'Accessibility statement'],
]

export async function generateMetadata() {
  const page = await getPage('sitemap')
  return buildMetadata({
    title: page?.meta_title || page?.title || 'Site Map',
    description: page?.meta_description ?? undefined,
    path: '/site-map',
    ogImagePath: page?.hero_image,
  })
}

export default async function SiteMapPage() {
  const [page, hotels] = await Promise.all([getPage('sitemap'), getHotels()])
  const p = page

  return (
    <>
      <Hero
        image={p?.hero_image ?? null}
        eyebrow={p?.hero_eyebrow ?? 'Index'}
        heading={p?.hero_heading ?? 'Site map'}
        size="compact"
      />
      <section className="section">
        <div className="container narrow">
          <div className="sitemap-columns" style={{ display: 'grid', gap: '3rem', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
            <div>
              <p className="eyebrow">Brand</p>
              <ul className="list-clean" style={{ display: 'grid', gap: '0.5rem' }}>
                {SITE_PAGES.map(([to, label]) => (
                  <li key={to}><Link href={to}>{label}</Link></li>
                ))}
              </ul>
            </div>
            {hotels.map((h) => (
              <div key={h.slug}>
                <p className="eyebrow">{h.short_name}</p>
                <ul className="list-clean" style={{ display: 'grid', gap: '0.5rem' }}>
                  <li><Link href={`/${h.slug}`}>{h.short_name} home</Link></li>
                  {HOTEL_PAGES.map(([slug, label]) => (
                    <li key={slug}><Link href={`/${h.slug}/${slug}`}>{label}</Link></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
