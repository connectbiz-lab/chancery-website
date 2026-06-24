// components/HotelSplitHero.tsx — editorial split hero shared by every hotel
// page: framed photo left (dashed offset frame), text right (gold eyebrow,
// bold navy title, serif description). CTAs pass as children; an optional
// foot row carries meta (address / phone). Light surface, content-height,
// sits below the solid fixed navbar — no menu over the image.
import type { ReactNode } from 'react'
import { Media } from './Media'
import './HotelSplitHero.css'

export function HotelSplitHero({
  title,
  eyebrow,
  description,
  image,
  children,
  foot,
}: {
  title: string
  eyebrow: string
  description?: string | null
  image: string | null
  children?: ReactNode
  foot?: ReactNode
}) {
  return (
    <section className="hsplit" role="banner">
      <div className="container hsplit-grid">
        <div className="hsplit-media">
          <div className="hsplit-frame">
            <Media path={image} alt={title} priority sizes="(max-width: 900px) 100vw, 50vw" />
          </div>
        </div>
        <div className="hsplit-panel">
          <p className="hsplit-eyebrow">{eyebrow}</p>
          <h1 className="hsplit-title">{title}</h1>
          {description && <p className="hsplit-desc">{description}</p>}
          {children && <div className="hsplit-ctas">{children}</div>}
          {foot && <div className="hsplit-foot">{foot}</div>}
        </div>
      </div>
      {/* Gold double-diamond rule — sits between the hero and the next section. */}
      <div className="section-rule" aria-hidden="true">
        <span className="section-rule-line" />
        <span className="section-rule-gems"><i /><i /></span>
        <span className="section-rule-line" />
      </div>
    </section>
  )
}
