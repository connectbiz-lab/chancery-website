# Chancery Rebuild — Phase 3c: Hotel-Scoped Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Port the eight hotel-scoped pages under `/[hotel]/` (hotel home, accommodation, dining, plan-your-event, plan-your-event/[venue], special-offers, gallery, contact-us) to Next.js Server Components, with the interactive pieces (photo galleries, lightbox, Book-a-Table / Event-enquiry modals, contact form) as `'use client'` islands. Wire all enquiry forms to a new insert-only `/api/enquiry` endpoint that captures leads in Supabase (routing/notify is Phase 5).

**Architecture:** Each page is an async Server Component under `app/[hotel]/.../page.tsx`, fetching via the Phase-3a query layer and rendering legacy markup/CSS verbatim. Interactivity lives in client islands receiving plain props. Enquiry forms POST to `/api/enquiry` (a Route Handler that validates and inserts a `lead` via the service-role client). Pages set `revalidate = 3600` and export `generateMetadata`.

**Tech Stack:** Next.js App Router, React Server Components, the Phase-3a `lib/queries/content.ts`, `lib/seo.ts`, `Media`, `BookButton`, `lib/booking.ts`, `lib/supabase/server.ts` (service role for the lead insert).

**Reference:** legacy pages `frontend/src/pages/{HotelHomePage,AccommodationPage,DiningPage,EventsPage,VenueDetailPage,OffersPage,GalleryPage,ContactPage}.tsx` (+ their `.css`) and modals `frontend/src/components/{BookTableModal,EventEnquiryModal}.tsx` (+ `BookTableModal.css`). Lead fields: `backend/leads/models.py` Lead. Spec §5 (lead capture) + §7.

**Prerequisites:** Phases 3a + 3b done. The `app/[hotel]/layout.tsx` (slug validation) and `app/[hotel]/page.tsx` (proof-of-shell hotel home, to be REPLACED in Task 3) exist. Supabase running, data migrated. Build with `npm run build`. `psql` via `docker exec -i supabase_db_chancery-next psql -U postgres -d postgres`. Run dev BACKGROUNDED for checks; stop after. Do NOT touch `backend/`/`frontend/`. Branch `imageloadoptimise`. One commit per task from repo root.

**Lead table columns** (target for `/api/enquiry`): `name, email, phone, interest (enum stay|dining|event|catering|careers|other), hotel_interest (enum chancery|pavilion|either), message, page, restaurant, venue, event_type, covers (smallint), preferred_date (date), preferred_time, status (default 'new'), routed_to (default '')`. The endpoint inserts; Phase 5 fills `routed_to` + sends email.

**General port rules:** same as Phase 3b — async Server Component, query-layer data, legacy markup/classNames, copy `.css` verbatim, `react-router Link`→`next/link`, `<PageMeta>`→`generateMetadata`, CMS images→`<Media>`/`mediaUrl()`, null CMS `page`→legacy fallbacks, interactivity→`'use client'` islands taking props, keep `content.ts` server-only.

---

## Task 1: `/api/enquiry` insert-only endpoint

**Files:**
- Create: `chancery-next/app/api/enquiry/route.ts`

- [ ] **Step 1: Write the route handler**

