import { Hero } from '@/components/Hero'
import { getPage } from '@/lib/queries/content'
import { buildMetadata } from '@/lib/seo'

type Kind = 'privacy' | 'terms' | 'accessibility'

const FALLBACK: Record<Kind, { title: string; body: string[] }> = {
  privacy: {
    title: 'Privacy policy',
    body: [
      'This privacy policy outlines how Chancery Hotels collects, uses and protects information you share with us when interacting with our websites, mobile experiences and during your stay.',
      'We collect information necessary to deliver your reservation and personalise your stay: name, contact details, billing information, and preferences you choose to share. We do not sell guest information to third parties.',
      'Booking transactions are processed through secure third-party providers (including our reservations partner SynXis). Payment card details are not stored on our servers.',
      "You may request a copy of the information we hold about you, or ask for it to be amended or deleted, by contacting either property's reservations team.",
    ],
  },
  terms: {
    title: 'Terms & conditions',
    body: [
      'By accessing the Chancery Hotels website you accept the following terms. Bookings are subject to the rate plan you select at checkout and to the cancellation policy displayed alongside it.',
      'Rates are quoted in Indian Rupees (INR) and are subject to applicable taxes and service charges. The hotel reserves the right to amend published rates and packages at any time.',
      'All content on this website — including photography, text and marks — is the property of Chancery Hotels and may not be reproduced without written permission.',
      'Chancery Hotels is not liable for any indirect or consequential loss arising from the use of this website or services booked through it. These terms are governed by the laws of India.',
    ],
  },
  accessibility: {
    title: 'Accessibility statement',
    body: [
      'Chancery Hotels is committed to ensuring that our website is accessible to as wide an audience as possible, regardless of ability or assistive technology.',
      'We design and develop the site against the principles of WCAG 2.1 Level AA — including sufficient colour contrast, semantic markup, full keyboard navigability and clearly labelled interactive elements.',
      'If you encounter a barrier on this site, please tell us. Email reservations.tcp@chanceryhotels.com or call +91 80 4141 4141 and we will work to resolve the issue.',
      'Both properties offer step-free access in public areas, lift access to guest floors, and accessibility-friendly room configurations. Please mention accessibility needs while booking so the team can prepare appropriately.',
    ],
  },
}

const PATHS: Record<Kind, string> = {
  privacy: '/privacy',
  terms: '/terms',
  accessibility: '/accessibility-statement',
}

export async function metadataFor(kind: Kind) {
  const page = await getPage(kind)
  const fb = FALLBACK[kind]
  return buildMetadata({
    title: page?.meta_title || page?.title || fb.title,
    description: page?.meta_description ?? undefined,
    path: PATHS[kind],
    ogImagePath: page?.hero_image,
  })
}

export async function SimpleContent({ kind }: { kind: Kind }) {
  const page = await getPage(kind)
  const p = page
  const fb = FALLBACK[kind]

  return (
    <>
      <Hero
        image={p?.hero_image ?? null}
        eyebrow={p?.hero_eyebrow ?? 'Legal'}
        heading={p?.hero_heading ?? fb.title}
        size="compact"
      />
      <section className="section">
        <div className="container narrow">
          {p?.intro_body && <p className="lede">{p.intro_body}</p>}
          {fb.body.map((para, i) => <p key={i}>{para}</p>)}
        </div>
      </section>
    </>
  )
}
