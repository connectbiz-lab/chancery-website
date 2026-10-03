// app/(main)/catering/page.tsx — Outdoor Catering (ODC), one of the group's
// main lines of business: scale, occasions, signature menus, what's handled,
// who trusts it and where it has been delivered. Facts come from lib/catering
// (group deck) and the F&B fact sheet; nothing here is estimated.
import Link from 'next/link'
import { Hero } from '@/components/Hero'
import { Reveal } from '@/components/Reveal'
import { BusinessIcon, GovernmentIcon, SocialIcon, WeddingIcon } from '@/components/NavIcons'
import { getPage, getSiteContent } from '@/lib/queries/content'
import { AWARD_GROUPS } from '@/lib/awards'
import { ODC } from '@/lib/catering'
import { mediaUrl } from '@/lib/media'
import { buildMetadata } from '@/lib/seo'
import './CateringPage.css'

export const revalidate = 3600

// The four segments the catering team serves (group deck).
const OCCASIONS = [
  { Icon: WeddingIcon, title: 'Weddings & Social', copy: 'Live counters and themed menus, crafted around your traditions.' },
  { Icon: BusinessIcon, title: 'Corporate', copy: 'Launches, annual days and board lunches.' },
  { Icon: GovernmentIcon, title: 'Government', copy: 'Protocol-compliant state functions.' },
  { Icon: SocialIcon, title: 'Festivals & Community', copy: 'High-volume, seamless service.' },
]

// Signature offerings named in the group deck.
const SIGNATURES = ['Regional Fare', 'Matsuri Live Sushi & Teppanyaki', 'Continental Spreads']

const ASSURED = ['FSSAI-compliant', 'Temperature-controlled logistics', 'Jain, vegan & gluten-free menus']

const CAPABILITIES: Array<[string, string]> = [
  ['Menu Planning', 'Custom menus designed around your cuisine, scale and dietary requirements.'],
  ['Bulk Production', 'Trained chefs and standardised kitchens for consistent quality at any volume.'],
  ['Secure Packaging', 'Temperature-controlled logistics from the kitchen to your venue.'],
  ['FSSAI Compliance', 'Hygiene, food safety and quality audits on every order — no exceptions.'],
  ['On-Ground Service', 'Front-of-house teams that deliver Chancery service standards on-site.'],
  ['Corporate to Community', 'From boardroom lunches to weddings of 10,000+ — one accountable partner.'],
]

// Sourced from the F&B fact sheet — organisations served and venues catered.
const CLIENTS = ['Accenture', 'IBM', 'Mphasis', 'Bank of Baroda', 'BMRCL', 'Bosch', 'Norstella', 'Wabtec']

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
    path: ODC.path,
    ogImagePath: page?.hero_image,
  })
}

