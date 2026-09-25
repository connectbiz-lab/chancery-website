import { Hero } from '@/components/Hero'
import { FaqAccordion } from '@/components/FaqAccordion'
import { getFaq, getPage } from '@/lib/queries/content'
import { buildMetadata } from '@/lib/seo'
import './FAQPage.css'

export const revalidate = 3600

export async function generateMetadata() {
  const page = await getPage('faq')
  return buildMetadata({
    title: page?.meta_title || page?.title || 'Frequently Asked Questions',
    description: page?.meta_description ?? undefined,
    path: '/faq',
    ogImagePath: page?.hero_image,
  })
}

export default async function FAQPage() {
  const [page, faq] = await Promise.all([getPage('faq'), getFaq()])
  const p = page

  return (
    <>
      <Hero
        image={p?.hero_image ?? null}
        eyebrow={p?.hero_eyebrow ?? undefined}
        heading={p?.hero_heading ?? 'Frequently asked questions'}
        subheading={p?.hero_subheading ?? undefined}
        size="page"
      />
      <section className="section">
        <div className="container narrow">
          {p?.intro_body && <p className="lede">{p.intro_body}</p>}
          <FaqAccordion sections={faq} />
        </div>
      </section>
    </>
  )
}
