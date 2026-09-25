// app/(main)/page.tsx — the home screen is The Chancery Pavilion's page. The
// group page (both hotels, story, awards) moved to /about. This is a thin
// wrapper around the [hotel] route so the two never drift apart.
import HotelHome, { generateMetadata as hotelMetadata } from './[hotel]/page'
import type { Metadata } from 'next'

export const revalidate = 3600

const PAVILION = Promise.resolve({ hotel: 'pavilion' })

export async function generateMetadata(): Promise<Metadata> {
  // Same title/description/OG as /pavilion, but canonical to the home URL.
  const meta = await hotelMetadata({ params: PAVILION })
  const url = (meta.alternates?.canonical as string | undefined)?.replace(/\/pavilion$/, '/')
  return {
    ...meta,
    alternates: { canonical: url },
    openGraph: meta.openGraph ? { ...meta.openGraph, url } : undefined,
  }
}

export default function Home() {
  return <HotelHome params={PAVILION} />
}
