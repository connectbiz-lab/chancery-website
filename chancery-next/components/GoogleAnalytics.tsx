import Script from 'next/script'

/**
 * Google Analytics 4 — on every page, from the root layout.
 *
 * OFF unless NEXT_PUBLIC_GA_MEASUREMENT_ID is set, and set it in PRODUCTION
 * ONLY: every Vercel preview would otherwise report into the hotels' live
 * property, and our own clicking would be indistinguishable from guests.
 *
 * App Router moves between pages with history.pushState, which GA4 counts only
 * through Enhanced Measurement's "page changes based on browser history events"
 * — on by default in a new property, but confirm it, because its absence shows
 * up as a quiet site rather than a broken tag.
 */
export function GoogleAnalytics() {
  const id = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
  if (!id) return null
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${id}`} strategy="afterInteractive" />
      <Script id="google-analytics" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${id}');`}
      </Script>
    </>
  )
}
