# Chancery Rebuild — Phase 3a: App Shell & Data Layer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up the public-site foundation in `chancery-next`: fonts + global design-token CSS, the Supabase media URL + `next/image` setup, a typed server-side query layer (replacing the old `api.ts`, including the Django-serializer-derived fields), SEO scaffolding (Metadata helper, JSON-LD, sitemap, robots), hotel-scoped routing with slug validation, and the shared chrome (Navbar, SideMenu, Footer, Hero, ScrollToTop, BookButton, image wrapper). Exit: the site shell renders real migrated data, nav/menu work, invalid hotel → 404.

**Architecture:** Public pages are React Server Components that read Supabase through a non-cookie anon client (RLS public-read), wrapped in React `cache()`; routes use ISR (`revalidate`), with on-demand revalidation added in Phase 4. Interactive chrome (nav, menu, scroll, newsletter form) are small `'use client'` islands. Hotel scope comes from the `[hotel]` route segment, validated in a layout. Images render via `next/image` from Supabase Storage public URLs.

**Tech Stack:** Next.js App Router, React Server Components, `next/font/google`, `next/image`, `@supabase/supabase-js`, TypeScript.

**Reference:** spec `docs/superpowers/specs/2026-06-23-supabase-vercel-rebuild-design.md` §2,§7; the legacy frontend at `frontend/src` (port source of truth); design tokens in `frontend/src/styles/globals.css`.

**Prerequisites:** Supabase stack running; Phase 1+2 done (data migrated — `npm run migrate` reproduces it). `.env.local` present. `psql` via `docker exec -i supabase_db_chancery-next psql -U postgres -d postgres`. Type-check with `next build` (NOT bare `tsc`). Run dev servers BACKGROUNDED and stop them after checks.

**Scope note:** This is the FIRST of three Phase-3 sub-plans. Brand pages (3b) and hotel pages (3c) follow. 3a builds shell + data + chrome + ONE proof-of-shell home/hotel-home stub; the full page ports are 3b/3c.

---

## File structure (this sub-phase)

```
chancery-next/
  next.config.ts                 # + images.remotePatterns (Supabase storage host)
  app/
    layout.tsx                   # root: fonts, globals.css, <Navbar/> <Footer/> <ScrollToTop/>, base metadata, Org JSON-LD
    globals.css                  # ported design tokens + base + utilities (replaces create-next-app css)
    page.tsx                     # brand home — minimal proof-of-shell (full version in 3b)
    [hotel]/layout.tsx           # validate slug -> notFound(); HotelScope provider
    [hotel]/page.tsx             # hotel home — minimal proof-of-shell (full version in 3c)
    sitemap.ts                   # generated sitemap
    robots.ts                    # robots
    api/newsletter/route.ts      # POST: insert newsletter_subscriber (service role) — makes Footer work
  lib/
    media.ts                     # mediaUrl(path) -> Supabase public URL
    booking.ts                   # ported SynXis deep-link builder
    seo.ts                       # buildMetadata(); SITE_URL; org JSON-LD object
    hotel-scope.tsx              # 'use client' context for active hotel (chrome)
    queries/
      db.ts                      # non-cookie anon client + cached() helper
      content.ts                 # all read functions (+ derived fields), typed
  components/
    Navbar.tsx (+ .css)          # 'use client'
    SideMenu.tsx (+ .css)        # 'use client'
    Footer.tsx (+ .css)          # 'use client' (newsletter form)
    Hero.tsx (+ .css)            # server component
    ScrollToTop.tsx (+ .css)     # 'use client'
    BookButton.tsx               # server component (anchor)
    Media.tsx                    # next/image wrapper (server component)
    JsonLd.tsx                   # server component: JSON-LD <script>
```

Port CSS/markup faithfully from the matching `frontend/src` files; the design must look the same.

---

## Task 1: Media URL helper + `next/image` config + public DB client

**Files:**
- Modify: `chancery-next/next.config.ts`
- Create: `chancery-next/lib/media.ts`, `chancery-next/lib/queries/db.ts`

- [ ] **Step 1: `lib/media.ts`**

```typescript
// lib/media.ts — build a public URL for a Supabase Storage object path.
const BASE = process.env.NEXT_PUBLIC_SUPABASE_URL!

/** path like "hotels/hero.webp" -> full public URL. Empty/none -> null. */
export function mediaUrl(path: string | null | undefined): string | null {
  if (!path) return null
  return `${BASE}/storage/v1/object/public/media/${path}`
}
```