```typescript
// app/api/enquiry/route.ts — capture an enquiry as a `lead` row.
// Phase 5 adds department routing + Resend/Slack notification on top of this.
import { createAdminClient } from '@/lib/supabase/server'

const INTERESTS = ['stay', 'dining', 'event', 'catering', 'careers', 'other']
const HOTEL_INTERESTS = ['chancery', 'pavilion', 'either']

export async function POST(req: Request) {
  let body: Record<string, unknown>
  try { body = await req.json() } catch { return Response.json({ ok: false, error: 'Bad JSON' }, { status: 400 }) }

  const name = String(body.name ?? '').trim()
  const email = String(body.email ?? '').trim()
  if (!name || !/.+@.+\..+/.test(email)) {
    return Response.json({ ok: false, error: 'Name and a valid email are required.' }, { status: 400 })
  }

  const interest = INTERESTS.includes(String(body.interest)) ? String(body.interest) : 'other'
  const hotel_interest = HOTEL_INTERESTS.includes(String(body.hotel_interest)) ? String(body.hotel_interest) : 'either'
  const coversNum = Number(body.covers)
  const lead = {
    name, email,
    phone: String(body.phone ?? '').trim(),
    interest, hotel_interest,
    message: String(body.message ?? '').trim(),
    page: String(body.page ?? '').trim(),
    restaurant: String(body.restaurant ?? '').trim(),
    venue: String(body.venue ?? '').trim(),
    event_type: String(body.event_type ?? '').trim(),
    covers: Number.isFinite(coversNum) && coversNum > 0 ? Math.floor(coversNum) : null,
    preferred_date: body.preferred_date ? String(body.preferred_date) : null,
    preferred_time: String(body.preferred_time ?? '').trim(),
  }

  const supa = createAdminClient()
  const { error } = await supa.from('lead').insert(lead)
  if (error) return Response.json({ ok: false, error: error.message }, { status: 500 })
  return Response.json({ ok: true })
}
```

- [ ] **Step 2: Verify it inserts a lead**

```bash
cd /Users/jagraj/Documents/Github/chancery-website-v2/chancery-next
npm run build
# dev backgrounded:
curl -s -X POST http://localhost:3000/api/enquiry -H 'content-type: application/json' \
  -d '{"name":"Test Guest","email":"t@example.com","interest":"dining","hotel_interest":"pavilion","restaurant":"Matsuri","covers":4,"preferred_date":"2026-07-01","page":"pavilion/dining"}'   # {"ok":true}
docker exec -i supabase_db_chancery-next psql -U postgres -d postgres -c \
  "select name,interest,hotel_interest,restaurant,covers,preferred_date from lead where email='t@example.com';"   # the row
# validation:
curl -s -X POST http://localhost:3000/api/enquiry -H 'content-type: application/json' -d '{"name":"x"}'   # {"ok":false,...} 400
# cleanup:
docker exec -i supabase_db_chancery-next psql -U postgres -d postgres -c "delete from lead where email='t@example.com';"
```
Expected: first → `{"ok":true}` and the row shows interest=dining, covers=4, date=2026-07-01; invalid → 400. Stop dev.

- [ ] **Step 3: Commit**

```bash
cd /Users/jagraj/Documents/Github/chancery-website-v2
git add chancery-next/app/api/enquiry
git commit -m "feat(web): insert-only /api/enquiry lead capture endpoint"
```

---

## Task 2: Shared photo-gallery island (`MediaGallery`)

**Files:**
- Create: `chancery-next/components/MediaGallery.tsx`

Used by accommodation + dining (the room/restaurant blocks with a main image + thumbnail strip). Port the thumb-switcher logic from `frontend/src/pages/AccommodationPage.tsx` (the room gallery).

- [ ] **Step 1: Write the island**

