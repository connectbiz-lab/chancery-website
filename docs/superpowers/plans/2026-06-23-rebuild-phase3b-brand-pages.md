# Chancery Rebuild — Phase 3b: Brand-Level Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Port the brand-level (non-hotel-scoped) pages from the legacy Vite app to Next.js App Router Server Components reading the Phase-3a query layer: the full home page, all-rooms, FAQ, careers, catering, sitemap, the three legal pages, the `/book` redirect, and the 404 page — with interactivity extracted into small `'use client'` islands and per-page SEO via `generateMetadata`.

**Architecture:** Each page is an async Server Component that fetches data via `lib/queries/content.ts` and renders the legacy markup/CSS verbatim. Interactive pieces (reveal-on-scroll, testimonial carousel, FAQ accordion, the booking splash-redirect) become `'use client'` child components that receive plain data as props. Pages set `export const revalidate = 3600` (on-demand revalidation in Phase 4) and export `generateMetadata` via `buildMetadata`, sourcing title/description from the CMS `Page` record with the legacy hardcoded fallbacks.

**Tech Stack:** Next.js App Router, React Server Components, `next/link`, `next/image` (via the `Media` wrapper), the Phase-3a `lib/queries/content.ts` + `lib/seo.ts`.

**Reference:** Phase-3a plan/shell (done); legacy pages in `frontend/src/pages/` (port source of truth); `frontend/src/lib/reveal.ts` (the reveal hook to reimplement as a component). Spec §7.

**Prerequisites:** Phase 3a merged (shell, query layer, chrome, Media, SEO helpers all exist). Supabase running, data migrated. Build/type-check with `npm run build`. `psql` via `docker exec -i supabase_db_chancery-next psql -U postgres -d postgres`. Run dev BACKGROUNDED for checks, stop after. Do NOT touch `backend/`/`frontend/`. Branch `imageloadoptimise`. One commit per task from repo root.

**Routing note (App Router):** static segments win over the dynamic `[hotel]` segment, so `app/rooms/`, `app/faq/`, `app/careers/`, `app/catering/`, `app/site-map/`, `app/privacy/`, `app/terms/`, `app/accessibility-statement/`, `app/book/` all resolve before `[hotel]`. Keep these exact paths (they match the legacy routes + sitemap).

**General port rules (apply to every page task):**
- Create `app/<route>/page.tsx` as `export default async function`, fetching via the query layer (no `useAsync`/`useEffect`).
- Read the legacy `frontend/src/pages/<Page>.tsx` and reproduce its sections/markup/classNames exactly. Copy the matching `<Page>.css` into `chancery-next/app/<route>/<Page>.css` (or a shared location) verbatim and import it.
- Replace `react-router` `Link to=` → `next/link` `href=`; `<PageMeta>` → `export async function generateMetadata()` using `buildMetadata({ title, description, path, ogImagePath })` with the CMS `page.meta_title || page.title || "<legacy fallback>"` and `page.meta_description`.
- Replace legacy `ResponsiveImage`/CMS `<img>` with the `Media` component (`@/components/Media`) for fill-container images, or `mediaUrl()` for intrinsic `<img>`.
- Pull interactivity into a `'use client'` child in `chancery-next/components/` receiving props. Server pages must NOT become client components.
- A CMS `page` record may be null — guard with the legacy hardcoded fallbacks (titles, intro copy) exactly as the legacy page does.

---

## Task 1: Shared interactive islands — Reveal + TestimonialCarousel

**Files:**
- Create: `chancery-next/components/Reveal.tsx`, `chancery-next/components/TestimonialCarousel.tsx` (+ port any carousel CSS into the home stylesheet in Task 2)

- [ ] **Step 1: `components/Reveal.tsx`** — reimplement `frontend/src/lib/reveal.ts` as a wrapper component.

```tsx
'use client'
import { useEffect, useRef, useState } from 'react'

/** Adds class `in` to the wrapper when it scrolls into view (one-shot),
 *  mirroring the legacy useReveal() hook + `.reveal`/`.in` CSS. */
export function Reveal({ children, className = '', as: Tag = 'div' }: {
  children: React.ReactNode; className?: string; as?: 'div' | 'section'
}) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [shown, setShown] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el || shown) return
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) { setShown(true); io.disconnect() }
    }, { threshold: 0.12 })
    io.observe(el)
    return () => io.disconnect()
  }, [shown])
  return <Tag ref={ref as never} className={`reveal ${shown ? 'in' : ''} ${className}`}>{children}</Tag>
}
```