- [ ] **Step 2: configure `next/image` remote pattern**

Replace `chancery-next/next.config.ts` with:
```typescript
import type { NextConfig } from 'next'

// Allow next/image to optimize images served from Supabase Storage.
const supabaseUrl = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'http://127.0.0.1:54321')

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: supabaseUrl.protocol.replace(':', '') as 'http' | 'https',
        hostname: supabaseUrl.hostname,
        port: supabaseUrl.port || undefined,
        pathname: '/storage/v1/object/public/media/**',
      },
    ],
  },
}

export default nextConfig
```

- [ ] **Step 3: `lib/queries/db.ts` — non-cookie anon client + request cache**

```typescript
// lib/queries/db.ts — server-side Supabase client for PUBLIC reads (RLS public-read).
// No cookies -> pages can be statically rendered + ISR. Wrap reads in cache() for
// per-request dedupe.
import { createClient } from '@supabase/supabase-js'
import { cache } from 'react'
import type { Database } from '@/lib/supabase/types'

export const db = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { persistSession: false } },
)

export { cache }
```

- [ ] **Step 4: Verify the client reads through RLS**

Create a throwaway check route `app/_check/route.ts`:
```typescript
import { db } from '@/lib/queries/db'
export async function GET() {
  const { data, error } = await db.from('hotel').select('slug,name').order('order')
  return Response.json({ error, hotels: data })
}
```
Run dev backgrounded, then:
```bash
cd /Users/jagraj/Documents/Github/chancery-website-v2/chancery-next
curl -s http://localhost:3000/_check
```
Expected: JSON with `"hotels":[{...chancery...},{...pavilion...}]`, `"error":null`. Then DELETE `app/_check/` (it was only a probe) and stop dev.

- [ ] **Step 5: Commit**

```bash
cd /Users/jagraj/Documents/Github/chancery-website-v2
git add chancery-next/next.config.ts chancery-next/lib/media.ts chancery-next/lib/queries/db.ts
git commit -m "feat(web): media URL helper, next/image config, public read client"
```

---

## Task 2: Fonts + global CSS (design tokens) port

**Files:**
- Create: `chancery-next/app/globals.css` (ported)
- Modify: `chancery-next/app/layout.tsx` (fonts + import), delete leftover `app/page.module.css` usage

- [ ] **Step 1: Copy the legacy global stylesheet**

Copy `frontend/src/styles/globals.css` to `chancery-next/app/globals.css` verbatim, then make EXACTLY these edits:
- Remove any `@import url(...fonts.googleapis...)` / `@font-face` lines (fonts now load via `next/font`).
- In the `:root` token block, change the three font stacks to reference the next/font CSS variables:
  - `--f-display: var(--font-fraunces), "Cormorant Garamond", Georgia, serif;`
  - `--f-serif: var(--font-cormorant), Georgia, serif;`
  - `--f-sans: var(--font-inter), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;`
- Leave all other tokens, utilities, `.btn`, `.figure`, `.skeleton`, etc. unchanged.

- [ ] **Step 2: Wire fonts + global CSS in the root layout**

Replace `chancery-next/app/layout.tsx` with:
```tsx
import type { Metadata } from 'next'
import { Fraunces, Cormorant_Garamond, Inter } from 'next/font/google'
import './globals.css'

const fraunces = Fraunces({ subsets: ['latin'], variable: '--font-fraunces', display: 'swap' })
const cormorant = Cormorant_Garamond({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-cormorant', display: 'swap' })
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })

export const metadata: Metadata = {
  title: { default: 'Chancery Hotels', template: '%s | Chancery Hotels' },
  description: 'Luxury hotels in Bangalore — The Chancery Hotel and Chancery Pavilion.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${cormorant.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  )
}
```
(Navbar/Footer/ScrollToTop are added to this layout in Task 7 once they exist.)

- [ ] **Step 3: Remove create-next-app boilerplate CSS**

Delete `chancery-next/app/page.module.css` if present. Replace `app/page.tsx` temporarily with a minimal token check:
```tsx
export default function Home() {
  return (
    <main className="container section">
      <p className="eyebrow">Chancery Hotels</p>
      <h1 style={{ fontFamily: 'var(--f-display)' }}>Design tokens load</h1>
    </main>
  )
}
```

