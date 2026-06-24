# Chancery Hotels

Marketing site for the Chancery Group of Hotels — two Bengaluru properties: **The Chancery Hotel** (Lavelle Road) and **The Chancery Pavilion** (Residency Road).

## Stack

- **Frontend** — Next.js (App Router) in [`chancery-next/`](chancery-next), deployed on **Vercel**.
- **Backend** — **Supabase**: Postgres (content + leads), Storage (media), Auth + RLS. No separate server.
- **Email** — Resend for enquiry routing + guest acknowledgements (in progress).

The previous Django + Vite/SQLite stack was fully migrated to Supabase and removed. Design docs are under [`docs/`](docs); the old code remains in git history (and `../chancery-website-v2-backup-20260623.tar.gz`) if ever needed.

## Develop

```bash
cd chancery-next
npm install
npm run dev      # http://localhost:3000
```

Requires `chancery-next/.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...     # server-only — never exposed to the client
```

Local Supabase needs Docker (`supabase start`). The production cloud project is `vbvstuoipunfcwvuunkn` (region ap-south-1).

## Database

Schema migrations live in [`chancery-next/supabase/migrations/`](chancery-next/supabase/migrations). Apply to a linked project:

```bash
cd chancery-next
npx supabase db push
```

Content and media are served directly from Supabase (Postgres + Storage); the site reads via the anon client (RLS public-read) and writes leads via a server-only service-role route.

## Deploy

Push to `main` → the Vercel project auto-deploys (root directory `chancery-next`, framework Next.js).

## Routes

Brand: `/`, `/rooms`, `/book`, `/faq`, `/careers`, `/catering`, `/site-map`, `/privacy`, `/terms`, `/accessibility-statement`.

Per hotel (`:hotel` = `chancery` | `pavilion`): `/:hotel`, `/:hotel/accommodation`, `/:hotel/dining`, `/:hotel/plan-your-event` (+ `/[venue]`), `/:hotel/special-offers`, `/:hotel/gallery`, `/:hotel/contact-us`.

API routes: `POST /api/enquiry` (lead capture), `POST /api/newsletter`.
