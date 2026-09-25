import Link from 'next/link'
import { Hero } from '@/components/Hero'
import { getPage } from '@/lib/queries/content'
import { buildMetadata } from '@/lib/seo'

export const revalidate = 3600

const PILLARS: Array<[string, string]> = [
  ['Hospitality', "Service shaped by decades of welcoming Bangalore's most discerning guests."],
  ['Craft', 'Kitchens, banqueting, front office — every role is treated as a craft.'],
  ['Growth', 'Structured paths for career growth across the Chancery Group.'],
]

export async function generateMetadata() {
  const page = await getPage('careers')
  return buildMetadata({
    title: page?.meta_title || page?.title || 'Careers',
    description: page?.meta_description ?? undefined,
    path: '/careers',
    ogImagePath: page?.hero_image,
  })
}

export default async function CareersPage() {
  const page = await getPage('careers')
  const p = page

  return (
    <>
      <Hero
        image={p?.hero_image ?? null}
        eyebrow={p?.hero_eyebrow ?? 'Careers'}
        heading={p?.hero_heading ?? 'Build a career with us'}
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
          <div className="section-head">
            <p className="eyebrow center">What we look for</p>
            <h2 className="h1">Three things we hire for</h2>
          </div>
          <div className="card-grid three">
            {PILLARS.map(([title, body]) => (
              <div key={title} className="card" style={{ textAlign: 'center', alignItems: 'center' }}>
                <h3 style={{ marginBottom: '0.75rem' }}>{title}</h3>
                <p className="copy" style={{ maxWidth: '32ch' }}>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-navy tight">
        <div className="container narrow text-center">
          <p className="eyebrow center" style={{ color: 'var(--c-gold-soft)' }}>Apply</p>
          <h2 className="h2" style={{ color: 'var(--c-ivory)' }}>Write to our HR team</h2>
          <p className="lede" style={{ color: 'rgba(246,241,231,0.85)' }}>
            Send a one-page CV and a short note about the role you&apos;re interested in.
            Tell us a little about the kind of hospitality you&apos;d like to be part of.
          </p>
          <Link href="/pavilion/contact-us" className="btn light">Send your application</Link>
        </div>
      </section>
    </>
  )
}