- [ ] **Step 2: `components/TestimonialCarousel.tsx`** — port the homepage testimonial carousel logic from `frontend/src/pages/HomePage.tsx` (scroll-snap track + dot buttons + active-dot tracking). It receives `testimonials: { quote: string; name: string; title: string; rating: number }[]` as a prop. Keep the legacy `.testimonial-*` classNames so the ported CSS applies.

```tsx
'use client'
import { useRef, useState } from 'react'

type T = { quote: string; name: string; title: string; rating: number }

export function TestimonialCarousel({ testimonials }: { testimonials: T[] }) {
  const trackRef = useRef<HTMLDivElement | null>(null)
  const [active, setActive] = useState(0)
  const onScroll = () => {
    const el = trackRef.current
    if (!el) return
    const i = Math.round(el.scrollLeft / el.clientWidth)
    if (i !== active) setActive(i)
  }
  const goTo = (i: number) => {
    const el = trackRef.current
    if (el) el.scrollTo({ left: i * el.clientWidth, behavior: 'smooth' })
  }
  // Reproduce the legacy markup/classes exactly (track, slides, quote, attribution, dots).
  // See frontend/src/pages/HomePage.tsx for the precise structure to copy.
  return (
    <div className="testimonial-carousel">
      <div className="testimonial-track" ref={trackRef} onScroll={onScroll}>
        {testimonials.map((t, i) => (
          <figure className="testimonial-slide" key={i}>
            <blockquote className="italic-quote">{t.quote}</blockquote>
            <figcaption>{t.name}{t.title ? ` — ${t.title}` : ''}</figcaption>
          </figure>
        ))}
      </div>
      <div className="testimonial-dots">
        {testimonials.map((_, i) => (
          <button key={i} className={`dot ${i === active ? 'active' : ''}`}
            aria-label={`Testimonial ${i + 1}`} onClick={() => goTo(i)} />
        ))}
      </div>
    </div>
  )
}
```
NOTE: match the legacy markup precisely (rating stars, attribution layout) by reading `HomePage.tsx`; the snippet above is the structural skeleton — adjust classNames/markup to be identical so `HomePage.css` styles it correctly.

- [ ] **Step 3: Verify build**

