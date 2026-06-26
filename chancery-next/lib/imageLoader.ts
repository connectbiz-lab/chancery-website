// Custom next/image loader for Supabase Storage images.
//
// We don't use Vercel's image optimizer (it cached stale AVIF variants with no
// clean purge). Instead every stored image has pre-generated width variants
// (`-480`, `-960`) alongside the full-size base `.webp`. This loader maps the
// width next/image asks for to the right variant URL, so the browser downloads
// an appropriately-sized file per device via a normal `srcset` — no optimizer
// involved. Widths above 960 fall through to the full-size base.

const MEDIA_MARKER = '/storage/v1/object/public/media/'
const VARIANTS = [
  { upTo: 480, suffix: '-480' },
  { upTo: 960, suffix: '-960' },
]

export default function chanceryImageLoader({ src, width }: { src: string; width: number }): string {
  // Only our Supabase media .webp files have variants; leave anything else as-is.
  if (!src.includes(MEDIA_MARKER) || !/\.webp$/i.test(src)) return src
  const variant = VARIANTS.find((v) => width <= v.upTo)
  if (!variant) return src // larger displays → the full-size base file
  return src.replace(/\.webp$/i, `${variant.suffix}.webp`)
}
