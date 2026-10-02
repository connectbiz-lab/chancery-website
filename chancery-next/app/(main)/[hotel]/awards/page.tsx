// app/(main)/[hotel]/awards/page.tsx — Awards & Accolades for one hotel: its own
// awards, its restaurants', then the group-level honours it shares. Every card
// is headed by the winner's LOGO (hotel, restaurant or group mark) as an image.
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CinematicHero } from '@/components/CinematicHero'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { Reveal } from '@/components/Reveal'
import { getHotel, getHotels, getRestaurants, getSiteContent } from '@/lib/queries/content'
import { awardCount, awardLine, awardsFor, type AwardGroup } from '@/lib/awards'
import { buildMetadata } from '@/lib/seo'
import { mediaUrl } from '@/lib/media'
import { hotelHomePath } from '@/lib/routes'
import type { Metadata } from 'next'
import './AwardsPage.css'

export const revalidate = 3600

export async function generateMetadata({ params }: { params: Promise<{ hotel: string }> }): Promise<Metadata> {
  const { hotel } = await params
  const h = await getHotel(hotel)
  if (!h) return {}
  return buildMetadata({
    title: `Awards & Accolades | ${h.name}`,
    description: `Awards and recognition earned by ${h.name}, its restaurants and the Chancery Group.`,
    path: `/${hotel}/awards`,
    ogImagePath: h.hero_image,
  })
}

export default async function AwardsPage({ params }: { params: Promise<{ hotel: string }> }) {
  const { hotel } = await params
  const [h, hotels, restaurants, site] = await Promise.all([
    getHotel(hotel), getHotels(), getRestaurants(hotel), getSiteContent(),
  ])
  if (!h) notFound()

  const groups = awardsFor(hotel)
  const other = hotels.find((x) => x.slug !== hotel)
  // The logo that heads each card: the hotel's, the group's, or a restaurant's.
  const markFor = (g: AwardGroup): string | null => {
    if (g.mark.kind === 'hotel') return mediaUrl(h.logo)
    if (g.mark.kind === 'group') return mediaUrl(site.brand_logo)
    const slug = g.mark.slug
    return mediaUrl(restaurants.find((r) => r.slug === slug)?.logo)
  }

  return (
    <>
      <Breadcrumbs
        items={[
          { name: 'Home', path: '/' },
          { name: h.name, path: hotelHomePath(hotel) },
          { name: 'Awards & Accolades', path: `/${hotel}/awards` },
        ]}
      />
      <CinematicHero image={h.hero_image ?? null} eyebrow={h.name} title="Awards & Accolades" />

      <section className="section bg-cream">
        <Reveal className="container">
          <div className="section-head aw-head">
            {h.logo && (
              // eslint-disable-next-line @next/next/no-img-element
              <img className={`aw-hotel-logo ${hotel}`} src={mediaUrl(h.logo) ?? undefined} alt={h.name} />
            )}
            <p className="eyebrow center">Recognition</p>
            <h2 className="h1">Recognised Excellence</h2>
            <p className="lede">Every award reflects our teams — from the kitchen to the front desk.</p>
            <p className="aw-count">
              <span className="aw-count-num">{awardCount(groups)}</span> awards and accolades
            </p>
          </div>

          <div className="aw-grid">
            {groups.map((g) => {
              const mark = markFor(g)
              return (
                <article key={g.owner} className="aw-card">
                  <header className="aw-card-head">
                    {mark && (
                      <span className="aw-mark">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={mark} alt="" />
                      </span>
                    )}
                    <div>
                      <p className="aw-scope">{g.scope === 'group' ? 'The Chancery Group of Hotels' : h.name}</p>
                      <h3 className="aw-owner">{g.owner}</h3>
                    </div>
                  </header>
                  <ul className="aw-list">
                    {g.awards.map((a) => (
                      <li key={a.title + a.years}>
                        <strong>{a.title}</strong>
                        <span>{awardLine(a)}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              )
            })}
          </div>
        </Reveal>
      </section>

      {other && (
        <section className="section bg-navy tight">
          <div className="container narrow text-center">
            <p className="eyebrow center" style={{ color: 'var(--c-gold-soft)' }}>Our Sister Hotel</p>
            <h2 className="h2" style={{ color: 'var(--c-ivory)' }}>{other.name}</h2>
            <Link href={`/${other.slug}/awards`} className="btn light">View Its Awards</Link>
          </div>
        </section>
      )}
    </>
  )
}