export default async function CateringPage() {
  const [page, site] = await Promise.all([getPage('catering'), getSiteContent()])
  const p = page
  // The catering award, read from the single awards source.
  const award = AWARD_GROUPS.find((g) => g.owner === 'Catering & Events')?.awards[0]
  const groupLogo = mediaUrl(site.brand_logo)

  return (
    <>
      <Hero
        image={p?.hero_image ?? null}
        eyebrow={p?.hero_eyebrow ?? 'Outdoor catering'}
        heading={p?.hero_heading ?? 'Chancery hospitality, wherever you celebrate'}
        subheading={p?.hero_subheading ?? undefined}
        size="page"
      />

      {/* Intro — centred heading like the other sections, photo beneath, then the scale figures. */}
      <section className="section bg-cream">
        <Reveal className="container">
          <div className="section-head wide">
            <p className="eyebrow center">Outdoor Catering</p>
            <h2 className="h1">{ODC.tagline}</h2>
            {p?.intro_body && <p className="lede">{p.intro_body}</p>}
          </div>
          <div className="odc-intro-figure">
            <div className="figure">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={ODC.photo.src}
                srcSet={`${ODC.photo.srcSmall} 640w, ${ODC.photo.srcMedium} 800w, ${ODC.photo.src} 1200w`}
                sizes="(max-width: 900px) 100vw, 56rem"
                alt={ODC.photo.alt}
                loading="lazy"
              />
            </div>
          </div>
          <dl className="odc-stats">
            <div><dd>{ODC.guestRange}</dd><dt>Guests per event</dt></div>
            <div><dd>{VENUES_CATERED.length}</dd><dt>Landmark venues catered</dt></div>
            {award && <div><dd>{award.years}</dd><dt>{award.title}</dt></div>}
          </dl>
          <div className="text-center">
            <Link href="/pavilion/contact-us" className="btn">Request a Proposal</Link>
          </div>
        </Reveal>
      </section>

      {/* Who we cater for */}
      <section className="section bg-ivory">
        <div className="container">
          <div className="section-head wide">
            <p className="eyebrow center">We Cater For</p>
            <h2 className="h1">Occasions of Every Scale</h2>
          </div>
          <div className="odc-occasions">
            {OCCASIONS.map(({ Icon, title, copy }) => (
              <article className="odc-occasion" key={title}>
                <span className="odc-occasion-icon"><Icon size={30} /></span>
                <h3>{title}</h3>
                <p>{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Signature menus */}
      <section className="section bg-navy">
        <div className="container">
          <div className="section-head wide">
            <p className="eyebrow center" style={{ color: 'var(--c-gold-soft)' }}>Signature</p>
            <h2 className="h1" style={{ color: 'var(--c-ivory)' }}>Menus We Are Known For</h2>
          </div>
          <ul className="odc-signatures">
            {SIGNATURES.map((title) => <li key={title}>{title}</li>)}
          </ul>
        </div>
      </section>

      {/* End-to-end capabilities + the three assurances */}
      <section className="section bg-cream">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow center">End-to-End</p>
            <h2 className="h1">What We Handle</h2>
            <p className="lede">From menu planning to on-ground service, every order ships under one roof and one accountable team.</p>
          </div>
          <ul className="odc-assured" aria-label="Assured on every order">
            {ASSURED.map((a) => <li key={a}>{a}</li>)}
          </ul>
          <div className="odc-capabilities">
            {CAPABILITIES.map(([title, body]) => (
              <article key={title}>
                <h3>{title}</h3>
                <p>{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Trusted by + venues catered */}
      <section className="section bg-ivory">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow center">Trusted By</p>
            <h2 className="h1">Chosen by Leading Organisations</h2>
            <p className="lede">From global technology firms to national institutions, teams across Bengaluru rely on Chancery for their largest events.</p>
          </div>
          <ul className="odc-clients">
            {CLIENTS.map((c) => <li key={c}>{c}</li>)}
          </ul>

          <div className="section-head odc-venues-head">
            <p className="eyebrow center">Proven at Scale</p>
            <h2 className="h2">Venues We&rsquo;ve Catered</h2>
            <p className="lede">Stadiums, convention centres, palace grounds and open fields — wherever the occasion calls for it.</p>
          </div>
          <div className="odc-venues">
            {VENUES_CATERED.map(([name, kind]) => (
              <article key={name}>
                <h3>{name}</h3>
                <p>{kind}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Recognition — headed by the group mark, read from the awards source. */}
      {award && (
        <section className="section tight bg-cream">
          <div className="container narrow text-center odc-award">
            {groupLogo && (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="odc-award-logo" src={groupLogo} alt="The Chancery Group of Hotels" />
            )}
            <p className="eyebrow center">Recognition</p>
            <h2 className="h2">{award.title}</h2>
            <p className="odc-award-year">{award.years}</p>
            <Link href="/pavilion/awards" className="link-arrow">All Awards &amp; Accolades</Link>
          </div>
        </section>
      )}

      <section className="section bg-navy tight">
        <div className="container narrow text-center">
          <p className="eyebrow center" style={{ color: 'var(--c-gold-soft)' }}>Request a Proposal</p>
          <h2 className="h2" style={{ color: 'var(--c-ivory)' }}>Tell Us About Your Event</h2>
          <Link href="/pavilion/contact-us" className="btn light">Contact Our Catering Team</Link>
        </div>
      </section>
    </>
  )
}
