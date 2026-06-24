'use client'
import { useEffect, useMemo, useState } from 'react'
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

  // Escape closes the lightbox.
  useEffect(() => {
    if (lightbox == null) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setLightbox(null)
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
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
          className="lightbox"
          onClick={() => setLightbox(null)}
        >
          <Image
            src={mediaUrl(current.image)!}
            alt={current.alt}
            width={1200}
            height={800}
            sizes="100vw"
            style={{ width: 'auto', height: 'auto', maxWidth: 'min(1200px, 90vw)', maxHeight: '80dvh', objectFit: 'contain' }}
          />
          <p className="lightbox-caption">{current.alt}</p>
          <button
            type="button"
            className="lightbox-close"
            aria-label="Close"
            onClick={(e) => { e.stopPropagation(); setLightbox(null) }}
          >×</button>
          {lightbox! > 0 && (
            <button
              type="button"
              className="lightbox-prev"
              aria-label="Previous"
              onClick={(e) => { e.stopPropagation(); setLightbox(lightbox! - 1) }}
            >‹</button>
          )}
          {lightbox! < filtered.length - 1 && (
            <button
              type="button"
              className="lightbox-next"
              aria-label="Next"
              onClick={(e) => { e.stopPropagation(); setLightbox(lightbox! + 1) }}
            >›</button>
          )}
        </div>
      )}
    </>
  )
}
