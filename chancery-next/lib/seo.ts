// lib/seo.ts — Metadata + JSON-LD structured-data builders.
//
// Everything here is built from the same CMS rows the pages render, so the
// schema, /llms.txt and the visible page can't disagree. Two rules:
//   - no fact the hotel hasn't confirmed (no self-served ratings, no typed-in
//     price range, coordinates or capacities);
//   - one canonical host, from NEXT_PUBLIC_SITE_URL.
import type { Metadata } from 'next'
import { mediaUrl } from './media'
import { hotelHomePath } from '@/lib/routes'

// The canonical host is https://www.chanceryhotels.com (decided 12-10-2026).
// Every canonical tag, sitemap URL, schema @id and /llms.txt link is built on
// this one value; the bare host and http:// 308 to it at the Vercel domain level.
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.chanceryhotels.com'
export const BRAND = 'Chancery Hotels'
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
  // The root layout's template appends " | Chancery Hotels". A CMS title that
  // already names the brand ("FAQ | Chancery Hotels") would read it twice.
  const title = opts.title.includes(BRAND) ? { absolute: opts.title } : opts.title
  const description = opts.description || undefined
  return {
    title,
    description,
    alternates: { canonical: url },
    robots: opts.noindex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      type: 'website', siteName: BRAND, locale: 'en_IN', title: opts.title,
      description, url, images: [ogImage],
    },
    twitter: { card: 'summary_large_image', title: opts.title, description, images: [ogImage] },
  }
}

/** Metadata for a hotel-scoped page. The CMS title/description win; without
 *  them the fallback names the hotel and its road, so the two hotels never ship
 *  the same title ("Dining") and no page ships without a description. */
export function hotelPageMetadata(opts: {
  label: string
  hotel: { name: string; location?: string | null; hero_image?: string | null }
  page?: { meta_title?: string | null; meta_description?: string | null; hero_image?: string | null } | null
  path: string
  description: string
}): Metadata {
  const { hotel, page } = opts
  return buildMetadata({
    title: page?.meta_title || `${opts.label} — ${hotelWhere(hotel)}`,
    description: page?.meta_description || opts.description,
    path: opts.path,
    ogImagePath: page?.hero_image ?? hotel.hero_image,
  })
}

/** "The Chancery Pavilion, Residency Road" — the hotel and its road. */
export const hotelWhere = (h: { name: string; location?: string | null }) =>
  h.location ? `${h.name}, ${h.location}` : h.name

// ── Google listing ──────────────────────────────────────────────────────────

// Each hotel's Google Business listing, as Google itself reports it: the
// listing link (maps.google.com/?cid=…) and the pin's coordinates. These go in
// the Hotel schema (sameAs + geo) and /llms.txt, where they are the strongest
// signal of which business the site is.
//
// Read them from Google — the Places API by place id (`url` and
// `geometry.location`), or the listing's own share link — and NEVER type them
// in from memory or a map search. Until they are read, both stay out.
// TODO(launch): fill from the Places API for each hotel's place id.
export const GOOGLE_LISTING: Record<string, { mapsUrl: string; lat: number; lng: number } | null> = {
  pavilion: null,
  chancery: null,
}

// ── Address ─────────────────────────────────────────────────────────────────

/** Split the CMS address ("#135, Residency Road, Bangalore 560 025") into
 *  PostalAddress fields, keeping the CMS spelling so the schema, footer and
 *  /llms.txt say the same thing. An address that doesn't fit the pattern goes
 *  through whole as streetAddress rather than being guessed at. */
export function postalAddress(address: string) {
  const m = address.trim().match(/^(.+),\s*([^,\d]+?)\s*[-,]?\s*(\d{3}\s?\d{3})\s*$/)
  return {
    '@type': 'PostalAddress',
    streetAddress: m ? m[1].trim() : address.trim(),
    ...(m ? { addressLocality: m[2].trim(), postalCode: m[3].replace(/\s+/g, '') } : {}),
    addressRegion: 'Karnataka',
    addressCountry: 'IN',
  }
}

// ── JSON-LD structured data ─────────────────────────────────────────────────

const ORG_ID = `${SITE_URL}/#organization`
export const hotelId = (slug: string) => `${SITE_URL}${hotelHomePath(slug)}#hotel`

type Site = {
  site_title: string
  tagline?: string
  brand_logo?: string | null
  instagram_url: string
  facebook_url: string
  tripadvisor_url: string
}