```tsx
'use client'
import { useState } from 'react'
import Image from 'next/image'
import { mediaUrl } from '@/lib/media'

type Img = { image: string; alt: string }

/** Main image + thumbnail strip; clicking a thumb swaps the main image.
 *  Mirrors the legacy room/restaurant gallery. Keep legacy classNames. */
export function MediaGallery({ hero, images, name }: { hero: string | null; images: Img[]; name: string }) {
  const all: Img[] = [hero ? { image: hero, alt: name } : null, ...images].filter(Boolean) as Img[]
  const [active, setActive] = useState(0)
  if (!all.length) return null
  const main = all[Math.min(active, all.length - 1)]
  return (
    <div className="media-gallery">
      <div className="figure aspect-3-2 media-gallery-main">
        <Image src={mediaUrl(main.image)!} alt={main.alt || name} fill sizes="(max-width: 900px) 100vw, 50vw" style={{ objectFit: 'cover' }} />
      </div>
      {all.length > 1 && (
        <div className="media-gallery-thumbs">
          {all.map((img, i) => (
            <button key={i} className={`media-gallery-thumb ${i === active ? 'active' : ''}`}
              aria-label={`View image ${i + 1}`} onClick={() => setActive(i)}>
              <Image src={mediaUrl(img.image)!} alt={img.alt || name} fill sizes="120px" style={{ objectFit: 'cover' }} />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
```
NOTE: read the legacy AccommodationPage/DiningPage gallery markup and align classNames so the existing CSS styles it; if the legacy used specific class names (e.g. `.room-gallery`, `.room-thumbs`), reuse those exact names instead of the generic ones above and rely on the ported page CSS.

- [ ] **Step 2: Verify build** (`cd chancery-next && npm run build` → clean; component unused until Tasks 4–5).

- [ ] **Step 3: Commit**

```bash
git add chancery-next/components/MediaGallery.tsx
git commit -m "feat(web): shared room/restaurant photo-gallery island"
```

---

## Task 3: Hotel home (`/[hotel]`)

**Files:**
- Modify: `chancery-next/app/[hotel]/page.tsx` (replace proof-of-shell)
- Create: `chancery-next/app/[hotel]/HotelHomePage.css` (port)

- [ ] **Step 1: Port** `frontend/src/pages/HotelHomePage.tsx`. Async SC, `params: Promise<{hotel}>`. Fetch:
```typescript
const { hotel } = await params
const [page, h, rooms, restaurants, venues, offers, gallery] = await Promise.all([
  getPage('hotel_home', hotel), getHotel(hotel), getRooms(hotel), getRestaurants(hotel),
  getVenues(hotel), getOffers(hotel), getGallery(hotel),
])
if (!h) notFound()
```
Render legacy sections: hero, stats (rooms_count / dining count / venues count), about (image + intro_heading/intro_body), rooms preview (3 + link to accommodation), dining preview (3 + link), events teaser (link to plan-your-event), offers teaser (3), gallery preview (6 + link). Wrap reveal sections in `<Reveal>`. Use `<Media>`, `<BookButton hotel={hotel}>`, `next/link`. `generateMetadata` from `page`/`h` (fallback `h.name`).

- [ ] **Step 2: Verify + screenshot**

```bash
cd /Users/jagraj/Documents/Github/chancery-website-v2/chancery-next
npm run build
# dev backgrounded:
for s in chancery pavilion; do curl -s -o /dev/null -w "$s=%{http_code}\n" http://localhost:3000/$s; done   # both 200
curl -s http://localhost:3000/pavilion | grep -c "section"   # sections present
```
Screenshot `/pavilion` and `/chancery`; confirm hero, stats, about, previews render with photos, no console errors. Stop dev.

- [ ] **Step 3: Commit**

```bash
git add chancery-next/app/[hotel]/page.tsx chancery-next/app/[hotel]/HotelHomePage.css
git commit -m "feat(web): full hotel home page"
```

---

## Task 4: Accommodation (`/[hotel]/accommodation`)

**Files:**
- Create: `chancery-next/app/[hotel]/accommodation/page.tsx`, `.../AccommodationPage.css` (port)

- [ ] **Step 1: Port** `frontend/src/pages/AccommodationPage.tsx`. Async SC. Fetch `getPage('accommodation', hotel)`, `getHotel(hotel)`, `getRooms(hotel)`. Hero + optional intro + a block per room (alternating layout) using `<MediaGallery hero={room.hero_image} images={room.images} name={room.name} />`, amenities list (`room.amenities_list`), specs (size/guests/bed), and a book CTA (`<BookButton hotel={hotel}>` with `room.book_url` if present, else default). `generateMetadata` (fallback "Accommodation"). Port the CSS.

