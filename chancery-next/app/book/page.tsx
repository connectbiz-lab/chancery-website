import { BookSplash } from '@/components/BookSplash'
import { buildSynxisUrl, type BookingParams } from '@/lib/booking'
import type { HotelSlug } from '@/lib/queries/content'

export const metadata = { robots: { index: false, follow: false } }

export default async function Book({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>
}) {
  const sp = await searchParams
  const hotel = (sp.hotel === 'chancery' ? 'chancery' : 'pavilion') as HotelSlug
  const params: BookingParams = {
    hotel,
    arrive: sp.arrive,
    depart: sp.depart,
    adult: sp.adult ? Number(sp.adult) : undefined,
    child: sp.child ? Number(sp.child) : undefined,
    rooms: sp.rooms ? Number(sp.rooms) : undefined,
    promo: sp.promo,
  }
  return <BookSplash url={buildSynxisUrl(params)} hotel={hotel} />
}
