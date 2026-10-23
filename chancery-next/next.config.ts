import type { NextConfig } from 'next'
import { indexNowKey } from './lib/indexnow'

/**
 * Legacy URL map — every address the WordPress site (chanceryhotels.com)
 * publishes, forwarded to the nearest page of this site with a permanent 308.
 *
 * Source: chanceryhotels.com/wp-sitemap.xml, read 12-10-2026 (208 URLs across
 * 37 sub-sitemaps). A 404 at launch loses the visitor AND whatever ranking the
 * old link had earned, so before DNS flips add anything else Search Console →
 * Pages → each reason's Examples, or analytics landing pages, turn up.
 *
 * Search Console will list these under "Page with redirect" for good. That is
 * correct, not an error.
 *
 * Paths the new site already serves under the same name (/careers, /catering,
 * /site-map, /chancery/dining, /pavilion/gallery …) need no entry: Next's own
 * trailing-slash redirect takes /chancery/dining/ to /chancery/dining.
 *
 * `:slug*` matches the bare path, the trailing slash and anything under it.
 * Order matters: a specific venue line must come before its catch-all.
 */
const LEGACY: Array<[source: string, destination: string]> = [
  // ── Group pages ──────────────────────────────────────────────────────────
  ['/index.php', '/'],
  ['/index.html', '/'],
  ['/home/:slug*', '/'],
  ['/about-us/:slug*', '/about'],
  ['/reach-us/:slug*', '/pavilion/contact-us'],
  ['/privacy-policy/:slug*', '/privacy'],
  ['/terms-conditions/:slug*', '/terms'],
  ['/hello-world/:slug*', '/'],
  ['/author/:slug*', '/'],
  ['/category/:slug*', '/'],

  // ── Experience → the hotel's destination page / home ───────────────────
  ['/chancery/experience/:slug*', '/chancery/destination'],
  ['/pavilion/experience/:slug*', '/pavilion/destination'],
  ['/ch_experience/:slug*', '/chancery'], // japanese-spa — the spa is on the hotel home
  ['/pa_experience/:slug*', '/'], // cake-shop, galleria, gym, spa, swimming-pool — the Pavilion home's amenities

  // ── Rooms ────────────────────────────────────────────────────────────────
  ['/ch_accomodation/:slug*', '/chancery/accommodation'],
  ['/pa_accomodation/:slug*', '/pavilion/accommodation'],

  // ── Dining (no per-restaurant pages; each hotel's dining page lists them) ─
  ['/ch_dining/:slug*', '/chancery/dining'], // matsuri, south-parade
  ['/pa_dining/:slug*', '/pavilion/dining'], // alchemy, ithaca, the-lounge
  ['/dining/matsuri/:slug*', '/chancery/dining'],
  ['/dining/south-parade/:slug*', '/chancery/dining'],
  // alchemy, ithaca, the-lounge; retired outlets peppers and tingling-spices
  // land on the flagship's dining page; /dining/ itself (the group index) too.
  ['/dining/:slug*', '/pavilion/dining'],

  // ── Offers ───────────────────────────────────────────────────────────────
  ['/ch_offers/:slug*', '/chancery/special-offers'],
  ['/pa_offers/:slug*', '/pavilion/special-offers'],
  // The un-prefixed offers were the Pavilion's (same four slugs as pa_offers).
  ['/offers/:slug*', '/pavilion/special-offers'],
  ['/offer_category/:slug*', '/pavilion/special-offers'],

  // ── Events — venue-level where a venue page matches ────────────────────
  ['/ch_plan_your_event/lavelle/:slug*', '/chancery/plan-your-event/the-lavelle-hall'],
  ['/ch_plan_your_event/walton/:slug*', '/chancery/plan-your-event/walton-hall'],
  ['/ch_plan_your_event/colours/:slug*', '/chancery/plan-your-event/colors-hall'],
  ['/ch_plan_your_event/the-board-room/:slug*', '/chancery/plan-your-event/chancery-boardroom'],
  ['/ch_plan_your_event/business-center/:slug*', '/chancery/plan-your-event/business-centre'],
  ['/ch_plan_your_event/:slug*', '/chancery/plan-your-event'],
  // The un-prefixed plan_your_event posts are the Chancery Hotel's venues.
  ['/plan_your_event/lavelle/:slug*', '/chancery/plan-your-event/the-lavelle-hall'],
  ['/plan_your_event/walton/:slug*', '/chancery/plan-your-event/walton-hall'],
  ['/plan_your_event/colours/:slug*', '/chancery/plan-your-event/colors-hall'],
  ['/plan_your_event/the-board-room/:slug*', '/chancery/plan-your-event/chancery-boardroom'],
  ['/plan_your_event/business-center/:slug*', '/chancery/plan-your-event/business-centre'],
  ['/plan_your_event/:slug*', '/chancery/plan-your-event'],
  ['/pa_plan_your_event/the-grand-ball-room/:slug*', '/pavilion/plan-your-event/the-grand-ball-room'],
  ['/pa_plan_your_event/sigma/:slug*', '/pavilion/plan-your-event/sigma'],
  ['/pa_plan_your_event/esquire/:slug*', '/pavilion/plan-your-event/esquire'],
  ['/pa_plan_your_event/indian-affair/:slug*', '/pavilion/plan-your-event/indian-affair'],
  // Poolside Banqueting is now part of Indian Affair (F&B team, Oct 2026).
  ['/pa_plan_your_event/poolside-banqueting/:slug*', '/pavilion/plan-your-event/indian-affair'],
  ['/pa_plan_your_event/board-room/:slug*', '/pavilion/plan-your-event/pavilion-board-room'],
  ['/pa_plan_your_event/:slug*', '/pavilion/plan-your-event'],
  ['/plan-your-event/:slug*', '/pavilion/plan-your-event'],
  ['/meetings_and_events/:slug*', '/pavilion/plan-your-event'], // corporate-events, meetings, weddings

  // ── Gallery ──────────────────────────────────────────────────────────────
  ['/tch_gallery/:slug*', '/chancery/gallery'],
  ['/tcp_gallery/:slug*', '/pavilion/gallery'],
  ['/gallery/:slug*', '/pavilion/gallery'],
  ['/gallery_category/:slug*', '/pavilion/gallery'],

  // ── Destination ──────────────────────────────────────────────────────────
  ['/tch_destination/:slug*', '/chancery/destination'],
  ['/tcp_destination/:slug*', '/pavilion/destination'],

  // ── "Why choose us" cards and testimonials → the hotel home ────────────
  ['/ch_why_choose_us/:slug*', '/chancery'],
  ['/pa_why_choose_us/:slug*', '/'],
  ['/why_choose_us/:slug*', '/'],
  ['/ch_testimonials/:slug*', '/chancery'],
  ['/pa_testimonials/:slug*', '/'],
]

