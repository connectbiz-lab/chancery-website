import Link from 'next/link'
import { Hero } from '@/components/Hero'
import { getPage } from '@/lib/queries/content'
import { buildMetadata } from '@/lib/seo'

export const revalidate = 3600

const OCCASIONS: Array<[string, string]> = [
  ['Weddings & receptions', 'Multi-cuisine menus crafted around your traditions.'],
  ['Corporate events', 'Lunch, dinner and cocktail catering for offices and venues.'],
  ['Private celebrations', 'Anniversaries, milestones, family gatherings.'],
  ['Premium cocktail experiences', 'Curated bar service from our beverage team.'],
]

const CAPABILITIES: Array<[string, string]> = [
  ['Menu planning', 'Custom menus designed around your cuisine, scale and dietary requirements.'],
  ['Bulk production', 'Trained chefs and standardised kitchens for consistent quality at any volume.'],
  ['Secure packaging', 'Temperature-controlled logistics from the kitchen to your venue.'],
  ['FSSAI compliance', 'Hygiene, food safety and quality audits on every order — no exceptions.'],
  ['On-ground service', 'Front-of-house teams that deliver Chancery service standards on-site.'],
  ['Corporate to community', 'From boardroom lunches to weddings of 10,000+ — one accountable partner.'],
]

// Sourced from the F&B fact sheet — organisations served and venues catered.
const CLIENTS = ['Accenture', 'IBM', 'Mphasis', 'Bank of Baroda', 'BMRCL', 'Bosch', 'Norstella']

const VENUES_CATERED: Array<[string, string]> = [
  ['M. Chinnaswamy Stadium', 'International cricket stadium'],
  ['KTPO Convention Centre', 'Exhibitions & conventions'],
  ['Bangalore International Exhibition Centre', 'Large-scale exhibitions'],
  ['Bangalore Palace Grounds', 'Open-air celebrations'],
  ['National Cricket Academy', 'Sporting events & hospitality'],
  ['Farm Houses', 'Private estates'],
  ['Open Grounds', 'Custom outdoor setups'],
]

export async function generateMetadata() {
  const page = await getPage('catering')
  return buildMetadata({
    title: page?.meta_title || page?.title || 'Outdoor Catering',
    description: page?.meta_description ?? undefined,
    path: '/catering',
    ogImagePath: page?.hero_image,
  })
}

export default async function CateringPage() {
  const page = await getPage('catering')
  const p = page

  return (
    <>
      <Hero
        image={p?.hero_image ?? null}
        eyebrow={p?.hero_eyebrow ?? 'Outdoor catering'}
        heading={p?.hero_heading ?? 'Chancery hospitality, wherever you celebrate'}
        subheading={p?.hero_subheading ?? undefined}
        size="page"
      />
      <section className="section">
        <div className="container narrow">
          {p?.intro_body && <p className="lede">{p.intro_body}</p>}
        </div>
      </section>

      <section className="section bg-ivory">
        <div className="container">
          <div className="section-head left">
            <p className="eyebrow">We cater for</p>
            <h2 className="h2">Occasions of every scale</h2>
          </div>
          <ul className="amenities" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
            {OCCASIONS.map(([title, body]) => (
              <li key={title}>
                <span style={{ display: 'block' }}>
                  <strong style={{ fontFamily: 'var(--f-display)', fontSize: '1.15rem', color: 'var(--c-navy)', display: 'block', marginBottom: '0.25rem' }}>{title}</strong>
                  <span style={{ color: 'var(--c-muted)' }}>{body}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head left">
            <p className="eyebrow">End-to-end</p>
            <h2 className="h2">What we handle</h2>
            <p className="lede">From menu planning to on-ground service, every order ships under one roof and one accountable team.</p>
          </div>
          <ul className="amenities" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
            {CAPABILITIES.map(([title, body]) => (
              <li key={title}>
                <span style={{ display: 'block' }}>
                  <strong style={{ fontFamily: 'var(--f-display)', fontSize: '1.15rem', color: 'var(--c-navy)', display: 'block', marginBottom: '0.25rem' }}>{title}</strong>
                  <span style={{ color: 'var(--c-muted)' }}>{body}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head left">
            <p className="eyebrow">Trusted by</p>
            <h2 className="h2">Chosen by leading organisations</h2>
            <p className="lede">From global technology firms to national institutions, teams across Bengaluru rely on Chancery for their largest events.</p>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.85rem 1rem' }}>
            {CLIENTS.map((c) => (
              <span
                key={c}
                style={{
                  padding: '0.65rem 1.35rem',
                  border: '1px solid rgba(14, 34, 55, 0.16)',
                  borderRadius: '999px',
                  fontFamily: 'var(--f-display)',
                  fontSize: '1.05rem',
                  color: 'var(--c-navy)',
                }}
              >
                {c}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-ivory">
        <div className="container">
          <div className="section-head left">
            <p className="eyebrow">Proven at scale</p>
            <h2 className="h2">Venues we&rsquo;ve catered</h2>
            <p className="lede">Stadiums, convention centres, palace grounds and open fields — wherever the occasion calls for it.</p>
          </div>
          <ul className="amenities" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
            {VENUES_CATERED.map(([name, kind]) => (
              <li key={name}>
                <span style={{ display: 'block' }}>
                  <strong style={{ fontFamily: 'var(--f-display)', fontSize: '1.15rem', color: 'var(--c-navy)', display: 'block', marginBottom: '0.25rem' }}>{name}</strong>
                  <span style={{ color: 'var(--c-muted)' }}>{kind}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section bg-navy tight">
        <div className="container narrow text-center">
          <p className="eyebrow center" style={{ color: 'var(--c-gold-soft)' }}>Request a proposal</p>
          <h2 className="h2" style={{ color: 'var(--c-ivory)' }}>Tell us about your event</h2>
          <Link href="/pavilion/contact-us" className="btn light">Contact our catering team</Link>
        </div>
      </section>
    </>
  )
}
