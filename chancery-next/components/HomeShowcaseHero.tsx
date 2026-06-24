// components/HomeShowcaseHero.tsx — editorial group-home hero, two hotels side by
// side (both visible, no scroll), interlocked like the reference:
//   Pavilion : eyebrow + NAME on top  →  photo  →  address at the foot
//   Chancery : photo on top  →  NAME  →  address
// Chancery's ivory/navy/gold palette, bold-sans names.
import Link from 'next/link'
import { Media } from './Media'
import './HomeShowcaseHero.css'

interface Hotel {
  slug: string
  name: string
  address: string | null
}

const EYEBROW: Record<string, string> = {
  pavilion: 'Flagship · Residency Road',
  chancery: 'Heritage · Lavelle Road',
}

function HotelBlock({ hotel, image, imageFirst }: { hotel: Hotel; image: string | null; imageFirst: boolean }) {
  const head = (
    <div className="hb-head" key="head">
      <p className="hb-eyebrow">{EYEBROW[hotel.slug] ?? 'Bengaluru'}</p>
      <h2 className="hb-name">{hotel.name}</h2>
    </div>
  )
  const figure = (
    <Link href={`/${hotel.slug}`} className="hb-figure" aria-label={hotel.name} key="figure">
      <span className="hb-frame" aria-hidden="true" />
      <Media path={image} alt={hotel.name} priority sizes="(max-width: 760px) 92vw, 46vw" />
    </Link>
  )
  return (
    <article className="hb">
      {imageFirst ? [figure, head] : [head, figure]}
      <div className="hb-foot">
        {hotel.address && <p className="hb-addr">{hotel.address}</p>}
        <Link href={`/${hotel.slug}`} className="hb-cta">
          Explore the hotel <span aria-hidden="true">→</span>
        </Link>
      </div>
    </article>
  )
}

export function HomeShowcaseHero({
  pavilion,
  pavilionImage,
  chancery,
  chanceryImage,
}: {
  pavilion: Hotel
  pavilionImage: string | null
  chancery: Hotel
  chanceryImage: string | null
}) {
  return (
    <section className="showcase" role="banner">
      <div className="container">
        <div className="showcase-grid">
          {/* Pavilion: name on top, photo pushed down, address at the foot. */}
          <HotelBlock hotel={pavilion} image={pavilionImage} imageFirst={false} />
          {/* Chancery: photo on top, name below. */}
          <HotelBlock hotel={chancery} image={chanceryImage} imageFirst />
        </div>
      </div>
    </section>
  )
}
