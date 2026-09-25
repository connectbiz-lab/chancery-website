import { notFound } from 'next/navigation'
import { HotelScope, type HotelSlug } from '@/lib/hotel-scope'

const VALID: HotelSlug[] = ['chancery', 'pavilion']

export default async function HotelLayout({
  children, params,
}: { children: React.ReactNode; params: Promise<{ hotel: string }> }) {
  const { hotel } = await params
  if (!VALID.includes(hotel as HotelSlug)) notFound()
  return <HotelScope active={hotel as HotelSlug}>{children}</HotelScope>
}
