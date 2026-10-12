/**
 * IndexNow — the push half of indexing.
 *
 * Google decides for itself when to crawl, and its Request indexing button
 * cannot be automated (the URL Inspection API is read-only; the Indexing API
 * is for job postings and livestreams only). Bing, Yandex, Seznam and Naver
 * take a push instead: POST the changed URLs and they come and read them.
 * Bing's index is also what Copilot and ChatGPT search answer from, so the
 * push reaches the AI assistants /llms.txt is written for.
 *
 * Ownership is proved by a key the site serves at /<key>.txt (next.config.ts
 * rewrites that path to app/indexnow-key). The key lives in the environment
 * only — it is public once served, but committing it would let any fork ping
 * on the hotels' behalf.
 *
 * Imported by next.config.ts, so relative imports only and no "server-only".
 */

export const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow'

/** The configured key, or null when unset or not a shape IndexNow accepts (8–128 of a-z, A-Z, 0-9, "-"). */
export function indexNowKey(): string | null {
  const key = process.env.INDEXNOW_KEY?.trim()
  return key && /^[A-Za-z0-9-]{8,128}$/.test(key) ? key : null
}