- [ ] **Step 4: Verify build + fonts/tokens**

```bash
cd /Users/jagraj/Documents/Github/chancery-website-v2/chancery-next
npm run build
```
Expected: build succeeds. Then run dev backgrounded and:
```bash
curl -s http://localhost:3000 | grep -c "Design tokens load"        # -> 1
curl -s http://localhost:3000 | grep -oE "__variable_[a-z0-9]+|--font-" | head   # font CSS vars present
```
Expected: heading present; font variables injected. Stop dev.

- [ ] **Step 5: Commit**

```bash
cd /Users/jagraj/Documents/Github/chancery-website-v2
git add chancery-next/app/globals.css chancery-next/app/layout.tsx chancery-next/app/page.tsx
git rm --cached chancery-next/app/page.module.css 2>/dev/null || true
git commit -m "feat(web): port global design tokens + next/font (Fraunces/Cormorant/Inter)"
```

---

## Task 3: Typed server-side query layer

**Files:**
- Create: `chancery-next/lib/queries/content.ts`

Replaces the legacy `frontend/src/lib/api.ts`. Each function reads Supabase and returns shapes matching `frontend/src/lib/types.ts`, INCLUDING the Django-serializer-derived fields:
- `room.amenities_list` = non-empty trimmed lines of `room.amenities`.
- `room/restaurant/venue.images` = child rows `{image, alt, order}` ordered by `order`.
- `hotel.departments` = public, active `department_contact` rows where `hotel = slug OR hotel = 'both'`, ordered by department enum order, mapped to `{department, label, email, phone}`.
- `page.sections` = ordered `page_section` rows.
- `faq_section.items` = ordered `faq_item` rows.

- [ ] **Step 1: Write the query module**

