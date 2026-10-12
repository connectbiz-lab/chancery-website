import type { MetadataRoute } from 'next'
import { getContentDates } from '@/lib/queries/content'
import { SITE_URL } from '@/lib/seo'

const HOTELS = ['chancery', 'pavilion'] as const
const BRAND_PAGES = ['', '/about', '/rooms', '/faq', '/careers', '/catering', '/site-map', '/privacy', '/terms', '/accessibility-statement']
const HOTEL_PAGES = ['', '/accommodation', '/dining', '/plan-your-event', '/special-offers', '/gallery', '/destination', '/awards', '/contact-us']

// The CMS `page` row behind each brand page (page.hotel_id is null for these).
const BRAND_KIND: Record<string, string> = {
  '/rooms': 'rooms', '/faq': 'faq', '/careers': 'careers', '/catering': 'catering',
  '/site-map': 'sitemap', '/privacy': 'privacy', '/terms': 'terms', '/accessibility-statement': 'accessibility',
}
// …and behind each hotel page.
const HOTEL_KIND: Record<string, string> = {
  '': 'hotel_home', '/accommodation': 'accommodation', '/dining': 'dining', '/plan-your-event': 'events',
  '/special-offers': 'offers', '/gallery': 'gallery', '/destination': 'destination', '/contact-us': 'contact',
}

/**
 * lastmod is when the page's CONTENT last changed — the newest updated_at of the
 * CMS rows it renders — never the build time: a date that moves on every
 * deploy teaches Google to ignore it. A page built only from code (About,
 * Awards) carries no lastmod rather than an invented one. No changeFrequency
 * or priority: Google ignores both.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const d = await getContentDates()
  const forHotel = <T extends { hotel: { slug: string } | null }>(rows: T[], slug: string) =>
    rows.filter((r) => r.hotel?.slug === slug)
  const page = (kind: string, slug?: string) =>
    d.pages.filter((p) => p.kind === kind && (slug ? p.hotel?.slug === slug : !p.hotel))

  const entries: { path: string; dates: string[] }[] = []
  for (const p of BRAND_PAGES) {
    if (p === '') continue // the home page is the Pavilion's hotel home, below
    entries.push({
      path: p,
      dates: [
        ...page(BRAND_KIND[p] ?? '').map((r) => r.updated_at),
        ...(p === '/rooms' ? d.rooms.map((r) => r.updated_at) : []),
      ],
    })
  }
  for (const h of HOTELS) {
    const rows = {
      hotel: d.hotels.filter((r) => r.slug === h).map((r) => r.updated_at),
      rooms: forHotel(d.rooms, h).map((r) => r.updated_at),
      restaurants: forHotel(d.restaurants, h).map((r) => r.updated_at),
      venues: forHotel(d.venues, h).map((r) => r.updated_at),
      // Offers with no hotel are shared by both.
      offers: d.offers.filter((o) => !o.hotel || o.hotel.slug === h).map((r) => r.updated_at),
    }
    const related: Record<string, string[]> = {
      '': [...rows.hotel, ...rows.rooms, ...rows.restaurants, ...rows.venues, ...rows.offers],
      '/accommodation': rows.rooms,
      '/dining': rows.restaurants,
      '/plan-your-event': rows.venues,
      '/special-offers': rows.offers,
      '/contact-us': rows.hotel,
    }
    for (const p of HOTEL_PAGES) {
      entries.push({
        // The Pavilion's home is / (/pavilion redirects there).
        path: h === 'pavilion' && p === '' ? '' : `/${h}${p}`,
        dates: [...(HOTEL_KIND[p] ? page(HOTEL_KIND[p], h).map((r) => r.updated_at) : []), ...(related[p] ?? [])],
      })
    }
  }
  // Venue pages come from the CMS, so the list can't drift from what's published.
  for (const v of d.venues) {
    if (v.hotel?.slug) entries.push({ path: `/${v.hotel.slug}/plan-your-event/${v.slug}`, dates: [v.updated_at] })
  }

  return entries
    .sort((a, b) => (a.path === '' ? -1 : b.path === '' ? 1 : 0))
    .map(({ path, dates }) => {
      const newest = dates.filter(Boolean).sort().at(-1)
      return { url: `${SITE_URL}${path || '/'}`, ...(newest ? { lastModified: new Date(newest) } : {}) }
    })
}
