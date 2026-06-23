# Chancery Hotels — Supabase + Vercel Rebuild

**Date:** 2026-06-23
**Status:** Design approved, pending written-spec review
**Type:** Faithful re-platform (same product, new stack)

## 1. Goal & scope

Rebuild the existing Chancery Hotels marketing site on a Vercel-native stack
without changing the product. Same pages, same design, same features — new
foundation.

**Stack:** Next.js (App Router) on Vercel + Supabase (Postgres + Auth + Storage)
+ Resend (transactional email).

**In scope**
- All current public pages and the current visual design.
- A custom `/admin` content-management zone (the Django-admin replacement).
- Automated migration of all existing content (Django SQLite) and media files.
- The enquiry routing/notify engine (email via Resend, Slack webhook live).
- Newsletter signup persistence; SynXis deep-link room booking (unchanged).
- SEO parity (JSON-LD, OG, canonical, sitemap, robots), now server-rendered.

**Out of scope (explicitly deferred)**
- AI concierge / WhatsApp / voice — separate future phase.
- Guest accounts — admin-only auth.
- Brevo newsletter list-sync — newsletter saves to Supabase; provider sync later.
- WhatsApp send — column carried over, dormant (no provider integration yet).
- Booking API (SynXis Method 3 / Opera) — deep-link only remains.

## 2. Architecture

A single Next.js app (one Vercel project) with two zones:

```
chancery-next/
  app/
    (site)/              public pages — Server Components, ISR-cached
      page.tsx                     home
      [hotel]/page.tsx             hotel home (chancery-hotel | chancery-pavilion)
      [hotel]/rooms/...            rooms, dining, events, venue detail, gallery, offers
      contact/  faq/  careers/ ... static-ish pages
    admin/               protected admin — dynamic, Supabase Auth gate
      hotels/ rooms/ dining/ venues/ offers/ gallery/ faq/ pages/ leads/ site/ users/
    api/                 Route Handlers: enquiry submit, newsletter, revalidate, upload sign
  lib/
    supabase/            server + browser clients, generated DB types
    queries/             typed content fetchers (one per content type)
    notify/              routing engine (department_contact lookup -> Resend/Slack send)
  components/            ported from current React (Navbar, Footer, Hero, cards...)
  supabase/
    migrations/          SQL schema + RLS policies
    seed/                migrate.ts (old Django DB + media -> Supabase)
```

**Rendering model.** Public pages are React Server Components that read Supabase
on the server and are statically cached via ISR. Caches are revalidated
on-demand when an admin saves a change (and on a fallback timer), preserving the
Django "edit and it's live, no redeploy" property. The `/admin` zone is dynamic
(per-request, authenticated). Writes use Server Actions / Route Handlers with the
Supabase service role on the server only.

**Security.** Row Level Security on every table:
- Content tables: public `SELECT`; writes denied to anon (admin/server only).
- `lead`, `newsletter_subscriber`: anon `INSERT` only; `SELECT` restricted to
  authenticated admins.
- `department_contact`: internal columns never publicly readable; only
  `public`-flagged phone/email exposed via a filtered query/view.

## 3. Data schema (Supabase Postgres)

Faithful 1:1 port of the current Django models, snake_case. Image fields become
`text` columns holding the Supabase Storage object path; the app builds public
URLs from them.

| Table | Notes |
|---|---|
| `site_content` | singleton (single enforced row) — titles, meta, newsletter copy, social URLs, SynXis chain id, og/logo images |
| `hotel` | the two properties; slug, contacts (phone/alt/fax/whatsapp/email), ratings, hero/about/banner/logo images, intro |
| `room_category` -> `room_image` | FK to hotel; size, guests, bed, amenities, hero + ordered gallery |
| `restaurant` -> `restaurant_image` | FK to hotel; cuisine, timing, hero/logo + ordered gallery |
| `venue` -> `venue_image` | FK to hotel; capacities (theatre/banquet/classroom/u-shape/cocktail), pricing, dimensions, hero + gallery |
| `offer` | optional hotel FK, promo code, min nights, image |
| `gallery_image` | optional hotel FK, category, image, alt, order |
| `faq_section` -> `faq_item` | ordered Q&A |
| `testimonial` | quote, name, title, rating, order |
| `page` -> `page_section` | the ~27 CMS pages: kind + optional hotel FK, hero block, meta, plus ordered sections (text/image/cta) |
| `lead` | enquiry submissions — interest, hotel_interest, restaurant, venue, event_type, covers, dates, status, routed_to |
| `newsletter_subscriber` | unique email |
| `department_contact` | routing table — hotel scope + department -> notify_email, cc_emails, phone, public flag, whatsapp_number, slack_webhook, is_active |

**Conventions**
- `uuid` PKs (`gen_random_uuid()`), `created_at`/`updated_at` timestamps,
  integer `order` columns preserved for manual sorting.
- Enum-style fields (hotel slug, venue kind, gallery category, page kind, lead
  interest/status, department) -> Postgres enums or `text` + CHECK, mirroring the
  current Django `choices`.
- **Storage:** one `media` bucket, public-read, foldered exactly as today
  (`hotels/`, `rooms/`, `dining/`, `venues/`, `offers/`, `pages/`, `gallery/`,
  `brand/`). DB stores the object path.

## 4. Admin & auth

A `/admin` zone inside the same Next.js app, tailored to the content.

