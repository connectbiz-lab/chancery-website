'use client'
// HeroMedia — renders the hero background. When a `video` URL is provided it
// plays the looping montage on tablet/desktop (≥768px); on phones it renders
// the static photo instead, so the video bytes are never downloaded on mobile
// data. Falls back to the photo everywhere the video isn't set.
import { useEffect, useState } from 'react'
import { Media } from './Media'

export function HeroMedia({
  image,
  video,
  poster,
  alt,
}: {
  image: string | null
  video?: string | null
  poster?: string | null
  alt: string
}) {
  // SSR + phones start with the photo; upgrade to video on wider viewports only.
  const [wide, setWide] = useState(false)
  useEffect(() => {
    if (!video) return
    const mq = window.matchMedia('(min-width: 768px)')
    const sync = () => setWide(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [video])

  if (video && wide) {
    return (
      <video className="chero-video" autoPlay muted loop playsInline preload="auto" poster={poster ?? undefined}>
        <source src={video} type="video/mp4" />
      </video>
    )
  }
  return <Media path={image} alt={alt} priority blur sizes="100vw" />
}