```typescript
// lib/queries/content.ts — server-side typed reads for the public site.
import { db, cache } from './db'

const DEPARTMENT_ORDER = ['reservations', 'dining', 'sales', 'events', 'catering', 'careers', 'general'] as const
const DEPARTMENT_LABELS: Record<string, string> = {
  reservations: 'Reservations', dining: 'Dining', sales: 'Sales', events: 'Meetings & Events',
  catering: 'Outdoor Catering', careers: 'Careers', general: 'General Enquiry',
}

export type HotelSlug = 'chancery' | 'pavilion'

export const linesOf = (text: string | null): string[] =>
  (text ?? '').split('\n').map((l) => l.trim()).filter(Boolean)

export const getSiteContent = cache(async () => {
  const { data, error } = await db.from('site_content').select('*').eq('id', 1).single()
  if (error) throw error
  return data
})

export const getHotels = cache(async () => {
  const { data, error } = await db.from('hotel').select('*').order('order')
  if (error) throw error
  return Promise.all((data ?? []).map(withDepartments))
})

export const getHotel = cache(async (slug: string) => {
  const { data, error } = await db.from('hotel').select('*').eq('slug', slug).maybeSingle()
  if (error) throw error
  return data ? withDepartments(data) : null
})

async function withDepartments<T extends { slug: string }>(hotel: T) {
  const { data } = await db
    .from('department_contact')
    .select('department, notify_email, phone')
    .or(`hotel.eq.${hotel.slug},hotel.eq.both`)
    .eq('is_active', true)
    .eq('public', true)
  const departments = (data ?? [])
    .map((r) => ({
      department: r.department,
      label: DEPARTMENT_LABELS[r.department] ?? r.department,
      email: r.notify_email,
      phone: r.phone,
    }))
    .sort((a, b) => DEPARTMENT_ORDER.indexOf(a.department as never) - DEPARTMENT_ORDER.indexOf(b.department as never))
  return { ...hotel, departments }
}

// Rooms — join hotel for slug, attach images + amenities_list.
export const getRooms = cache(async (hotelSlug?: string) => {
  const { data, error } = await db.from('room_category')
    .select('*, hotel:hotel_id(slug,name,short_name,location), images:room_image(image,alt,order)')
    .order('order')
  if (error) throw error
  return (data ?? [])
    .filter((r: any) => !hotelSlug || r.hotel?.slug === hotelSlug)
    .map((r: any) => ({
      ...r,
      amenities_list: linesOf(r.amenities),
      images: (r.images ?? []).sort((a: any, b: any) => a.order - b.order),
    }))
})

export const getRestaurants = cache(async (hotelSlug?: string) => {
  const { data, error } = await db.from('restaurant')
    .select('*, hotel:hotel_id(slug,name,short_name,location), images:restaurant_image(image,alt,order)')
    .order('order')
  if (error) throw error
  return (data ?? [])
    .filter((r: any) => !hotelSlug || r.hotel?.slug === hotelSlug)
    .map((r: any) => ({ ...r, images: (r.images ?? []).sort((a: any, b: any) => a.order - b.order) }))
})

export const getVenues = cache(async (hotelSlug?: string) => {
  const { data, error } = await db.from('venue')
    .select('*, hotel:hotel_id(slug,name,short_name,location), images:venue_image(image,alt,order)')
    .order('order')
  if (error) throw error
  return (data ?? [])
    .filter((r: any) => !hotelSlug || r.hotel?.slug === hotelSlug)
    .map((r: any) => ({ ...r, images: (r.images ?? []).sort((a: any, b: any) => a.order - b.order) }))
})

export const getOffers = cache(async (hotelSlug?: string) => {
  const { data, error } = await db.from('offer').select('*, hotel:hotel_id(slug)').order('order')
  if (error) throw error
  // Offers with null hotel are shared (apply to both); hotel-scoped match the slug.
  return (data ?? []).filter((o: any) => !hotelSlug || !o.hotel || o.hotel.slug === hotelSlug)
})

export const getGallery = cache(async (hotelSlug?: string, category?: string) => {
  const { data, error } = await db.from('gallery_image').select('*, hotel:hotel_id(slug)').order('order')
  if (error) throw error
  return (data ?? [])
    .filter((g: any) => !hotelSlug || !g.hotel || g.hotel.slug === hotelSlug)
    .filter((g: any) => !category || g.category === category)
})

export const getTestimonials = cache(async () => {
  const { data, error } = await db.from('testimonial').select('*').order('order')
  if (error) throw error
  return data ?? []
})

export const getFaq = cache(async () => {
  const { data, error } = await db.from('faq_section')
    .select('*, items:faq_item(question,answer,order)').order('order')
  if (error) throw error
  return (data ?? []).map((s: any) => ({ ...s, items: (s.items ?? []).sort((a: any, b: any) => a.order - b.order) }))
})

export const getPage = cache(async (kind: string, hotelSlug?: string) => {
  let q = db.from('page').select('*, hotel:hotel_id(slug), sections:page_section(*)').eq('kind', kind)
  q = hotelSlug ? q.eq('hotel.slug', hotelSlug) : q.is('hotel_id', null)
  const { data, error } = await q.maybeSingle()
  if (error) throw error
  if (!data) return null
  return { ...data, sections: ((data as any).sections ?? []).sort((a: any, b: any) => a.order - b.order) }
})
```

NOTE on the embedded `.eq('hotel.slug', ...)` filter: PostgREST applies a filter on an embedded resource correctly only with the right join hint; the `.filter((r) => r.hotel?.slug === hotelSlug)` guard in JS is the authoritative scope filter and must stay. For `getPage` hotel-scoped resolution, verify in Step 2 that a hotel page (e.g. `accommodation` for `pavilion`) resolves; if the embedded `.eq` mis-filters, switch to fetching by `kind` then JS-filtering on `hotel.slug`.

- [ ] **Step 2: Verify queries return correct shapes + counts**

Add a throwaway `app/_check/route.ts`:
```typescript
import { getHotels, getRooms, getOffers, getFaq, getPage } from '@/lib/queries/content'
export async function GET() {
  const hotels = await getHotels()
  const pavRooms = await getRooms('pavilion')
  const sharedOffers = await getOffers('chancery')
  const faq = await getFaq()
  const home = await getPage('home')
  const acc = await getPage('accommodation', 'pavilion')
  return Response.json({
    hotels: hotels.length,
    pavRooms: pavRooms.length,
    firstRoomAmenities: pavRooms[0]?.amenities_list?.length ?? 0,
    firstHotelDepartments: hotels[0]?.departments?.length ?? 0,
    offersForChancery: sharedOffers.length,
    faqSections: faq.length,
    faqFirstItems: faq[0]?.items?.length ?? 0,
    homePageTitle: home?.title ?? null,
    accPageResolved: !!acc,
  })
}
```
Run dev backgrounded:
```bash
curl -s http://localhost:3000/_check | python3 -m json.tool
```
Expected: `hotels: 2`, `pavRooms` > 0, `firstRoomAmenities` > 0, `firstHotelDepartments` > 0, `offersForChancery` > 0, `faqSections: 5`, `faqFirstItems` > 0, `homePageTitle` non-null, `accPageResolved: true`. If a scoped count is 0 or `accPageResolved` is false, fix the scope filter per the NOTE. DELETE `app/_check/` and stop dev.