/**
 * OPEN QUESTION for the hotel — not wired in.
 *
 * The Chancery Native (Belgaum) has 50 URLs on the old site and no page on the
 * new one: /native/* plus its custom posts na_* (rooms, dining, offers, events,
 * testimonials, why-choose-us), tcn_destination/* and tcn_gallery/*. Forward
 * them to the group home, or keep a Native site live elsewhere and forward
 * there? Until the hotel decides, these paths 404 at launch. To forward them,
 * set NATIVE_DESTINATION.
 */
const NATIVE_DESTINATION: string | null = null
const NATIVE = [
  '/native/:slug*', '/na_accomodation/:slug*', '/na_dining/:slug*', '/na_offers/:slug*',
  '/na_plan_your_event/:slug*', '/na_testimonials/:slug*', '/na_why_choose_us/:slug*',
  '/tcn_destination/:slug*', '/tcn_gallery/:slug*',
]

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // The Pavilion is the home page; its old hotel-home URL folds into /.
      { source: '/pavilion', destination: '/', permanent: true },
      ...LEGACY.map(([source, destination]) => ({ source, destination, permanent: true })),
      ...(NATIVE_DESTINATION
        ? NATIVE.map((source) => ({ source, destination: NATIVE_DESTINATION, permanent: true }))
        : []),
    ]
  },

  /*
   * The IndexNow key file, at the address IndexNow expects: /<key>.txt. The
   * key comes from the environment (lib/indexnow.ts), so the path is only
   * known at build — a key changed in Vercel takes effect on the next deploy.
   * No key, no rewrite, and the path 404s like any other.
   */
  async rewrites() {
    const key = indexNowKey()
    return key ? [{ source: `/${key}.txt`, destination: '/indexnow-key' }] : []
  },

  images: {
    // We bypass Vercel's optimizer (it cached stale AVIF variants per source URL
    // with no clean purge, so heroes showed the previous photo in AVIF-requesting
    // browsers). Instead a custom loader serves pre-generated width variants
    // (`-480` / `-960` / full-size base) straight from Supabase Storage, giving a
    // real responsive `srcset` with no optimizer in the path — so the stale-AVIF
    // failure mode can't recur. See lib/imageLoader.ts.
    loader: 'custom',
    loaderFile: './lib/imageLoader.ts',
    // Candidate widths the loader maps onto variants: ≤480 → -480, ≤960 → -960,
    // anything larger → the full-size base file.
    deviceSizes: [480, 960, 1920],
    imageSizes: [256, 480],
  },
}

export default nextConfig