- [ ] **Step 2: Verify**

```bash
cd /Users/jagraj/Documents/Github/chancery-website-v2/chancery-next
npm run build
# dev backgrounded:
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/pavilion/accommodation   # 200
curl -s http://localhost:3000/pavilion/accommodation | grep -oc "media-gallery\|room"     # blocks present
```
Screenshot it; click a gallery thumbnail (preview_click) and confirm the main image swaps. Stop dev.

- [ ] **Step 3: Commit**

```bash
git add chancery-next/app/[hotel]/accommodation
git commit -m "feat(web): accommodation page with photo galleries"
```

---

## Task 5: Dining (`/[hotel]/dining`) + Book-a-Table modal

**Files:**
- Create: `chancery-next/app/[hotel]/dining/page.tsx`, `.../DiningPage.css` (port), `chancery-next/components/BookTableModal.tsx` (+ `BookTableModal.css` port)

- [ ] **Step 1: Port the modal** — `components/BookTableModal.tsx` (`'use client'`) from `frontend/src/components/BookTableModal.tsx`. Props: `{ open, onClose, hotel, restaurant }`. Keep Escape-to-close, body-scroll-lock, the form fields (name, email, phone, covers, preferred_date, preferred_time, message) and the success state. On submit, POST to `/api/enquiry` with `{ ...fields, interest: 'dining', hotel_interest: hotel, restaurant, page: ` + "`${hotel}/dining`" + ` }`. Copy `BookTableModal.css` verbatim.

- [ ] **Step 2: Port the page** — `app/[hotel]/dining/page.tsx` (async SC) fetches `getPage('dining', hotel)`, `getHotel(hotel)`, `getRestaurants(hotel)`. Hero + intro + a block per restaurant (alternating) with `<MediaGallery>`, cuisine/timing/description, and a "Book a table" button. Because the page is a Server Component but the modal needs state, wrap each restaurant's book button + modal in a small `'use client'` wrapper `components/DiningBookButton.tsx` (holds `open` state, renders the trigger button + `<BookTableModal>`), receiving `{ hotel, restaurant }` props. `generateMetadata` (fallback "Dining"). Port the CSS.

- [ ] **Step 3: Verify modal**

```bash
cd /Users/jagraj/Documents/Github/chancery-website-v2/chancery-next
npm run build
# dev backgrounded:
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/pavilion/dining   # 200
```
Screenshot the page; click a "Book a table" button (preview_click) → modal opens; fill + submit (preview_fill / preview_click) and confirm success state; then check a lead row was inserted:
```bash
docker exec -i supabase_db_chancery-next psql -U postgres -d postgres -c "select interest,restaurant from lead order by created_at desc limit 1;"
docker exec -i supabase_db_chancery-next psql -U postgres -d postgres -c "delete from lead where interest='dining' and email like '%preview%';"  # clean test rows
```
Confirm no console errors. Stop dev.

- [ ] **Step 4: Commit**

```bash
git add chancery-next/app/[hotel]/dining chancery-next/components/BookTableModal.tsx chancery-next/components/BookTableModal.css chancery-next/components/DiningBookButton.tsx
git commit -m "feat(web): dining page + book-a-table modal (lead capture)"
```

---

## Task 6: Events (`/[hotel]/plan-your-event`) + Event-enquiry modal

**Files:**
- Create: `chancery-next/app/[hotel]/plan-your-event/page.tsx`, `.../EventsPage.css` (port), `chancery-next/components/EventEnquiryModal.tsx`, `chancery-next/components/EventEnquiryButton.tsx`