export function organizationJsonLd(site: Site, hotels: { slug: string }[] = []) {
  const logo = mediaUrl(site.brand_logo)
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': ORG_ID,
    name: site.site_title,
    url: SITE_URL,
    ...(logo ? { logo } : {}),
    sameAs: [site.instagram_url, site.facebook_url, site.tripadvisor_url].filter(Boolean),
    // The group's address and phone are its hotels'; each Hotel carries its own.
    ...(hotels.length ? { subOrganization: hotels.map((h) => ({ '@id': hotelId(h.slug) })) } : {}),
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
    publisher: { '@id': ORG_ID },
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
}

type RestaurantLd = {
  name: string
  slug?: string
  cuisine?: string
  description?: string
  hero_image?: string | null
}

type VenueLd = {
  name: string
  slug: string
  description?: string
  hero_image?: string | null
  guests_max?: number | null
  area_sqft?: number | null
}

function restaurantLd(r: RestaurantLd, hotel: HotelLd) {
  const image = mediaUrl(r.hero_image)
  const page = `${SITE_URL}/${hotel.slug}/dining`
  return {
    '@type': 'Restaurant',
    '@id': `${page}#${r.slug || encodeURIComponent(r.name)}`,
    name: r.name,
    url: page,
    ...(r.cuisine ? { servesCuisine: r.cuisine } : {}),
    ...(r.description ? { description: r.description } : {}),
    ...(image ? { image } : {}),
    ...(hotel.phone ? { telephone: hotel.phone } : {}),
    address: postalAddress(hotel.address),
    containedInPlace: { '@id': hotelId(hotel.slug) },
  }
}

function venueLd(v: VenueLd, hotel: HotelLd) {
  const image = mediaUrl(v.hero_image)
  const url = `${SITE_URL}/${hotel.slug}/plan-your-event/${v.slug}`
  return {
    '@type': 'EventVenue',
    '@id': `${url}#venue`,
    name: v.name,
    url,
    ...(v.description ? { description: v.description } : {}),
    ...(image ? { image } : {}),
    // Capacity and area only as the CMS holds them — never estimated.
    ...(v.guests_max != null ? { maximumAttendeeCapacity: v.guests_max } : {}),
    ...(v.area_sqft != null ? { floorSize: { '@type': 'QuantitativeValue', value: v.area_sqft, unitCode: 'FTK' } } : {}),
    containedInPlace: { '@id': hotelId(hotel.slug) },
  }
}

export function hotelJsonLd(
  h: HotelLd,
  places: { restaurants?: RestaurantLd[]; venues?: VenueLd[] } = {},
) {
  const image = mediaUrl(h.hero_image)
  const listing = GOOGLE_LISTING[h.slug]
  const sameAs = [h.tripadvisor_url, listing?.mapsUrl].filter(Boolean)
  const containsPlace = [
    ...(places.restaurants ?? []).map((r) => restaurantLd(r, h)),
    ...(places.venues ?? []).map((v) => venueLd(v, h)),
  ]
  // No aggregateRating: Google ignores self-served stars and the Rich Results
  // test fails the page for them. The stars live on the Google listings.
  // No priceRange until the hotel confirms one.
  return {
    '@context': 'https://schema.org',
    '@type': 'Hotel',
    '@id': hotelId(h.slug),
    name: h.name,
    description: h.intro_body || h.tagline,
    url: `${SITE_URL}${hotelHomePath(h.slug)}`,
    ...(image ? { image } : {}),
    ...(h.phone ? { telephone: h.phone } : {}),
    ...(h.email ? { email: h.email } : {}),
    address: postalAddress(h.address),
    ...(listing ? { geo: { '@type': 'GeoCoordinates', latitude: listing.lat, longitude: listing.lng } } : {}),
    ...(h.rooms_count ? { numberOfRooms: h.rooms_count } : {}),
    ...(sameAs.length ? { sameAs } : {}),
    parentOrganization: { '@id': ORG_ID },
    ...(containsPlace.length ? { containsPlace } : {}),
  }
}

export function restaurantsJsonLd(restaurants: RestaurantLd[], hotel: HotelLd) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: restaurants.map((r, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: restaurantLd(r, hotel),
    })),
  }
}

export function venueJsonLd(v: VenueLd, hotel: HotelLd) {
  return { '@context': 'https://schema.org', ...venueLd(v, hotel) }
}

export function faqJsonLd(items: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((it) => ({
      '@type': 'Question',
      name: it.question,
      acceptedAnswer: { '@type': 'Answer', text: it.answer },
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
