// components/Breadcrumbs.tsx — emit BreadcrumbList JSON-LD for a page trail.
// SEO-only (no visible UI); renders the structured data via <JsonLd>.
import { JsonLd } from './JsonLd'
import { breadcrumbJsonLd } from '@/lib/seo'

export function Breadcrumbs({ items }: { items: { name: string; path: string }[] }) {
  return <JsonLd data={breadcrumbJsonLd(items)} />
}