- [ ] **Step 1: Port the modal** — `components/EventEnquiryModal.tsx` (`'use client'`) from `frontend/src/components/EventEnquiryModal.tsx`. Props `{ open, onClose, hotel, venue? }`. Fields: name, email, phone, event_type, covers, preferred_date, message. Submit POSTs `/api/enquiry` with `{ ...fields, interest: 'event', hotel_interest: hotel, venue: venue ?? '', page: ` + "`${hotel}/plan-your-event`" + ` }`. Reuse `BookTableModal.css` chrome (the legacy modal shares `.btm-*` classes — import the same CSS; do NOT duplicate). Keep Escape/scroll-lock/success state.

- [ ] **Step 2: Trigger wrapper** — `components/EventEnquiryButton.tsx` (`'use client'`): holds `open` state, renders a trigger button + `<EventEnquiryModal hotel venue?>`. Props `{ hotel, venue?, label?, className? }`.

- [ ] **Step 3: Port the page** — `app/[hotel]/plan-your-event/page.tsx` (async SC) fetches `getPage('events', hotel)`, `getHotel(hotel)`, `getVenues(hotel)`. Hero + intro + 4 occasion cards (static copy from legacy) + venue grid (cards with capacities table: theatre/banquet/etc.) + CTA band with `<EventEnquiryButton hotel={hotel} label="Request a proposal" />`. Each venue card links to `/[hotel]/plan-your-event/<venue.slug>`. `generateMetadata` (fallback "Plan Your Event"). Port the CSS.

- [ ] **Step 4: Verify**

```bash
cd /Users/jagraj/Documents/Github/chancery-website-v2/chancery-next
npm run build
# dev backgrounded:
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/pavilion/plan-your-event   # 200
curl -s http://localhost:3000/pavilion/plan-your-event | grep -oc "plan-your-event/"        # venue links present
```
Screenshot; open the proposal modal (preview_click) and confirm it renders. Stop dev.

- [ ] **Step 5: Commit**

```bash
git add chancery-next/app/[hotel]/plan-your-event/page.tsx chancery-next/app/[hotel]/plan-your-event/EventsPage.css chancery-next/components/EventEnquiryModal.tsx chancery-next/components/EventEnquiryButton.tsx
git commit -m "feat(web): events page + event-enquiry modal"
```

---

## Task 7: Venue detail (`/[hotel]/plan-your-event/[venue]`)

**Files:**
- Create: `chancery-next/app/[hotel]/plan-your-event/[venue]/page.tsx`, `.../VenueDetailPage.css` (port)

- [ ] **Step 1: Port** `frontend/src/pages/VenueDetailPage.tsx`. Async SC, `params: Promise<{ hotel, venue }>`. Fetch `getVenues(hotel)`, find by `slug === venue`; if not found `notFound()`. Render hero, back link to `/[hotel]/plan-your-event`, name/description, facts table (area_sqft, dimensions, ceiling_ft, guests_max), capacity table (cap_theatre/banquet/classroom/ushape/cocktail — omit null rows), pricing table (half_day_inr/full_day_inr/per_plate_inr — omit nulls), image gallery grid (`venue.images` via `<Media>`), and `<EventEnquiryButton hotel={hotel} venue={venue.name} label="Enquire about this venue" />`. `generateMetadata` from the venue (title `${venue.name}`). Note: `venue.kind` may be null (blank in legacy) — render conditionally. Port the CSS.

- [ ] **Step 2: Verify + 404**

```bash
cd /Users/jagraj/Documents/Github/chancery-website-v2/chancery-next
npm run build
# get a real venue slug:
SLUG=$(docker exec -i supabase_db_chancery-next psql -U postgres -d postgres -t -c "select v.slug from venue v join hotel h on h.id=v.hotel_id where h.slug='pavilion' limit 1;" | tr -d ' ')
# dev backgrounded:
curl -s -o /dev/null -w "%{http_code}\n" "http://localhost:3000/pavilion/plan-your-event/$SLUG"   # 200
curl -s -o /dev/null -w "%{http_code}\n" "http://localhost:3000/pavilion/plan-your-event/nope-not-real"   # 404
```
Screenshot the venue page; confirm facts/capacity/pricing tables + gallery. Stop dev.

