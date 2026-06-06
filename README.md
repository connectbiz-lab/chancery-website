# Chancery Hotels (v2)

A rebuild of the Chancery Hotels marketing site — two Bengaluru properties (**The Chancery Hotel**, Lavelle Road, and **The Chancery Pavilion**, Residency Road) — using:

- **Backend** — Django 5 + Django REST Framework, SQLite, Pillow for image uploads.
- **Frontend** — React 19 + Vite 8 + TypeScript + React Router 7 + React Helmet Async.
- **Design** — Claridge's-inspired editorial luxury: serif display type (Fraunces / Cormorant Garamond), generous whitespace, full-bleed photography, restrained palette of ivory, navy and gold.

Every image on the site is managed through the **Django admin** — no code changes are needed to swap any photograph on any page.

## Repository layout

```
chancery-website-v2/
├── backend/                     Django REST API + admin + media uploads
│   ├── chancery_backend/        project settings, urls, wsgi
│   ├── content/                 hotels, rooms, dining, venues, offers, gallery, faq, pages
│   ├── leads/                   contact form submissions + newsletter subscribers
│   ├── media/                   ImageField storage (seeded + admin uploads)
│   ├── requirements.txt
│   └── manage.py
└── frontend/                    Vite + React + TS
    ├── src/
    │   ├── components/          Navbar, Footer, Hero, Layout, PageMeta, Loading
    │   ├── lib/                 api client, types, hotel context, booking, reveal hook
    │   ├── pages/               28 routes — home, hotel homes, rooms, dining, etc.
    │   ├── styles/globals.css   design tokens + base styles
    │   ├── main.tsx
    │   └── App.tsx
    ├── public/favicon.svg
    ├── index.html
    ├── package.json
    └── vite.config.ts
```

## Quick start

### 1. Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py seed              # copies images + seeds content
python manage.py createsuperuser   # for /admin access
python manage.py runserver 127.0.0.1:8000
```

The API is now live at:
- `http://127.0.0.1:8000/api/` — REST endpoints
- `http://127.0.0.1:8000/admin/` — Django admin
- `http://127.0.0.1:8000/media/` — uploaded images

#### What `seed` does

The `seed` management command (`backend/content/management/commands/seed.py`):

1. **Wipes** all content tables (it is idempotent — re-runs leave you with one clean copy).
2. **Copies** every image from the legacy repo (`/Users/jagraj/Documents/Github/chancery-website/public/images/`) into `backend/media/{hotels,rooms,dining,venues,gallery,brand}/`.
3. **Creates** records for two hotels, seven room categories, five restaurants, ten event venues, eight offers, thirty-seven gallery images, a five-section FAQ, four testimonials, twenty-seven Page records, and the site-wide singleton SiteContent.

To re-seed against a custom legacy path:

```bash
python manage.py seed --source-root /path/to/old-chancery-website
```

The original `chancery-website/` repo is **never modified** — images are copied, not moved.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 — the Vite dev server proxies `/api/*` and `/media/*` to the Django server on port 8000 (see `vite.config.ts`).

### 3. Production build

```bash
cd frontend && npm run build              # static assets in frontend/dist/
cd backend  && python manage.py collectstatic && python manage.py runserver
```

For real deployment, serve `frontend/dist/` from a static host or a reverse-proxy in front of Django; serve `MEDIA_ROOT` via the same proxy.

## Managing the site (Django admin)

Visit `/admin/` and sign in. The admin is organised into two apps:

**Content**
- **Site content** (singleton) — site title, OG image, newsletter copy, social links.
- **Hotels** — name, contact, address, tagline, hero / about / banner / logo images, ratings.
- **Room categories** — with inline RoomImages (carousel).
- **Restaurants** — with inline RestaurantImages.
- **Venues** — with inline VenueImages, capacity grid, INR pricing.
- **Offers** — shared and property-specific packages.
- **Gallery images** — categorised, filterable.
- **FAQ sections** — with inline FAQ items.
- **Testimonials**.
- **Pages** — title, meta, hero, intro body. PageSection inlines for arbitrary body blocks.

**Leads**
- **Leads** — contact form submissions.
- **Newsletter subscribers**.

Every image field in the admin shows a thumbnail of the currently uploaded file so editors can see at a glance what's set where.