- [ ] **Step 3: Commit**

```bash
cd /Users/jagraj/Documents/Github/chancery-website-v2
git add chancery-next/lib/queries/content.ts
git commit -m "feat(web): typed server query layer with serializer-derived fields"
```

---

## Task 4: SEO scaffolding — metadata helper, JSON-LD, sitemap, robots

**Files:**
- Create: `chancery-next/lib/seo.ts`, `chancery-next/components/JsonLd.tsx`, `chancery-next/app/sitemap.ts`, `chancery-next/app/robots.ts`

- [ ] **Step 1: `lib/seo.ts`**

```typescript
// lib/seo.ts — Metadata builder mirroring the legacy PageMeta behaviour.
import type { Metadata } from 'next'
import { mediaUrl } from './media'

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.chanceryhotels.com'
const DEFAULT_OG = `${SITE_URL}/og-cover.jpg`

export function buildMetadata(opts: {
  title: string
  description?: string
  path: string                 // e.g. "/chancery/dining"
  ogImagePath?: string | null  // Storage path; falls back to default OG
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
      type: 'website', siteName: 'Chancery Hotels', title: opts.title,
      description: opts.description, url, images: [ogImage],
    },
    twitter: { card: 'summary_large_image', title: opts.title, description: opts.description, images: [ogImage] },
  }
}

export function organizationJsonLd(site: { site_title: string; instagram_url: string; facebook_url: string; tripadvisor_url: string }) {
  return {
    '@context': 'https://schema.org', '@type': 'Organization',
    name: site.site_title, url: SITE_URL,
    sameAs: [site.instagram_url, site.facebook_url, site.tripadvisor_url].filter(Boolean),
  }
}
```

- [ ] **Step 2: `components/JsonLd.tsx`**

Create a server component that emits a JSON-LD `<script type="application/ld+json">`. This is the standard Next.js structured-data pattern: the script body is set via React's raw-HTML inner-content prop (`dangerouslySetInnerHTML`), and — IMPORTANT for safety — the serialized JSON must escape `<` to `<` so a string value can never break out of the `<script>` tag (the only XSS vector for first-party JSON-LD). Implement exactly:

```tsx
// components/JsonLd.tsx — render a JSON-LD <script> (server component).
// Escaping `<` -> < prevents any string value from closing the <script> early.
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  const json = JSON.stringify(data).replace(/</g, '\\u003c')
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />
}
```

- [ ] **Step 3: `app/sitemap.ts`**

```typescript
import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/seo'

const HOTELS = ['chancery', 'pavilion']
const HOTEL_PAGES = ['', '/accommodation', '/dining', '/plan-your-event', '/special-offers', '/gallery', '/contact-us', '/destination']
const BRAND_PAGES = ['', '/rooms', '/faq', '/careers', '/catering', '/site-map', '/privacy', '/terms', '/accessibility-statement']

export default function sitemap(): MetadataRoute.Sitemap {
  const urls: string[] = [...BRAND_PAGES]
  for (const h of HOTELS) for (const p of HOTEL_PAGES) urls.push(`/${h}${p}`)
  return urls.map((u) => ({ url: `${SITE_URL}${u || '/'}`, changeFrequency: 'weekly', priority: u === '' ? 1 : 0.7 }))
}
```

- [ ] **Step 4: `app/robots.ts`**

```typescript
import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/seo'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/admin', '/api'] },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
```

- [ ] **Step 5: Verify**

```bash
cd /Users/jagraj/Documents/Github/chancery-website-v2/chancery-next
npm run build   # must compile sitemap/robots/seo with no type errors
# dev backgrounded:
curl -s http://localhost:3000/robots.txt | grep -c "Sitemap"          # -> 1
curl -s http://localhost:3000/sitemap.xml | grep -c "/chancery/dining" # -> 1
```
Stop dev.

