// components/CinematicHero.tsx — the cinematic hero used across all hotel pages:
// a big crisp photo on a clean white surround, with the page name set large in
// the display serif (eyebrow + italic script accent) overlaid bottom-right.
// Optional `foot` renders a slim row just beneath the hero (CTAs / address).
import type { CSSProperties, ReactNode } from 'react'
import { Media } from './Media'
import './CinematicHero.css'

export function CinematicHero({
  image,
  video,
  poster,
  eyebrow,
  title,
  script,
  focal,
  foot,
}: {
  image: string | null
  /** Optional full URL to an autoplaying, muted, looping background video. Takes
   *  precedence over `image` when set; `poster` (or `image`) is the still fallback. */
  video?: string | null
  poster?: string | null
  eyebrow: string
  title: string
  script?: string | null
  /** object-position for the crop, e.g. '50% 22%' to keep a building's roofline. */
  focal?: string
  /** Slim row rendered directly below the hero (booking CTAs, address). */
  foot?: ReactNode
}) {
  const mediaStyle = focal ? ({ '--chero-focal': focal } as CSSProperties) : undefined
  return (
    <>
      <section className="chero" role="banner">
        <div className="chero-media" style={mediaStyle}>
          {video ? (
            <video
              className="chero-video"
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              poster={poster ?? undefined}
            >
              <source src={video} type="video/mp4" />
            </video>
          ) : (
            <Media path={image} alt={title} priority blur sizes="100vw" />
          )}
        </div>
        <div className="chero-name">
          <span className="chero-eyebrow">{eyebrow}</span>
          <h1 className="chero-title">{title}</h1>
          {script && <span className="chero-script">{script}</span>}
        </div>
        <span className="chero-scroll" aria-hidden />
      </section>
      {foot && <div className="chero-foot"><div className="container">{foot}</div></div>}
    </>
  )
}
