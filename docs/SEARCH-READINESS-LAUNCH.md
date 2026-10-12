# Chancery Hotels website — search readiness before go-live (SEO · AEO · GEO · AIO)

Pre-launch checklist for the new site in `chancery-next/` (Next.js on Vercel, Supabase CMS), written 12-10-2026 from a read-only audit of the code and the 09-10 cloud backup. It applies the Iksha house standard **website-search-readiness** (`~/.claude/skills/website-search-readiness/SKILL.md`). Every item is something we fixed the hard way on gunpowdersocial.com.au.

`frontend/` and `backend/` are dead leftovers of the old Django/Vite stack. Only `chancery-next/` ships.

**Legend:** 🔴 blocks launch · 🟠 fix before launch · 🟡 first week after launch · ❓ needs a decision or fact from the hotel

---

## 🔴 1. One canonical host (decision ❓)
- **Now:** `lib/seo.ts:6` defaults to `https://www.chanceryhotels.com`, and `NEXT_PUBLIC_SITE_URL` isn't set. The live WordPress site serves the **bare** `chanceryhotels.com`, and `www` 301s to bare.
- **Do:**
  - Pick one host (recommended: `https://www.chanceryhotels.com`) and set `NEXT_PUBLIC_SITE_URL` in Vercel (Production).
  - Point both hosts at Vercel, so the other host and `http://` 308 to the chosen one.
  - Check with `curl -s -o /dev/null -w "%{http_code} %{redirect_url}"` on all four spellings.
- **Then:** every public link we control must use that host:
  - both Google Business listings' website fields
  - Instagram, Facebook and Tripadvisor bios
  - booking-engine back-links and email signatures

## 🔴 2. Forward every old address (the biggest gap)
- **Now:** `next.config.ts` only redirects `/pavilion → /`. The live WordPress sitemap (`chanceryhotels.com/wp-sitemap.xml`) lists **130+ URLs**, and they'll all 404 at launch.
- **Do:** add one commented `LEGACY` array (source → destination, 308) in `next.config.ts`, covering at least:
  - `/about-us/` → `/about`, `/reach-us/` → contact, `/privacy-policy/` → `/privacy`, `/terms-conditions/` → `/terms`, `/home/` → `/`
  - `/offers/*`, `/offer_category/*` → each hotel's `special-offers`
  - `/dining/{alchemy,ithaca,the-lounge}/` → `/pavilion/dining`; `/dining/{matsuri,…}/` → `/chancery/dining`; retired outlets (`peppers`, `tingling-spices`) → the nearest dining page
  - `/plan-your-event/`, `/meetings_and_events/*` → each hotel's `plan-your-event` (venue-level where a venue matches)
  - `/gallery/`, `/gallery_category/*` → each hotel's `gallery`
  - `/chancery/experience/` → `/chancery/destination`
  - every `/ch_*`, `/pa_*`, `/na_*` custom-post URL → the matching page
  - `/native/*` ❓ (a third property not on the new site: forward to the brand home, or keep it live elsewhere?)
  - `/hello-world/`, `/author/*`, `/category/*` → `/`