- [ ] **Step 6: Commit**

```bash
cd /Users/jagraj/Documents/Github/chancery-website-v2
git add chancery-next/lib/seo.ts chancery-next/components/JsonLd.tsx chancery-next/app/sitemap.ts chancery-next/app/robots.ts
git commit -m "feat(web): SEO helpers, JSON-LD, sitemap, robots"
```

---

## Task 5: Hotel-scoped routing + slug validation

**Files:**
- Create: `chancery-next/lib/hotel-scope.tsx`, `chancery-next/app/[hotel]/layout.tsx`, `chancery-next/app/[hotel]/page.tsx`

- [ ] **Step 1: `lib/hotel-scope.tsx` (client context for chrome)**

```tsx
'use client'
import { createContext, useContext } from 'react'
export type HotelSlug = 'chancery' | 'pavilion'
const Ctx = createContext<{ active: HotelSlug | null }>({ active: null })
export function HotelScope({ active, children }: { active: HotelSlug | null; children: React.ReactNode }) {
  return <Ctx.Provider value={{ active }}>{children}</Ctx.Provider>
}
export const useHotelScope = () => useContext(Ctx)
```

- [ ] **Step 2: `app/[hotel]/layout.tsx` — validate slug**

```tsx
import { notFound } from 'next/navigation'
import { HotelScope, type HotelSlug } from '@/lib/hotel-scope'

const VALID: HotelSlug[] = ['chancery', 'pavilion']

export default async function HotelLayout({
  children, params,
}: { children: React.ReactNode; params: Promise<{ hotel: string }> }) {
  const { hotel } = await params
  if (!VALID.includes(hotel as HotelSlug)) notFound()
  return <HotelScope active={hotel as HotelSlug}>{children}</HotelScope>
}
```

- [ ] **Step 3: `app/[hotel]/page.tsx` — proof-of-shell hotel home**

```tsx
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
```

- [ ] **Step 4: Verify routing + 404**

```bash
cd /Users/jagraj/Documents/Github/chancery-website-v2/chancery-next
npm run build   # build should succeed
# dev backgrounded:
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/chancery     # 200
curl -s http://localhost:3000/chancery | grep -c "The Chancery Hotel"        # 1
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/notahotel     # 404
```
Stop dev.

- [ ] **Step 5: Commit**

```bash
cd /Users/jagraj/Documents/Github/chancery-website-v2
git add chancery-next/lib/hotel-scope.tsx chancery-next/app/[hotel]
git commit -m "feat(web): hotel-scoped routing with slug validation + 404"
```

---

## Task 6: Booking helper, image wrapper, Hero, BookButton

**Files:**
- Create: `chancery-next/lib/booking.ts`, `chancery-next/components/Media.tsx`, `chancery-next/components/BookButton.tsx`, `chancery-next/components/Hero.tsx` (+ `Hero.css`)

- [ ] **Step 1: Port `lib/booking.ts`**

Copy `frontend/src/lib/booking.ts` to `chancery-next/lib/booking.ts` verbatim, changing only the type import to `import type { HotelSlug } from '@/lib/queries/content'`.

- [ ] **Step 2: `components/Media.tsx` — next/image wrapper**

```tsx
// components/Media.tsx — next/image from a Supabase Storage path, filling a sized container.
import Image from 'next/image'
import { mediaUrl } from '@/lib/media'

export function Media({
  path, alt, sizes = '100vw', priority = false, className,
}: { path: string | null | undefined; alt: string; sizes?: string; priority?: boolean; className?: string }) {
  const src = mediaUrl(path)
  if (!src) return <span className={`figure placeholder ${className ?? ''}`} aria-hidden />
  return <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className={className} style={{ objectFit: 'cover' }} />
}
```

- [ ] **Step 3: Port `components/BookButton.tsx` (server component)**

Port `frontend/src/components/BookButton.tsx` to `chancery-next/components/BookButton.tsx`. Changes: it stays a plain `<a target="_blank" rel="noopener">` using `buildSynxisUrl` from `@/lib/booking`; remove any react-router import. No `'use client'` needed (no state).

- [ ] **Step 4: Port `components/Hero.tsx` (+ Hero.css)**

