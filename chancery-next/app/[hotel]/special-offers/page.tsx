import { Hero } from '@/components/Hero'
import { HeroIconNav } from '@/components/HeroIconNav'
import { Media } from '@/components/Media'
import { BookButton } from '@/components/BookButton'
import { getHotel, getPage, getOffers, type HotelSlug } from '@/lib/queries/content'
import { buildMetadata } from '@/lib/seo'
import type { Metadata } from 'next'

export const revalidate = 3600

export async function generateMetadata({ params }: { params: Promise<{ hotel: string }> }): Promise<Metadata> {
  const { hotel } = await params
  const [page, h] = await Promise.all([getPage('offers', hotel), getHotel(hotel)])
  return buildMetadata({
    title: page?.meta_title || 'Special Offers',
    description: page?.meta_description ?? undefined,
    path: `/${hotel}/special-offers`,
    ogImagePath: page?.hero_image ?? h?.hero_image,
  })
}

export default async function SpecialOffersPage({ params }: { params: Promise<{ hotel: string }> }) {
  const { hotel } = await params
  const [page, h, offers] = await Promise.all([
    getPage('offers', hotel),
    getHotel(hotel),
    getOffers(hotel),
  ])
  const p = page

  return (
    <>
      <Hero
        image={p?.hero_image ?? h?.hero_image ?? null}
        eyebrow={
          <span className="hero-eyebrow-stack">
            <span>{h?.name}</span>
            <span>{p?.hero_eyebrow ?? 'Offers'}</span>
          </span>
        }
        heading={p?.hero_heading ?? 'Special offers'}
        subheading={p?.hero_subheading ?? undefined}
        size="page"
        footerNav={<HeroIconNav scope={hotel as HotelSlug} />}
      />
      <section className="section">
        <div className="container">
          {p?.intro_body && (
            <div className="section-head">
              <p className="lede">{p.intro_body}</p>
            </div>
          )}
          <div className="card-grid">
            {offers.map((o: any) => (
              <article key={o.id} className="card">
                <div className="figure aspect-43">
                  {o.image && <Media path={o.image} alt={o.title} sizes="(max-width: 768px) 100vw, 50vw" />}
                </div>
                {o.tag && <p className="card-eyebrow">{o.tag}</p>}
                <h3>{o.title}</h3>
                <p className="copy">{o.description}</p>
                {o.min_nights && <p className="meta">Minimum {o.min_nights} nights</p>}
                <div className="card-cta">
                  <BookButton
                    hotel={hotel as HotelSlug}
                    promo={o.promo_code || undefined}
                    className="link-arrow"
                  >
                    Book
                  </BookButton>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
