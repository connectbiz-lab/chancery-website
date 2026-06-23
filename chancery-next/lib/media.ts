// lib/media.ts — build a public URL for a Supabase Storage object path.
const BASE = process.env.NEXT_PUBLIC_SUPABASE_URL!

/** path like "hotels/hero.webp" -> full public URL. Empty/none -> null. */
export function mediaUrl(path: string | null | undefined): string | null {
  if (!path) return null
  return `${BASE}/storage/v1/object/public/media/${path}`
}
