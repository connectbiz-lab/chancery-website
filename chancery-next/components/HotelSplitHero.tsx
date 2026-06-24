// components/HotelSplitHero.tsx — editorial split hero for a hotel landing page.
// Left: framed building photo on a light panel. Right: dark navy panel with the
// location eyebrow, the hotel name set big and bold, a description, CTAs and a
// foot detail row. Sits below the solid fixed navbar (no menu over the image).
import Link from 'next/link'
import { BookButton } from './BookButton'
import { Media } from './Media'
import type { HotelSlug } from '@/lib/queries/content'
import './HotelSplitHero.css'

export function HotelSplitHero({
  slug,
  name,
  eyebrow,
  description,
  image,
  address,
  phone,
}: {
  slug: HotelSlug
  name: string
  eyebrow: string
  description: string
  image: string | null
  address: string | null
  phone: string | null
}) {
  return (
    <section className="hsplit" role="banner">
      <div className="container hsplit-grid">
        <div className="hsplit-media">
          <div className="hsplit-frame">
            <Media path={image} alt={name} priority sizes="(max-width: 900px) 100vw, 50vw" />
          </div>
        </div>
        <div className="hsplit-panel">
          <p className="hsplit-eyebrow">{eyebrow}</p>
          <h1 className="hsplit-title">{name}</h1>
          {description && <p className="hsplit-desc">{description}</p>}
          <div className="hsplit-ctas">
            <BookButton hotel={slug} className="btn gold">Book your stay</BookButton>
            <a href="#rooms" className="btn ghost-dark">Explore rooms</a>
          </div>
          <div className="hsplit-foot">
            {address && <span>{address}</span>}
            {phone && <a href={`tel:${phone.replace(/\s+/g, '')}`}>{phone}</a>}
          </div>
        </div>
      </div>
    </section>
  )
}