## API surface

All endpoints are read-only public JSON unless noted:

| Endpoint | Returns |
|---|---|
| `GET /api/site/` | SiteContent singleton |
| `GET /api/hotels/` `GET /api/hotels/<slug>/` | Hotel list / detail |
| `GET /api/rooms/?hotel=<slug>` | RoomCategory list (filterable by hotel) |
| `GET /api/restaurants/?hotel=<slug>` | Restaurant list |
| `GET /api/venues/?hotel=<slug>` | Venue list |
| `GET /api/offers/?hotel=<slug>` | Offer list (returns shared + property-specific when filtering by hotel) |
| `GET /api/gallery/?hotel=<slug>&category=<cat>` | GalleryImage list |
| `GET /api/faq/` | FAQ sections (nested items) |
| `GET /api/testimonials/` | Testimonial list |
| `GET /api/pages/<kind>/` | Brand-level page (faq, careers, catering, privacy, terms, accessibility, sitemap, home, rooms) |
| `GET /api/pages/<hotel>/<kind>/` | Hotel-scoped page (hotel_home, accommodation, dining, events, offers, gallery, contact, experience, destination) |
| `POST /api/contact/` | Submit a Lead (`name`, `email`, `phone`, `interest`, `hotel_interest`, `message`) |
| `POST /api/newsletter/` | Newsletter subscribe (`email`) |

Image URLs returned in API responses are absolute media URLs (e.g. `http://127.0.0.1:8000/media/hotels/hero.jpg`), so the frontend renders them directly.

## Booking integration

`/book?hotel=chancery|pavilion&arrive=YYYY-MM-DD&depart=YYYY-MM-DD&adult=N&child=N&rooms=N&promo=CODE` renders a brand splash and redirects to SynXis BE Designer in a new tab. URL construction lives in `frontend/src/lib/booking.ts` (chain ID 18850, hotel IDs 67686 = Chancery, 67687 = Pavilion). Never iframe SynXis.

## Sitemap

**Brand** — `/`, `/rooms`, `/book`, `/faq`, `/careers`, `/catering`, `/site-map`, `/privacy`, `/terms`, `/accessibility-statement`.

**Per hotel** (`:hotel` = `chancery` | `pavilion`) — `/:hotel`, `/:hotel/accommodation`, `/:hotel/dining`, `/:hotel/plan-your-event`, `/:hotel/special-offers`, `/:hotel/gallery`, `/:hotel/contact-us`, `/:hotel/experience`, `/:hotel/destination`.

The Navbar's "Stay / Dining / Events / Offers / Experience / Gallery" links automatically scope to the most recently active hotel (URL-driven via `HotelContext`).

## Design tokens

All colour, type and spacing live in `frontend/src/styles/globals.css` `:root`:

- **Colour** — `--c-ivory`, `--c-cream`, `--c-navy`, `--c-charcoal`, `--c-muted`, `--c-line`, `--c-gold`, `--c-gold-soft`, `--c-gold-deep`.
- **Type** — `--f-display` (Fraunces), `--f-serif` (Cormorant Garamond), `--f-sans` (Inter). Fluid scale via `clamp()`.
- **Rhythm** — `--gutter`, `--section-y`, `--max-w`, `--max-w-text`.

Override by editing this file — no code changes needed.

## Environment variables (backend)

Create `backend/.env` (optional in dev — all have sensible defaults):

```
DJANGO_SECRET_KEY=...
DJANGO_DEBUG=true
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
DEFAULT_FROM_EMAIL=Chancery Hotels <no-reply@chanceryhotels.com>
```

Contact form emails currently print to the Django console (dev). Swap `EMAIL_BACKEND` to SMTP or a service backend for production.

## What's left for production

- Configure a real `EMAIL_BACKEND` (SMTP / Resend / SendGrid).
- Set `DEBUG=false`, generate a strong `DJANGO_SECRET_KEY`, pin `DJANGO_ALLOWED_HOSTS`.
- Move SQLite → Postgres for write-heavy admin / lead workloads.
- Serve `STATIC_ROOT` and `MEDIA_ROOT` via Nginx / a CDN.
- Replace the seed-supplied Unsplash placeholder images for several Chancery event venues and a few offers by uploading owned photography through the admin.
