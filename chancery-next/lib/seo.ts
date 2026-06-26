// lib/seo.ts — Metadata + JSON-LD structured-data builders.
import type { Metadata } from 'next'
import { mediaUrl } from './media'

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.chanceryhotels.com'
// Guaranteed-present branded fallback: served by app/opengraph-image.tsx.
const DEFAULT_OG = `${SITE_URL}/opengraph-image`

export function buildMetadata(opts: {
  title: string
  description?: string
  path: string                 // e.g. "/chancery/dining"
  ogImagePath?: string | null  // Storage path; falls back to branded default OG
  noindex?: boolean
}): Metadata {
  const url = `${SITE_URL}${opts.path}`
  const ogImage = (opts.ogImagePath && mediaUrl(opts.ogImagePath)) || DEFAULT_OG
  return {
    title: opts.title,
    description: opts.description,
    alternates: { canonical: url },
    robots: opts.noindex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      type: 'website', siteName: 'Chancery Hotels', locale: 'en_IN', title: opts.title,
      description: opts.description, url, images: [ogImage],
    },
    twitter: { card: 'summary_large_image', title: opts.title, description: opts.description, images: [ogImage] },
  }
}

// ── JSON-LD structured data ─────────────────────────────────────────────────

type Site = {
  site_title: string
  tagline?: string
  brand_logo?: string | null
  instagram_url: string
  facebook_url: string
  tripadvisor_url: string
}

export function organizationJsonLd(site: Site) {
  const logo = mediaUrl(site.brand_logo)
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: site.site_title,
    url: SITE_URL,
    ...(logo ? { logo } : {}),
    sameAs: [site.instagram_url, site.facebook_url, site.tripadvisor_url].filter(Boolean),
  }
}

export function websiteJsonLd(site: Site) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    name: site.site_title,
    url: SITE_URL,
    ...(site.tagline ? { description: site.tagline } : {}),
    publisher: { '@id': `${SITE_URL}/#organization` },
  }
}

type HotelLd = {
  slug: string
  name: string
  tagline?: string
  intro_body?: string
  address: string
  phone?: string
  email?: string
  rooms_count?: number
  hero_image?: string | null
  tripadvisor_url?: string
  tripadvisor_rating?: number | null
  tripadvisor_count?: number | null
  google_rating?: number | null
  google_count?: number | null
}

// Pull a 6-digit Indian PIN ("560 025" / "560025") out of the address string.
function pinFromAddress(address: string): string | undefined {
  const m = address.match(/(\d{3}\s?\d{3})/)
  return m ? m[1].replace(/\s+/g, '') : undefined
}

// Static geo for the two physical properties (SEO-only; never shown in the UI).
// Coordinates confirmed against Google Maps.
const HOTEL_GEO: Record<string, { lat: number; lng: number }> = {
  pavilion: { lat: 12.9659, lng: 77.5986 }, // #135 Residency Road
  chancery: { lat: 12.9756, lng: 77.5992 }, // 10/6 Lavelle Road
}

export function hotelJsonLd(h: HotelLd) {
  const image = mediaUrl(h.hero_image)
  // Prefer the higher-volume Google rating; fall back to Tripadvisor.
  const rating =
    h.google_rating && h.google_count
      ? { value: h.google_rating, count: h.google_count }
      : h.tripadvisor_rating && h.tripadvisor_count
        ? { value: h.tripadvisor_rating, count: h.tripadvisor_count }
        : null
  const pin = pinFromAddress(h.address)
  const geo = HOTEL_GEO[h.slug]

  return {
    '@context': 'https://schema.org',
    '@type': 'Hotel',
    '@id': `${SITE_URL}/${h.slug}#hotel`,
    name: h.name,
    description: h.intro_body || h.tagline,
    url: `${SITE_URL}/${h.slug}`,
    ...(image ? { image } : {}),
    ...(h.phone ? { telephone: h.phone } : {}),
    ...(h.email ? { email: h.email } : {}),
    address: {
      '@type': 'PostalAddress',
      streetAddress: h.address,
      addressLocality: 'Bengaluru',
      addressRegion: 'Karnataka',
      ...(pin ? { postalCode: pin } : {}),
      addressCountry: 'IN',
    },
    ...(geo ? { geo: { '@type': 'GeoCoordinates', latitude: geo.lat, longitude: geo.lng } } : {}),
    priceRange: '₹₹₹',
    ...(h.rooms_count ? { numberOfRooms: h.rooms_count } : {}),
    ...(h.tripadvisor_url ? { sameAs: [h.tripadvisor_url] } : {}),
    ...(rating
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: rating.value,
            reviewCount: rating.count,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
  }
}

type RestaurantLd = { name: string; cuisine?: string; description?: string; hero_image?: string | null }

export function restaurantsJsonLd(restaurants: RestaurantLd[], hotel: HotelLd) {
  const pin = pinFromAddress(hotel.address)
  const address = {
    '@type': 'PostalAddress',
    streetAddress: hotel.address,
    addressLocality: 'Bengaluru',
    addressRegion: 'Karnataka',
    ...(pin ? { postalCode: pin } : {}),
    addressCountry: 'IN',
  }
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: restaurants.map((r, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Restaurant',
        name: r.name,
        ...(r.cuisine ? { servesCuisine: r.cuisine } : {}),
        ...(r.description ? { description: r.description } : {}),
        ...(mediaUrl(r.hero_image) ? { image: mediaUrl(r.hero_image) } : {}),
        ...(hotel.phone ? { telephone: hotel.phone } : {}),
        address,
        priceRange: '₹₹₹',
      },
    })),
  }
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: `${SITE_URL}${it.path}`,
    })),
  }
}
