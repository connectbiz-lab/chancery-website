'use client'
import { useState } from 'react'
import { Media } from '@/components/Media'

type Img = { image: string; alt: string }

/** Main image + thumbnail strip; clicking a thumb swaps the main image.
 *  Mirrors the legacy AccommodationPage room gallery — reuses the legacy
 *  `.room-gallery`/`.figure.aspect-43`/`.thumbs`/`.thumb` classNames so the
 *  ported page CSS styles it. Takes plain props (no server-only imports). */
export function MediaGallery({ hero, images, name, aspect = '4 / 3' }: { hero: string | null; images: Img[]; name: string; aspect?: string }) {
  const all: Img[] = images.length > 0
    ? images
    : (hero ? [{ image: hero, alt: name }] : [])
  const [active, setActive] = useState(0)
  if (!all.length) return null
  const main = all[Math.min(active, all.length - 1)]
  return (
    <div className="room-gallery">
      <div className="figure aspect-43" style={{ aspectRatio: aspect }}>
        <Media path={main.image} alt={main.alt || name} sizes="(max-width: 768px) 100vw, 60vw" />
      </div>
      {all.length > 1 && (
        <div className="thumbs">
          {all.map((img, i) => (
            <button
              key={i}
              type="button"
              className={`thumb ${i === active ? 'active' : ''}`}
              onClick={() => setActive(i)}
              aria-label={`View image ${i + 1}`}
            >
              <Media path={img.image} alt="" sizes="(max-width: 768px) 25vw, 12vw" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
