'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import { mediaUrl } from '@/lib/media'

type Img = { image: string; alt: string; category: string }

const LABELS: Record<string, string> = {
  hotel: 'Hotel', lobby: 'Lobby', rooms: 'Rooms', dining: 'Dining', events: 'Events',
}

/** Gallery grid with category filter tabs + a lightbox (open on click, prev/next,
 *  Escape / click-outside to close). Mirrors the legacy GalleryPage interactivity. */
export function GalleryLightbox({ images }: { images: Img[] }) {
  const [filter, setFilter] = useState<string>('all')
  const [lightbox, setLightbox] = useState<number | null>(null)

  const categories = useMemo(() => {
    const set = new Set<string>()
    images.forEach((g) => set.add(g.category))
    return ['all', ...Array.from(set)]
  }, [images])

  const filtered = useMemo(
    () => images.filter((g) => filter === 'all' || g.category === filter),
    [images, filter],
  )

  // Reset the lightbox if the filter changes the set under it — adjusted during
  // render on filter change rather than in an effect.
  const [lastFilter, setLastFilter] = useState(filter)
  if (filter !== lastFilter) {
    setLastFilter(filter)
    setLightbox(null)
  }

  // Escape closes; arrow keys page through the set.
  useEffect(() => {
    if (lightbox == null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox(null)
      else if (e.key === 'ArrowLeft') setLightbox((i) => (i! > 0 ? i! - 1 : i))
      else if (e.key === 'ArrowRight') setLightbox((i) => (i! < filtered.length - 1 ? i! + 1 : i))
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [lightbox, filtered.length])

  // Body scroll lock while the lightbox is open.
  useEffect(() => {
    if (lightbox == null) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [lightbox])

  // Keep the active thumbnail centred in the strip as you navigate.
  const activeThumb = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    activeThumb.current?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' })
  }, [lightbox])

  const current = lightbox != null ? filtered[lightbox] : null

  return (
    <>
      <div className="gallery-filters">
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            className={`gallery-tab ${filter === c ? 'active' : ''}`}
            onClick={() => setFilter(c)}
          >
            {c === 'all' ? 'All' : LABELS[c] ?? c}
          </button>
        ))}
      </div>
      <div className="gallery-grid">
        {filtered.map((g, i) => (
          <button
            key={`${g.image}-${i}`}
            type="button"
            className="gallery-item figure"
            onClick={() => setLightbox(i)}
            aria-label={g.alt}
          >
            <Image src={mediaUrl(g.image)!} alt={g.alt} fill sizes="(max-width: 768px) 50vw, 33vw" style={{ objectFit: 'cover' }} />
          </button>
        ))}
      </div>

      {current && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Image gallery"
          className="lightbox"
          onClick={() => setLightbox(null)}
        >
          <button
            type="button"
            className="lightbox-close"
            aria-label="Close gallery"
            onClick={(e) => { e.stopPropagation(); setLightbox(null) }}
          >
            <span>Close</span>
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>

          {lightbox! > 0 && (
            <button
              type="button"
              className="lightbox-arrow prev"
              aria-label="Previous image"
              onClick={(e) => { e.stopPropagation(); setLightbox(lightbox! - 1) }}
            >
              <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.4">
                <path d="M15 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
          {lightbox! < filtered.length - 1 && (
            <button
              type="button"
              className="lightbox-arrow next"
              aria-label="Next image"
              onClick={(e) => { e.stopPropagation(); setLightbox(lightbox! + 1) }}
            >
              <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.4">
                <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}

          <div className="lightbox-stage" onClick={(e) => e.stopPropagation()}>
            <Image
              key={current.image}
              src={mediaUrl(current.image)!}
              alt={current.alt}
              width={1200}
              height={800}
              sizes="(max-width: 900px) 92vw, 70vw"
              style={{ width: 'auto', height: 'auto', maxWidth: 'min(900px, 92vw)', maxHeight: '64dvh', objectFit: 'contain' }}
            />
          </div>

          <div className="lightbox-thumbs" onClick={(e) => e.stopPropagation()}>
            {filtered.map((g, i) => (
              <button
                key={`${g.image}-${i}`}
                ref={i === lightbox ? activeThumb : undefined}
                type="button"
                className={`lightbox-thumb ${i === lightbox ? 'active' : ''}`}
                aria-label={g.alt}
                aria-current={i === lightbox ? 'true' : undefined}
                onClick={() => setLightbox(i)}
              >
                <Image src={mediaUrl(g.image)!} alt="" fill sizes="130px" style={{ objectFit: 'cover' }} />
              </button>
            ))}
          </div>

          <p className="lightbox-counter">{lightbox! + 1} / {filtered.length}</p>
        </div>
      )}
    </>
  )
}
