import { indexNowKey } from '@/lib/indexnow'

/**
 * The IndexNow key file. Served at /<key>.txt through a rewrite in
 * next.config.ts — the address IndexNow fetches to confirm a ping really came
 * from this site. 404 while no key is configured, so the rewrite and this
 * route can never disagree into a 200 with an empty body.
 */
export function GET() {
  const key = indexNowKey()
  if (!key) return new Response('Not found', { status: 404 })
  return new Response(key, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}
