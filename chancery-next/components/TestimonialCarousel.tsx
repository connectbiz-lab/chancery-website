'use client'
import { useEffect, useRef, useState } from 'react'

type T = { quote: string; name: string; title: string; rating: number }

export function TestimonialCarousel({ testimonials }: { testimonials: T[] }) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)
  const list = testimonials.slice(0, 5)

  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    const onScroll = () => {
      const i = Math.round(track.scrollLeft / track.clientWidth)
      setActive(i)
    }
    track.addEventListener('scroll', onScroll, { passive: true })
    return () => track.removeEventListener('scroll', onScroll)
  }, [])

  function goTo(i: number) {
    const track = trackRef.current
    if (!track) return
    track.scrollTo({ left: i * track.clientWidth, behavior: 'smooth' })
  }

  return (
    <div className="testimonial-carousel">
      <div
        ref={trackRef}
        className="testimonial-track"
        aria-roledescription="carousel"
        aria-label="Guest testimonials"
      >
        {list.map((t, i) => (
          <figure
            key={i}
            className="testimonial"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${list.length}`}
          >
            <blockquote className="italic-quote">&ldquo;{t.quote}&rdquo;</blockquote>
            <figcaption>
              <span className="t-name">{t.name}</span>
              <span className="t-title">{t.title}</span>
            </figcaption>
          </figure>
        ))}
      </div>
      {list.length > 1 && (
        <div className="testimonial-dots" role="tablist">
          {list.map((_, i) => (
            <button
              key={i}
              type="button"
              className="testimonial-dot"
              aria-current={active === i}
              aria-label={`Show testimonial ${i + 1}`}
              onClick={() => goTo(i)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