Port `frontend/src/components/Hero.tsx` + `Hero.css` to `chancery-next/components/`. Changes: replace its image element with `<Media path={image} alt={heading} priority sizes="100vw" />` inside the existing aspect/figure wrapper; keep eyebrow/heading/subheading/footerNav markup and classes identical; remove the legacy ResponsiveImage import; no `'use client'` (presentational). If `footerNav` (the HeroIconNav) is interactive, render only the `children` slot — the icon nav is ported in 3b/3c where used.

- [ ] **Step 5: Verify build**

```bash
cd /Users/jagraj/Documents/Github/chancery-website-v2/chancery-next
npm run build
```
Expected: compiles. (Visual check happens in Task 7 once Hero is on a page.)

- [ ] **Step 6: Commit**

```bash
cd /Users/jagraj/Documents/Github/chancery-website-v2
git add chancery-next/lib/booking.ts chancery-next/components/Media.tsx chancery-next/components/BookButton.tsx chancery-next/components/Hero.tsx chancery-next/components/Hero.css
git commit -m "feat(web): booking helper, next/image Media wrapper, Hero, BookButton"
```

---

## Task 7: Shared chrome — Navbar, SideMenu, Footer, ScrollToTop + newsletter endpoint

**Files:**
- Create: `chancery-next/components/{Navbar,SideMenu,Footer,ScrollToTop}.tsx` (+ their `.css`), `chancery-next/app/api/newsletter/route.ts`
- Modify: `chancery-next/app/layout.tsx` (mount chrome), `chancery-next/app/page.tsx` (proof-of-shell brand home)

- [ ] **Step 1: Newsletter insert endpoint**

```typescript
// app/api/newsletter/route.ts — insert a subscriber (full provider sync is Phase 5).
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  const { email } = await req.json().catch(() => ({ email: '' }))
  if (!email || !/.+@.+\..+/.test(email)) return Response.json({ ok: false, error: 'Invalid email' }, { status: 400 })
  const supa = createAdminClient()
  const { error } = await supa.from('newsletter_subscriber').upsert({ email }, { onConflict: 'email' })
  if (error) return Response.json({ ok: false, error: error.message }, { status: 500 })
  return Response.json({ ok: true })
}
```

- [ ] **Step 2: Port the chrome components**

Port these from `frontend/src/components/` to `chancery-next/components/` (keep each companion `.css` verbatim). Apply these uniform changes to each:
- Add `'use client'` at the top (all four use scroll/menu/form state).
- Replace `react-router-dom` `Link`/`NavLink`/`useLocation` with `next/link` `Link` and `next/navigation` `usePathname`. Active-link logic uses `usePathname()`.
- Replace `useHotel()` (old context) with `useHotelScope()` from `@/lib/hotel-scope` (exposes `active` only; for the old `fallback`, default to `'pavilion'` when `active` is null — replicate inline).
- Replace any legacy `ResponsiveImage`/`<img>` of CMS media with the Supabase URL via `mediaUrl()` (logos: a plain `<img src={mediaUrl(site.brand_logo)!}>` is fine where intrinsic sizing matters — match the original visual).
- Navbar/Footer need site data (`site_title`, social URLs, `brand_logo`, newsletter copy, hotel contacts). Since they are client components, fetch the data in the SERVER `layout.tsx` (Step 3) and pass as props: `<Navbar site={site} hotels={hotels} />`, `<Footer site={site} hotels={hotels} />`. Change each to accept props instead of calling the old API.
- Footer newsletter form: on submit, `await fetch('/api/newsletter', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email }) })`; keep the success/error UI text identical to the legacy Footer.
- SideMenu: keep the 7-item icon menu, Escape-to-close, body-scroll-lock; links via `next/link`.

- [ ] **Step 3: Mount chrome in the root layout (fetch data server-side)**

Update `chancery-next/app/layout.tsx` to fetch site + hotels and render the chrome around children, plus the Organization JSON-LD. Keep the font `<html>` classes from Task 2 and make `RootLayout` async:
```tsx
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { ScrollToTop } from '@/components/ScrollToTop'
import { JsonLd } from '@/components/JsonLd'
import { getSiteContent, getHotels } from '@/lib/queries/content'
import { organizationJsonLd } from '@/lib/seo'
// ... fonts + metadata as in Task 2 ...
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [site, hotels] = await Promise.all([getSiteContent(), getHotels()])
  return (
    <html lang="en" className={`${fraunces.variable} ${cormorant.variable} ${inter.variable}`}>
      <body>
        <JsonLd data={organizationJsonLd(site)} />
        <Navbar site={site} hotels={hotels} />
        {children}
        <Footer site={site} hotels={hotels} />
        <ScrollToTop />
      </body>
    </html>
  )
}
```