- [ ] **Step 3: Commit**

```bash
git add "chancery-next/app/[hotel]/plan-your-event/[venue]"
git commit -m "feat(web): venue detail page"
```

---

## Task 8: Special offers (`/[hotel]/special-offers`)

**Files:**
- Create: `chancery-next/app/[hotel]/special-offers/page.tsx`, ported CSS (or reuse pages.css)

- [ ] **Step 1: Port** `frontend/src/pages/OffersPage.tsx`. Async SC. Fetch `getPage('offers', hotel)`, `getHotel(hotel)`, `getOffers(hotel)`. Hero + intro + offer cards (image via `<Media>`, tag, title, description, min_nights, promo_code) each with a book CTA (`<BookButton hotel={hotel} promo={offer.promo_code}>`). `generateMetadata` (fallback "Special Offers"). Port any CSS.

- [ ] **Step 2: Verify**

```bash
cd /Users/jagraj/Documents/Github/chancery-website-v2/chancery-next
npm run build
# dev backgrounded:
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/chancery/special-offers   # 200
curl -s http://localhost:3000/chancery/special-offers | grep -c "be.synxis.com"            # book links -> >=1
```
Screenshot. Stop dev.

- [ ] **Step 3: Commit**

```bash
git add chancery-next/app/[hotel]/special-offers
git commit -m "feat(web): special offers page"
```

---

## Task 9: Gallery (`/[hotel]/gallery`) + lightbox island

**Files:**
- Create: `chancery-next/app/[hotel]/gallery/page.tsx`, `.../GalleryPage.css` (port), `chancery-next/components/GalleryLightbox.tsx`

- [ ] **Step 1: Lightbox island** — `components/GalleryLightbox.tsx` (`'use client'`) porting `frontend/src/pages/GalleryPage.tsx` interactivity: category filter tabs, the image grid, and a lightbox (open on click, prev/next arrows, Escape / click-outside to close). Props: `images: { image: string; alt: string; category: string }[]`. Use `next/image` via `mediaUrl()`. Keep legacy `.gallery-*`/`.lightbox-*` classNames.

- [ ] **Step 2: Page** — `app/[hotel]/gallery/page.tsx` (async SC) fetches `getPage('gallery', hotel)`, `getHotel(hotel)`, `getGallery(hotel)`. Hero + intro + `<GalleryLightbox images={gallery} />`. `generateMetadata` (fallback "Gallery"). Port the CSS.

- [ ] **Step 3: Verify**

```bash
cd /Users/jagraj/Documents/Github/chancery-website-v2/chancery-next
npm run build
# dev backgrounded:
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/chancery/gallery   # 200
```
Screenshot; click a thumbnail to open the lightbox, click next, confirm it advances; click a category filter and confirm the grid filters. Stop dev.

- [ ] **Step 4: Commit**

```bash
git add chancery-next/app/[hotel]/gallery chancery-next/components/GalleryLightbox.tsx
git commit -m "feat(web): gallery page with filters + lightbox"
```

---

## Task 10: Contact (`/[hotel]/contact-us`) + contact form

**Files:**
- Create: `chancery-next/app/[hotel]/contact-us/page.tsx`, `.../ContactPage.css` (port), `chancery-next/components/ContactForm.tsx`, `chancery-next/components/DeptIcon.tsx`

- [ ] **Step 1: Department icon map** — `components/DeptIcon.tsx`: port the legacy ContactPage department→icon mapping (it maps department keys reservations/dining/sales/events/catering/careers/general to SVG icons; copy the SVGs from the legacy `ContactPage.tsx`/`NavIcons`). Props `{ department: string }`.