- **Before DNS flips:** export the full list (WordPress sitemap, Search Console → Pages → each reason's **Examples**, analytics landing pages), map every URL, and keep the list in the repo.
- **Tell the client in advance:** Search Console will show these as **"Page with redirect"** permanently. That's correct, not an error.

## 🟠 3. Sitemap and robots
- **`app/sitemap.ts` sets `lastModified = new Date()`** on every URL, so the date changes on every build and Google learns to ignore it. Use the CMS row's `updated_at` (or a per-route content date), and drop the blanket `changeFrequency: weekly`.
- **`app/robots.ts`:** name the AI crawlers explicitly, with the same allow/disallow as `*`: GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-SearchBot, Claude-User, PerplexityBot, Perplexity-User, Google-Extended, Applebot-Extended. Check each gets a 200 on the home page; Vercel and WAF bot rules can block them silently.
- Submit the sitemap in Search Console on launch day.

## 🟠 4. Answers and entity (AEO + GEO)
- **`/llms.txt` is missing.** Add `app/llms.txt/route.ts`: Markdown for each hotel, built from the same CMS data the pages render, never a hand-copied file. Include:
  - name, address, phone, check-in/out, restaurants, venues with **confirmed** capacities, booking link, FAQs, official profiles
  - revalidate hourly
- **Remove the self-served `aggregateRating`** on the Hotel schema. Google ignores it, and the rich-results check **fails the page**. Both hotels also carry the identical `4.4 / 3200`, which looks like a placeholder ❓. Stars belong on the Google listings.
- **FAQPage schema:** `/faq` has about 13 questions per hotel (`components/FaqAccordion.tsx`). Emit FAQPage JSON-LD from the same data, and add 3–5 questions to each hotel home and venue page.
- **Venue pages have no schema.** Add an `EventVenue` or `MeetingRoom` inside `Hotel.containsPlace`, with confirmed capacity only, and give each restaurant its `Restaurant` entry with menu and hours.
- **`sameAs`:**
  - Organization lists Instagram, Facebook and Tripadvisor; each Hotel lists only Tripadvisor.
  - Add each hotel's **Google listing Maps link** (`maps.google.com/?cid=…`) and every official profile.
  - Add `geo` coordinates from the Google listing (read them from Google Places by place id; never type them in).
- **NAP drift, fix before launch:**
  - The schema forces `addressLocality: 'Bengaluru'` and puts the whole string into `streetAddress`, while the DB says "Bangalore 560 025/001". Split it into proper `PostalAddress` fields, matching each Google listing exactly.
  - `/about` claims **4.5 / 5** while the schema says 4.4. Remove both claims or source them live.
  - `components/SimpleContent.tsx` hard-codes the Pavilion phone and email. Read them from the CMS.
  - The phones are Pavilion `+91 80 4141 4141` and Chancery `+91 80 2227 6767`. They must match the listings, footer, schema and llms.txt exactly.
- **Organization** has no address or phone. Add the head-office details or link the two Hotels as `subOrganization`.
- `priceRange '₹₹₹'` is hard-coded ❓. Confirm or remove it.

## 🟠 5. Titles and descriptions
- The code fallbacks (`'Dining'`, `'Accommodation'`, `'Gallery'`…) are **the same for both hotels**. Without per-hotel DB values, the two hotels ship duplicate titles. Make each fallback include the hotel name and area, e.g. "Dining — The Chancery Pavilion, Residency Road".
- An empty DB `meta_description` currently means **no description**. Fall back to a generated one per page.
- Check the `%s | Chancery Hotels` template isn't doubling the hotel name.

## 🟠 6. Facts that must be confirmed, not invented ❓
These are hard-coded or held in the CMS without a source. Each must be confirmed by the hotel or removed before launch, because AI engines will repeat them:
- `/about/page.tsx:242-260`: 26,800 sq ft, 2,500+ events a year, 2L+ covers, 349 rooms (223+126), 25+ years, **94+% occupancy**, 4.5 rating, 600+ staff
- Root description: "since 2000"
- `lib/catering.ts`: 50–10,000+ guests
- `lib/awards.ts`: award years
- `lib/amenities.ts`: "24/7 In-Room Dining"
- Venue capacities and prices: the pending sync nulls the INR prices and changes capacities. **Lavelle Hall says 250 in its description but `guests_max` is 200.**
- Poolside Banqueting: the sync says it's "part of Indian Affair", but the row still exists.
- **Several `supabase/pending-cloud-sync/*.json` files (28-09 → 09-10) look unapplied to the cloud DB.** Apply and verify them before launch.

## 🟠 7. Internal links
Every sitemap page should be linked from at least two pages a guest actually uses (nav, buttons): each venue page from its hotel's events page and the hotel home, and each restaurant from its hotel's dining page.

## 🟠 8. Measurement, connected before launch
- **Nothing is connected today:** no GA4/gtag, no Search Console verification, no IndexNow, no Vercel Analytics.
- **GA4:** one property with the measurement id on every page.
- **Search Console:** a **domain property** for `chanceryhotels.com`; it covers both hosts and http/https. Bing Webmaster is optional.
- **Chancery360:** connect GSC and GA4 in the app, and turn on the Website tab's nightly site audit, Pages in Google, visits sent by AI assistants, and the change log, as on Gunpowder360.

## 🟠 9. IndexNow (Bing → Copilot and ChatGPT search)
Copy the setup from the gunpowder-website repo:
- `INDEXNOW_KEY`, readable, served at `/<key>.txt`
- `/api/indexnow` guarded by `INDEXNOW_PING_SECRET`
- `.github/workflows/indexnow.yml`, triggered on `deployment_status` **and** `workflow_dispatch`

Traps:
- a Vercel dashboard redeploy doesn't fire the workflow, so run it by hand;
- env vars apply only to a new deploy;
- generate the secret once and pipe it to `gh secret set` and `vercel env add` together, without ever printing it.

## 🟡 10. Performance
- Already good: `next/font` with swap, and images through `components/Media.tsx` (next/image with Supabase variants).
- About 10 raw `<img>` tags (Navbar, Footer, HotelToggleNav, `[hotel]/page`, awards, about, catering): move them to `Media`.
- Three font families: drop one if the design allows.
- The hero `<video preload="auto">`: use `preload="metadata"` plus a poster image.

## 🟡 After launch
- **Request indexing** (Search Console → URL inspection) for both hotel homes, accommodation, dining and each venue. It can't be automated.
- Read every "not indexed" reason's **Examples** before fixing anything:
  - redirects and alternate-canonical: by design
  - 404: add it to `LEGACY`
  - discovered/crawled but not indexed: add links and request indexing
- Watch the Pages report's "Last update" date; it lags about a week.
- AIO: let Iksha propose titles and descriptions from real Search Console queries in Chancery360; a person approves; the site reads the approved copy live. Never publish an unconfirmed fact.

## Done means
Each of these has been **checked live**, not just in the code:
- [ ] all host spellings 308 to one host
- [ ] every old WordPress URL 308s to a real page (0 × 404 in a crawl of the old sitemap)
- [ ] `/robots.txt` names the AI crawlers, and each gets a 200
- [ ] `/sitemap.xml` dates are stable across two deploys
- [ ] `/llms.txt` matches the pages
- [ ] the Rich Results test passes on both hotel homes (no aggregateRating)
- [ ] NAP is identical on site, schema, llms.txt and both Google listings
- [ ] GA4 and Search Console are receiving data
- [ ] the IndexNow run reports `{"indexnow":200}`
- [ ] the Chancery360 Website tab shows the first audit