**Auth.** Supabase Auth, email+password, staff only. No public sign-up; accounts
created by an owner via an admin "Users" screen or the Supabase dashboard. An
`admin_users` allowlist (or custom `role` claim) gates access; Next.js middleware
protects every `/admin/*` route, redirecting unauthenticated users to
`/admin/login`. No guest accounts.

**Structure** — one section per content type, mirroring Django admin list -> edit:
- **List view:** sortable table, search, columns echoing Django (name, hotel,
  order, active), "New", inline delete.
- **Edit view:** form with every schema field; Server Actions save; on success,
  on-demand revalidation of affected public pages so edits go live immediately.
- **Galleries** (room/restaurant/venue/gallery images): multi-image upload to
  Storage with drag-to-reorder (writes `order`) and per-image alt text.
- **Image fields:** upload widget -> `media` bucket in correct folder, stores
  path, live preview; replacing an image swaps the file.
- **Leads inbox:** list with status editing (new -> contacted -> ...) and the
  routing info each lead hit.
- **Department routing & Site content:** forms for `department_contact` rows and
  the `site_content` singleton.

**Rich text:** preserve the current plain `TextField` conventions exactly (e.g.
amenities = one per line). No rich-text editor in this phase.

## 5. Backend logic: enquiry routing + notifications

Ports the Django routing/notify engine to Next.js Route Handlers on Vercel.

**Submit flow (`POST /api/enquiry`)**
1. Public form posts to a Route Handler / Server Action; validate with zod
   (name, email, interest, hotel, plus context: restaurant/venue/event_type/
   covers/date/time/message).
2. Insert a `lead` row (server-side, service role) — source of truth, first.
3. Routing engine (`lib/notify`): given `(hotel_scope, department)`, look up the
   matching active `department_contact` -> resolve `notify_email` + `cc_emails`;
   record `routed_to` on the lead.
4. Send via Resend: (a) notification email to the resolved department inbox with
   all enquiry details; (b) branded acknowledgement email to the guest.
   Templates ported from current Django versions.
5. Slack: if the department has a `slack_webhook`, post the enquiry to it.
   WhatsApp: `whatsapp_number` column carried over but dormant (no send yet).

**Newsletter (`POST /api/newsletter`)**: upsert into `newsletter_subscriber`
(unique email). Saves to Supabase (no longer a void). No Brevo list-sync this
phase.

**Room booking:** unchanged — SynXis deep-link only (`BookRedirect` + per-room
`book_url` / promo codes). No booking API.

**Reliability:** the lead insert happens first and is the source of truth; if
Resend/Slack fails, the lead is still captured and the error logged — no enquiry
is lost.

## 6. Data & media migration

A one-time Node script (`supabase/seed/migrate.ts`) run locally against both
systems:

1. **Read source:** open `backend/db.sqlite3` read-only and the `backend/media/`
   directory.
2. **Upload media:** walk `media/`, upload every file to the Supabase `media`
   bucket preserving the exact folder path. Existing WebP/responsive variants
   come along as-is.
3. **Insert rows:** per Django model, insert Postgres rows in FK order (hotels ->
   rooms/restaurants/venues -> their images -> offers/gallery/faq/pages/sections/
   testimonials -> department_contacts). Image columns get the Storage path.
   Leads skipped by default (transactional, not content).
4. **Verify:** print per-table counts and assert they match source (e.g. ~37
   gallery images, ~27 pages); spot-check each referenced image exists in Storage.

Idempotent (truncate-and-reload, like the current `seed` command). The original
Django repo/DB is never modified (read-only).

## 7. Rendering, SEO & performance

- Public pages = Server Components + ISR, revalidated on-demand on admin save and
  on a fallback timer.
- SEO parity, upgraded: JSON-LD, Open Graph, per-page canonical, sitemap, robots
  move to the Next.js Metadata API + generated `sitemap.ts`/`robots.ts`,
  server-rendered into initial HTML (stronger than the current client-side
  Helmet approach).
- Images: `next/image` sourced from Supabase Storage — automatic responsive
  sizing, lazy-loading, modern formats. Fade-in/skeleton polish preserved at the
  component level.
- Hotel context: current `HotelContext`/per-hotel routing maps to `[hotel]`
  dynamic segments.

## 8. Testing & verification

- **Schema/RLS:** anon can read content but not write; can insert a lead but not
  read others' leads.
- **Migration:** count-assert + image-existence checks; visual diff of key pages
  old-vs-new.
- **Routing engine:** unit tests on `lib/notify` — (hotel, department) resolves
  correct inbox/cc and records `routed_to`; Resend client mocked.
- **E2E smoke:** submit enquiry -> lead row + emails attempted; admin login ->
  edit a field -> public page reflects it after revalidation. Driven via the
  browser/QA tooling against local dev.

## 9. Migration & cutover notes

- Full backup of the current repo taken before work began:
  `../chancery-website-v2-backup-20260623.tar.gz` (source + git history + db +
  media).
- The new app is built alongside the existing code; the Django backend stays
  runnable until cutover.
- Cutover = point DNS / Vercel production at the new app once parity is verified.

## 10. Open items to confirm during implementation

- Exact Resend sending domain / from-address.
- Whether `site_content` social/SynXis defaults carry over verbatim from current
  data (migration will preserve them).
- Admin user list (who gets accounts) — set during deploy.
