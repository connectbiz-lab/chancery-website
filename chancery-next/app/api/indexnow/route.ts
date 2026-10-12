import { timingSafeEqual } from 'node:crypto'
import sitemap from '@/app/sitemap'
import { INDEXNOW_ENDPOINT, indexNowKey } from '@/lib/indexnow'
import { SITE_URL } from '@/lib/seo'

export const dynamic = 'force-dynamic'

/**
 * POST /api/indexnow — submit the sitemap's pages to IndexNow.
 *
 * Called once per production deploy by .github/workflows/indexnow.yml, after
 * Vercel reports the deploy live, so the engines read the new pages and not
 * the old ones. The list is the sitemap's own, so what is pushed and what is
 * advertised can never differ.
 *
 * Guarded by INDEXNOW_PING_SECRET: open, anyone could make the site hammer
 * IndexNow and earn it a 429 when a real change needs to go through.
 * Production only — a preview's host is not the one the key vouches for.
 */
export async function POST(request: Request) {
  const secret = process.env.INDEXNOW_PING_SECRET
  if (!secret || !matches(request.headers.get('authorization') ?? '', `Bearer ${secret}`)) {
    return Response.json({ error: 'unauthorised' }, { status: 401 })
  }
  const key = indexNowKey()
  if (!key) return Response.json({ skipped: 'INDEXNOW_KEY is not set' }, { status: 503 })
  if (process.env.VERCEL_ENV !== 'production') {
    return Response.json({ skipped: 'not the production deployment' }, { status: 409 })
  }

  const urlList = (await sitemap()).map((entry) => entry.url)
  const res = await fetch(INDEXNOW_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host: new URL(SITE_URL).host, key, keyLocation: `${SITE_URL}/${key}.txt`, urlList }),
    cache: 'no-store',
  })
  // 200 accepted; 202 accepted while IndexNow verifies the key. Anything else
  // (400 bad request, 403 key not found, 422 URL not on this host, 429 too
  // many) fails the call, so the workflow run goes red rather than green.
  const accepted = res.status === 200 || res.status === 202
  return Response.json({ indexnow: res.status, submitted: urlList.length, urls: urlList }, { status: accepted ? 200 : 502 })
}

/** Constant-time comparison, so the secret cannot be guessed a character at a time. */
function matches(given: string, expected: string): boolean {
  const a = Buffer.from(given)
  const b = Buffer.from(expected)
  return a.length === b.length && timingSafeEqual(a, b)
}
