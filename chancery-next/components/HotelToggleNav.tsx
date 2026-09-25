'use client'
// components/HotelToggleNav.tsx — client half of the hotel pill: one segment per
// hotel, each carrying that hotel's own "C" monogram (cropped from its logo by
// CSS), the current property filled ivory. Each segment goes to that hotel's
// HOME page (/ for the Pavilion, /chancery for the Chancery).
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { hotelHomePath } from '@/lib/routes'

type Item = { slug: string; label: string; logo: string | null }

export function HotelToggleNav({ hotels }: { hotels: Item[] }) {
  const pathname = usePathname() ?? '/'
  const slugs = hotels.map((h) => h.slug)
  const current = slugs.find((s) => pathname === `/${s}` || pathname.startsWith(`/${s}/`)) ?? 'pavilion'

  return (
    <nav className="hotel-toggle" aria-label="Choose a hotel">
      {hotels.map((h) => {
        const active = h.slug === current
        return (
          <Link
            key={h.slug}
            href={hotelHomePath(h.slug)}
            className={`hotel-toggle-item ${h.slug}${active ? ' active' : ''}`}
            aria-current={active ? 'page' : undefined}
          >
            {h.logo && (
              <span className="hotel-toggle-mark" aria-hidden>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={h.logo} alt="" />
              </span>
            )}
            <span>{h.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
