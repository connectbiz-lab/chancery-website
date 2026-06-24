'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  HotelsIcon,
  StayIcon,
  DiningIcon,
  EventsIcon,
  OffersIcon,
  GalleryIcon,
  ContactIcon,
} from './NavIcons'
import './HeroIconNav.css'

type HotelSlug = 'chancery' | 'pavilion'

/**
 * Claridges-style icon strip rendered at the bottom of the hero.
 *
 * - `scope` controls which hotel the inner shortcuts route to (Pavilion by
 *   default on brand pages; the active hotel on /chancery + /pavilion).
 * - "Our Hotels" always goes back to the homepage's "Two addresses, one
 *   promise" picker. On the homepage we use a bare `#hotels` anchor so the
 *   browser's native smooth-scroll handles it; from any other page we use
 *   `/#hotels`.
 */
interface HeroIconNavProps {
  scope?: HotelSlug
}

export function HeroIconNav({ scope = 'pavilion' }: HeroIconNavProps) {
  const pathname = usePathname()
  const onHome = pathname === '/'
  const hotelsHref = onHome ? '#hotels' : '/#hotels'

  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const items = [
    { Icon: HotelsIcon, label: 'Our Hotels', to: hotelsHref },
    { Icon: StayIcon, label: 'Stay', to: `/${scope}/accommodation` },
    { Icon: DiningIcon, label: 'Dining', to: `/${scope}/dining` },
    { Icon: EventsIcon, label: 'Events', to: `/${scope}/plan-your-event` },
    { Icon: OffersIcon, label: 'Offers', to: `/${scope}/special-offers` },
    { Icon: GalleryIcon, label: 'Gallery', to: `/${scope}/gallery` },
    { Icon: ContactIcon, label: 'Contact', to: `/${scope}/contact-us` },
  ]

  return (
    <ul
      className={`hero-icon-nav ${scrolled ? 'is-hidden' : ''}`}
      aria-label="Quick navigation"
      aria-hidden={scrolled}
    >
      {items.map(({ Icon, label, to }) => {
        const glyph = <span className="hero-icon-nav__glyph"><Icon size={30} /></span>
        const text = <span className="hero-icon-nav__label">{label}</span>
        const isBareHash = to.startsWith('#')
        return (
          <li key={label}>
            {isBareHash ? (
              <a href={to}>{glyph}{text}</a>
            ) : (
              <Link href={to}>{glyph}{text}</Link>
            )}
          </li>
        )
      })}
    </ul>
  )
}
