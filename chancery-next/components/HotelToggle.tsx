// components/HotelToggle.tsx — the Winter/Summer-style pill that switches between
// the two properties, shown top-left of every hotel-page hero. Server half:
// loads the hotels (React-cached, so it costs nothing extra on a page that
// already called getHotels) and hands them to the client pill, which needs the
// current pathname to link to the SAME page on the other hotel.
import { getHotels } from '@/lib/queries/content'
import { mediaUrl } from '@/lib/media'
import { HotelToggleNav } from './HotelToggleNav'
import './HotelToggle.css'

export async function HotelToggle() {
  const hotels = await getHotels()
  return (
    <HotelToggleNav
      hotels={hotels.map((h) => ({ slug: h.slug, label: h.short_name ?? h.name, logo: mediaUrl(h.logo) }))}
    />
  )
}
