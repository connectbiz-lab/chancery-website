'use client'
// components/HotelToggleNav.tsx — client half of the hotel pill: one segment per
// hotel, each carrying that hotel's own "C" monogram (cropped from its logo by
// CSS), the current property filled ivory. Switching keeps you on the same
// page — /pavilion/dining → /chancery/dining; the home (/) is the Pavilion.
import Link from 'next/link'
import { usePathname } from 'next/navigation'

type Item = { slug: string; label: string; logo: string | null }

export function HotelToggleNav({ hotels }: { hotels: Item[] }) {
  const pathname = usePathname() ?? '/'
  const slugs = hotels.map((h) => h.slug)
  const current = slugs.find((s) => pathname === `/${s}` || pathname.startsWith(`/${s}/`)) ?? 'pavilion'
  // The rest of the path after the hotel segment ('' on a hotel home or on /).
  const rest = current && pathname.startsWith(`/${current}`) ? pathname.slice(current.length + 1) : ''
  const hrefFor = (slug: string) => (slug === 'pavilion' && rest === '' ? '/' : `/${slug}${rest}`)

  return (
    <nav className="hotel-toggle" aria-label="Choose a hotel">
      {hotels.map((h) => {
        const active = h.slug === current
        return (
          <Link
            key={h.slug}
            href={hrefFor(h.slug)}
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