- [ ] **Step 2: Contact form island** — `components/ContactForm.tsx` (`'use client'`) porting the legacy ContactPage form. Fields: name, email, phone, interest (select: stay/dining/event/catering/careers/other), hotel_interest (select incl. "either"), message. Props `{ hotel }`. Submit POSTs `/api/enquiry` with `{ ...fields, page: ` + "`${hotel}/contact-us`" + ` }`. Keep the legacy success/error UI.

- [ ] **Step 3: Page** — `app/[hotel]/contact-us/page.tsx` (async SC) fetches `getPage('contact', hotel)` and `getHotels()` (both hotels). Hero + a contact block per hotel (address, phone, phone_alt, whatsapp, and `hotel.departments` each with `<DeptIcon department={d.department}/>` + label + email + phone) + `<ContactForm hotel={hotel} />`. `generateMetadata` (fallback "Contact Us"). Port the CSS.

- [ ] **Step 4: Verify form submit**

```bash
cd /Users/jagraj/Documents/Github/chancery-website-v2/chancery-next
npm run build
# dev backgrounded:
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/pavilion/contact-us   # 200
curl -s http://localhost:3000/pavilion/contact-us | grep -oc "reservations\|Reservations"   # departments present
```
Screenshot; fill + submit the contact form via preview tools; confirm success message and a lead row:
```bash
docker exec -i supabase_db_chancery-next psql -U postgres -d postgres -c "select interest,hotel_interest,page from lead order by created_at desc limit 1;"
docker exec -i supabase_db_chancery-next psql -U postgres -d postgres -c "delete from lead where page like '%contact-us%' and email like '%preview%';"
```
Confirm both hotel contact blocks show departments with icons, no console errors. Stop dev.

- [ ] **Step 5: Commit**

```bash
git add chancery-next/app/[hotel]/contact-us chancery-next/components/ContactForm.tsx chancery-next/components/DeptIcon.tsx
git commit -m "feat(web): contact page with department contacts + enquiry form"
```

---

## Phase 3c Done — exit criteria

- `npm run build` compiles; all hotel routes render real data for BOTH hotels:
  `/[hotel]`, `/[hotel]/accommodation`, `/[hotel]/dining`, `/[hotel]/plan-your-event`, `/[hotel]/plan-your-event/[venue]`, `/[hotel]/special-offers`, `/[hotel]/gallery`, `/[hotel]/contact-us`.
- Photo galleries swap images; gallery lightbox opens/navigates/filters; venue detail 404s on bad slug.
- All three enquiry paths (Book-a-Table, Event proposal, Contact form) submit and INSERT a `lead` row via `/api/enquiry`.
- Contact page shows both hotels' department contacts with icons.
- Interactivity isolated in client islands; pages are Server Components; `content.ts`/service key never reach a client bundle.
- **Phase 3 (public site) is now functionally complete** — the full marketing site runs on Next.js + Supabase. (Routing/notify emails come in Phase 5; admin in Phase 4.)

---

## Self-review notes

- **Spec coverage (§5 capture, §7):** all 8 hotel routes ported; lead capture via `/api/enquiry` (insert-only, service role) for the three forms; routing/notify explicitly deferred to Phase 5; galleries/lightbox/modals as client islands.
- **Type consistency:** `/api/enquiry` lead fields match the `lead` table columns + enums (interest/hotel_interest validated against the same lists as the DB enums). Modals/forms POST the exact field set the endpoint reads. `MediaGallery`/`GalleryLightbox`/modals take plain prop types; `getRooms/getRestaurants/getVenues` already attach `images[]`.
- **No placeholders:** new endpoint + islands have full code; page tasks give exact legacy source + data fetches + sections + route + CSS + metadata fallback + a concrete verify (curl/psql/screenshot/interaction).
- **Watch-outs:** Server Components can't hold modal state → trigger wrappers (`DiningBookButton`, `EventEnquiryButton`) are the client boundary; `venue.kind` may be null; modal CSS shared (`BookTableModal.css`) not duplicated; clean up test `lead` rows after interaction checks; keep `content.ts`/service-role server-only.
