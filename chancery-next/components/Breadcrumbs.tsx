// components/Breadcrumbs.tsx — emit BreadcrumbList JSON-LD for a page trail.
// SEO-only (no visible UI); renders the structured data via <JsonLd>.
import { JsonLd } from './JsonLd'
import { breadcrumbJsonLd } from '@/lib/seo'

export function Breadcrumbs({ items }: { items: { name: string; path: string }[] }) {
  // The Pavilion's home IS the site home (/), so a Pavilion trail arrives as
  // Home(/) → Pavilion(/) → …; collapse consecutive items with the same path.
  const trail = items.filter((it, i) => i === 0 || it.path !== items[i - 1].path)
  return <JsonLd data={breadcrumbJsonLd(trail)} />
}