```bash
cd /Users/jagraj/Documents/Github/chancery-website-v2/chancery-next
npm run build
```
Expected: compiles (components are unused until Task 2 — that's fine; build must still pass).

- [ ] **Step 4: Commit**

```bash
cd /Users/jagraj/Documents/Github/chancery-website-v2
git add chancery-next/components/Reveal.tsx chancery-next/components/TestimonialCarousel.tsx
git commit -m "feat(web): reveal + testimonial-carousel client islands"
```

---

## Task 2: Home page (`/`)

**Files:**
- Modify: `chancery-next/app/page.tsx` (replace the proof-of-shell)
- Create: `chancery-next/app/HomePage.css` (port `frontend/src/pages/HomePage.css` + the shared `pages.css` bits it relies on)

- [ ] **Step 1: Port the page**

Read `frontend/src/pages/HomePage.tsx`. Recreate `app/page.tsx` as an async Server Component that fetches:
```typescript
const [page, hotels, offers, testimonials, restaurants] = await Promise.all([
  getPage('home'), getHotels(), getOffers(), getTestimonials(), getRestaurants(),
])
```
Reproduce every section in legacy order: hero, intro (Claridge's two-column), journey timeline, two-hotel picker, dining strip (first 4 restaurants), offers (first 3), awards, testimonials. Wrap the reveal-animated sections in `<Reveal>` (Task 1). Render testimonials via `<TestimonialCarousel testimonials={testimonials.slice(0, 5)} />`. Use `<Media>` for hero/section images and `<BookButton>` / `next/link` for CTAs. The homepage hero "footer nav" (HeroIconNav) — if present in the legacy hero, port it as a small client island `components/HeroIconNav.tsx` (scroll-fade) OR omit if it duplicates the navbar; match the legacy home visual.

- [ ] **Step 2: Port CSS + metadata**

Copy `frontend/src/pages/HomePage.css` to `app/HomePage.css` and import it in `app/page.tsx`. If the page uses shared classes from `frontend/src/pages/pages.css` (e.g. `.section-head`, `.card-grid`, `.stats`), copy `pages.css` to `chancery-next/app/pages.css` and import it once in `app/layout.tsx` (so all page tasks can use it). Add:
```typescript
export const revalidate = 3600
export async function generateMetadata() {
  const [page, site] = await Promise.all([getPage('home'), getSiteContent()])
  return buildMetadata({
    title: page?.meta_title || site.site_title,
    description: page?.meta_description || site.tagline,
    path: '/', ogImagePath: page?.hero_image,
  })
}
```

- [ ] **Step 3: Verify content + visual**

```bash
cd /Users/jagraj/Documents/Github/chancery-website-v2/chancery-next
npm run build
# dev backgrounded:
curl -s http://localhost:3000/ | grep -oE "Chancery Pavilion|The Chancery Hotel" | sort -u   # both hotels in picker
curl -s http://localhost:3000/ | grep -c "testimonial-track"     # carousel present -> >=1
```
Then use the preview tools: `preview_screenshot` of `/` and `preview_console_logs`. Confirm: hero image, intro, hotel picker cards with photos, dining strip, offers, testimonial carousel, awards — all styled (navy/ivory/gold), serif headings, NO console/hydration errors. Fix any broken section before committing. Stop dev.

- [ ] **Step 4: Commit**

```bash
cd /Users/jagraj/Documents/Github/chancery-website-v2
git add chancery-next/app/page.tsx chancery-next/app/HomePage.css chancery-next/app/pages.css chancery-next/app/layout.tsx chancery-next/components/HeroIconNav.tsx 2>/dev/null
git commit -m "feat(web): full brand home page"
```

---

## Task 3: All-rooms page (`/rooms`)

**Files:**
- Create: `chancery-next/app/rooms/page.tsx`, `chancery-next/app/rooms/RoomsPage.css` (port)

- [ ] **Step 1: Port** `frontend/src/pages/RoomsPage.tsx` → `app/rooms/page.tsx` (async SC). Fetch `getPage('rooms')`, `getHotels()`, `getRooms()`. Group rooms by hotel (one section per hotel, 3-card grid + a "View all" link to `/<hotel>/accommodation`). Use `<Media>` for room hero images, `next/link` for cards. No interactivity. Port `RoomsPage.css` (and reuse `pages.css`). Add `generateMetadata` (fallback title "Rooms & Suites").

- [ ] **Step 2: Verify**

```bash
cd /Users/jagraj/Documents/Github/chancery-website-v2/chancery-next
npm run build
# dev backgrounded:
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/rooms     # 200
curl -s http://localhost:3000/rooms | grep -c "View all"                  # >=2 (one per hotel)
```
Screenshot `/rooms` with preview tools; confirm room cards with photos grouped by hotel. Stop dev.

- [ ] **Step 3: Commit**

```bash
git add chancery-next/app/rooms
git commit -m "feat(web): all-rooms brand page"
```

---

## Task 4: FAQ page (`/faq`) + accordion island

**Files:**
- Create: `chancery-next/app/faq/page.tsx`, `chancery-next/app/faq/FAQPage.css` (port), `chancery-next/components/FaqAccordion.tsx`

- [ ] **Step 1: Accordion island** — `components/FaqAccordion.tsx` (`'use client'`), port the open/close logic from `frontend/src/pages/FAQPage.tsx`. Props: `sections: { title: string; items: { question: string; answer: string }[] }[]`. Keep the legacy `.faq-section/.faq-list/.faq-item/.faq-q/.faq-a` classNames and the open-state toggle.

- [ ] **Step 2: Page** — `app/faq/page.tsx` (async SC) fetches `getPage('faq')`, `getFaq()`, renders hero + intro + `<FaqAccordion sections={faq} />`. Port `FAQPage.css`. `generateMetadata` (fallback "Frequently Asked Questions").

- [ ] **Step 3: Verify**

```bash
cd /Users/jagraj/Documents/Github/chancery-website-v2/chancery-next
npm run build
# dev backgrounded:
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/faq    # 200
curl -s http://localhost:3000/faq | grep -c "faq-item"               # >=1
```
Screenshot `/faq`; click a question via `preview_click` and screenshot to confirm it expands. Stop dev.

- [ ] **Step 4: Commit**

```bash
git add chancery-next/app/faq chancery-next/components/FaqAccordion.tsx
git commit -m "feat(web): FAQ page with accordion island"
```

---

## Task 5: Careers (`/careers`) + Catering (`/catering`)

**Files:**
- Create: `chancery-next/app/careers/page.tsx`, `chancery-next/app/catering/page.tsx`, and their ported CSS

- [ ] **Step 1: Port** both static pages (no interactivity):
  - `app/careers/page.tsx` ← `frontend/src/pages/CareersPage.tsx`: `getPage('careers')`, hero + intro + 3 pillar cards (static copy from legacy) + CTA band linking to `/pavilion/contact-us`. `generateMetadata` (fallback "Careers").
  - `app/catering/page.tsx` ← `frontend/src/pages/CateringPage.tsx`: `getPage('catering')`, hero + intro + 4 occasions + 6 capabilities (static copy) + CTA band. `generateMetadata` (fallback "Outdoor Catering").
  Port any page-specific CSS; reuse `pages.css`.

- [ ] **Step 2: Verify**

```bash
cd /Users/jagraj/Documents/Github/chancery-website-v2/chancery-next
npm run build
# dev backgrounded:
for p in careers catering; do curl -s -o /dev/null -w "$p=%{http_code}\n" http://localhost:3000/$p; done   # both 200
curl -s http://localhost:3000/careers | grep -c "/pavilion/contact-us"   # >=1
```
Screenshot both. Stop dev.

- [ ] **Step 3: Commit**

```bash
git add chancery-next/app/careers chancery-next/app/catering
git commit -m "feat(web): careers + catering brand pages"
```

---

## Task 6: Legal pages — privacy, terms, accessibility

**Files:**
- Create: `chancery-next/components/SimpleContent.tsx` (shared server component), `chancery-next/app/privacy/page.tsx`, `chancery-next/app/terms/page.tsx`, `chancery-next/app/accessibility-statement/page.tsx`, ported CSS

- [ ] **Step 1: Shared component** — port `frontend/src/pages/SimpleContentPage.tsx` into `components/SimpleContent.tsx` (async server component) taking `kind: 'privacy' | 'terms' | 'accessibility'`. It fetches `getPage(kind)`, renders hero + intro + body; if the CMS page is empty, render the legacy hardcoded fallback paragraphs for that kind (copy them verbatim from the legacy file). Export a `metadataFor(kind)` helper returning `buildMetadata` with the legacy per-kind title/description fallbacks.

- [ ] **Step 2: Three thin route pages** — each imports the shared component and exports metadata:
```tsx
// app/privacy/page.tsx (terms + accessibility analogous, with kind 'terms'|'accessibility' and path)
import { SimpleContent, metadataFor } from '@/components/SimpleContent'
export const revalidate = 3600
export const generateMetadata = () => metadataFor('privacy')
export default function Page() { return <SimpleContent kind="privacy" /> }
```
Map: `/privacy`→privacy, `/terms`→terms, `/accessibility-statement`→accessibility.

- [ ] **Step 3: Verify**

```bash
cd /Users/jagraj/Documents/Github/chancery-website-v2/chancery-next
npm run build
# dev backgrounded:
for p in privacy terms accessibility-statement; do curl -s -o /dev/null -w "$p=%{http_code}\n" http://localhost:3000/$p; done   # all 200
```
Screenshot one. Stop dev.

- [ ] **Step 4: Commit**

```bash
git add chancery-next/components/SimpleContent.tsx chancery-next/app/privacy chancery-next/app/terms chancery-next/app/accessibility-statement
git commit -m "feat(web): legal pages (privacy/terms/accessibility)"
```

---

## Task 7: Sitemap page (`/site-map`)

**Files:**
- Create: `chancery-next/app/site-map/page.tsx`, ported CSS

- [ ] **Step 1: Port** `frontend/src/pages/SiteMapPage.tsx` → `app/site-map/page.tsx` (async SC). Fetch `getPage('sitemap')`, `getHotels()`. Render the brand column + a column per hotel (7 links each: home, accommodation, dining, plan-your-event, special-offers, gallery, contact-us) via `next/link`. `generateMetadata` (fallback "Site Map"). Port the CSS.

- [ ] **Step 2: Verify**

```bash
cd /Users/jagraj/Documents/Github/chancery-website-v2/chancery-next
npm run build
# dev backgrounded:
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/site-map     # 200
curl -s http://localhost:3000/site-map | grep -c "/chancery/accommodation"  # >=1
```
Stop dev.

- [ ] **Step 3: Commit**

```bash
git add chancery-next/app/site-map
git commit -m "feat(web): sitemap page"
```

---

## Task 8: Book redirect (`/book`) + 404 page

**Files:**
- Create: `chancery-next/app/book/page.tsx`, `chancery-next/components/BookSplash.tsx`, `chancery-next/app/not-found.tsx`, ported CSS

- [ ] **Step 1: Book redirect** — port `frontend/src/pages/BookRedirect.tsx`. In App Router, `app/book/page.tsx` is a server component that reads `searchParams` and renders a client splash that redirects:
```tsx
// app/book/page.tsx
import { BookSplash } from '@/components/BookSplash'
import { buildSynxisUrl, type BookingParams } from '@/lib/booking'
import type { HotelSlug } from '@/lib/queries/content'
export const metadata = { robots: { index: false, follow: false } }
export default async function Book({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams
  const hotel = (sp.hotel === 'chancery' || sp.hotel === 'pavilion' ? sp.hotel : 'pavilion') as HotelSlug
  const params: BookingParams = {
    hotel, arrive: sp.arrive, depart: sp.depart,
    adult: sp.adult ? Number(sp.adult) : undefined, child: sp.child ? Number(sp.child) : undefined,
    rooms: sp.rooms ? Number(sp.rooms) : undefined, promo: sp.promo,
  }
  return <BookSplash url={buildSynxisUrl(params)} />
}
```
```tsx
// components/BookSplash.tsx — navy splash, 750ms, then redirect (port the legacy visual + delay)
'use client'
import { useEffect } from 'react'
export function BookSplash({ url }: { url: string }) {
  useEffect(() => { const t = setTimeout(() => { window.location.href = url }, 750); return () => clearTimeout(t) }, [url])
  return (
    <main className="book-splash">
      <p>Taking you to secure booking…</p>
      <noscript><a href={url}>Continue to booking</a></noscript>
    </main>
  )
}
```
Port the legacy splash CSS/markup so it matches (navy full-screen). Keep the `<noscript>` fallback link.

- [ ] **Step 2: 404** — port `frontend/src/pages/NotFoundPage.tsx` → `app/not-found.tsx` (server component): 404 message + 3 buttons (Home `/`, The Chancery Hotel `/chancery`, Pavilion `/pavilion`) via `next/link`. Port its CSS.

- [ ] **Step 3: Verify**

```bash
cd /Users/jagraj/Documents/Github/chancery-website-v2/chancery-next
npm run build
# dev backgrounded:
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/book        # 200 (splash)
curl -s "http://localhost:3000/book?hotel=chancery" | grep -c "be.synxis.com\|Continue to booking\|secure booking"  # >=1
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/totally-missing   # 404
curl -s http://localhost:3000/totally-missing | grep -c "/chancery"        # 404 page links present -> >=1
```
Stop dev.

- [ ] **Step 4: Commit**

```bash
git add chancery-next/app/book chancery-next/components/BookSplash.tsx chancery-next/app/not-found.tsx
git commit -m "feat(web): book redirect splash + 404 page"
```

---

## Phase 3b Done — exit criteria

- `npm run build` compiles the whole app.
- Every brand route renders real migrated content with the correct ported design (screenshot-verified for home, rooms, faq):
  `/`, `/rooms`, `/faq`, `/careers`, `/catering`, `/privacy`, `/terms`, `/accessibility-statement`, `/site-map`, `/book`, and the 404.
- Home page: hero, intro, hotel picker, dining strip, offers, testimonial carousel (interactive dots), awards — no console/hydration errors.
- FAQ accordion expands/collapses; `/book` shows the splash and links to the correct SynXis URL; unknown paths render the branded 404.
- Interactive bits are isolated `'use client'` islands; pages remain Server Components.

**Next:** `2026-06-23-rebuild-phase3c-hotel-pages.md` — hotel home, accommodation, dining, events, venue detail, offers, gallery, contact (+ the booking/enquiry modals and gallery lightbox).

---

## Self-review notes

- **Spec coverage (§7):** all brand routes from the legacy `App.tsx` are covered (home, rooms, faq, careers, catering, site-map, privacy, terms, accessibility, book, 404). SSR + ISR + per-page `generateMetadata`. Interactivity (reveal, carousel, accordion, splash) as client islands.
- **Type consistency:** islands receive plain prop types; pages import query functions from `@/lib/queries/content` and `buildMetadata` from `@/lib/seo`; `BookingParams`/`buildSynxisUrl`/`HotelSlug` reused from Phase 3a. `pages.css` imported once in `layout.tsx` and reused.
- **No placeholders:** new island code is complete; page tasks give exact legacy source path + data fetches + sections + route + CSS + metadata fallback. Every task has a concrete verify (curl/grep/build + screenshot for visual pages).
- **Watch-outs:** static routes precede `[hotel]`; CMS `page` may be null → legacy hardcoded fallbacks; keep `content.ts` server-only (islands take props); `/book` is noindex; 404 via `app/not-found.tsx`.
