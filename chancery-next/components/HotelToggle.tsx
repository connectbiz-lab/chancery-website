// components/HotelToggle.tsx — the Winter/Summer-style pill that switches between
// the two properties, shown top-left of every hotel-page hero. Server half:
// loads the hotels (React-cached, so it costs nothing extra on a page that
// already called getHotels) and hands them to the client pill, which needs the
// current pathname to mark which hotel is active.
import { getHotels } from '@/lib/queries/content'
import { HotelToggleNav } from './HotelToggleNav'
import './HotelToggle.css'

// Each hotel's "C" monogram as its own tiny file (≈2–3 KB, in /public/brand) —
// cropped once from the logo, so the pill no longer downloads both full logos
// (51 KB + 67 KB) on every page just to show two 20px marks.
const MARKS: Record<string, string> = {
  pavilion: '/brand/pavilion-mark.webp',
  chancery: '/brand/chancery-mark.webp',
}

export async function HotelToggle() {
  const hotels = await getHotels()
  return (
    <HotelToggleNav
      hotels={hotels.map((h) => ({ slug: h.slug, label: h.short_name ?? h.name, logo: MARKS[h.slug] ?? null }))}
    />
  )
}