- [ ] **Step 4: Proof-of-shell brand home**

Replace `app/page.tsx`:
```tsx
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
```

- [ ] **Step 5: Verify the whole shell renders + nav + newsletter**

```bash
cd /Users/jagraj/Documents/Github/chancery-website-v2/chancery-next
npm run build      # whole app compiles
# dev backgrounded:
curl -s http://localhost:3000/ | grep -oE "Chancery Pavilion|The Chancery Hotel" | sort -u   # both hotels present
curl -s -X POST http://localhost:3000/api/newsletter -H 'content-type: application/json' -d '{"email":"shelltest@example.com"}'  # {"ok":true}
docker exec -i supabase_db_chancery-next psql -U postgres -d postgres -t -c "select count(*) from newsletter_subscriber where email='shelltest@example.com';"   # 1
```
Then use the preview tools to screenshot `/` and `/chancery`: confirm the navy/ivory/gold editorial look, serif headings, navbar + footer. Clean up the test subscriber:
```bash
docker exec -i supabase_db_chancery-next psql -U postgres -d postgres -c "delete from newsletter_subscriber where email='shelltest@example.com';"
```
Stop dev.

- [ ] **Step 6: Commit**

```bash
cd /Users/jagraj/Documents/Github/chancery-website-v2
git add chancery-next/components chancery-next/app/api/newsletter chancery-next/app/layout.tsx chancery-next/app/page.tsx
git commit -m "feat(web): shared chrome (navbar/sidemenu/footer/scrolltop) + newsletter endpoint"
```

---

## Phase 3a Done — exit criteria

- `npm run build` compiles the whole app with no type errors.
- `/` and `/chancery` render real migrated data inside the ported navy/ivory/gold shell (serif fonts, navbar, footer) — verified by screenshot.
- Invalid hotel slug (`/notahotel`) → 404.
- Query layer returns correct shapes incl. derived `amenities_list`, `images[]`, `departments[]`, `sections[]`, `items[]`.
- SEO: per-page `<title>`/canonical/OG, Organization JSON-LD in `<head>`, `/sitemap.xml` and `/robots.txt` serve.
- Footer newsletter POST inserts a `newsletter_subscriber` row.
- Media renders via `next/image` from Supabase Storage public URLs.

**Next:** `2026-06-23-rebuild-phase3b-brand-pages.md` (home, rooms, faq, careers, catering, sitemap, legal, book-redirect, 404), then `phase3c-hotel-pages.md`.

---

## Self-review notes

- **Spec coverage (§2 zones / §7 rendering+SEO+images):** Server Components + ISR (`revalidate`) in Tasks 3,5,7; on-demand revalidation deferred to Phase 4 (noted). next/image from Storage (Tasks 1,6). SEO via Metadata API + JSON-LD + sitemap/robots (Task 4). `[hotel]` segments (Task 5). Chrome as client islands (Task 7). Newsletter persists (Task 7) — full Resend/Brevo is Phase 5.
- **Derived-field fidelity:** `amenities_list` (lines), `images[]` (ordered), `departments[]` (public+active, hotel-or-both, dept-ordered, labelled) replicate `content/serializers.py` exactly.
- **Type consistency:** `HotelSlug` exported from `lib/queries/content.ts` and reused by `booking.ts`/`hotel-scope.tsx`. `mediaUrl` used by `Media`, `seo`, chrome. `getSiteContent/getHotels` shapes feed `layout.tsx` props into Navbar/Footer.
- **No placeholders:** new infra files have full code; ported files have exact source path + explicit change lists. Every task has a concrete verify command with expected output.
- **Watch-outs:** public reads use the non-cookie anon client (keeps pages static/ISR — do NOT use the cookie server client here); `JsonLd` escapes `<` to prevent script breakout; PostgREST embedded-filter caveat handled by the JS scope-filter guard; `venue.kind` may be null (handled downstream in 3c).
