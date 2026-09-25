import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/seo'

const HOTELS = ['chancery', 'pavilion']
const HOTEL_PAGES = ['', '/accommodation', '/dining', '/plan-your-event', '/special-offers', '/gallery', '/contact-us']
const BRAND_PAGES = ['', '/about', '/rooms', '/faq', '/careers', '/catering', '/site-map', '/privacy', '/terms', '/accessibility-statement']

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()
  const urls: string[] = [...BRAND_PAGES]
  // The Pavilion's home is / (already in BRAND_PAGES); /pavilion redirects there.
  for (const h of HOTELS) for (const p of HOTEL_PAGES) if (!(h === 'pavilion' && p === '')) urls.push(`/${h}${p}`)
  return urls.map((u) => ({
    url: `${SITE_URL}${u || '/'}`,
    lastModified,
    changeFrequency: 'weekly',
    priority: u === '' ? 1 : 0.7,
  }))
}
