// app/(main)/layout.tsx — chrome for the existing site: structured data, the
// Navbar, the Footer and the scroll-to-top control. Every current route lives in
// this group; the route-group folder name is invisible in the URL.
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { ScrollToTop } from '@/components/ScrollToTop'
import { JsonLd } from '@/components/JsonLd'
import { getSiteContent, getHotels } from '@/lib/queries/content'
import { organizationJsonLd, websiteJsonLd } from '@/lib/seo'

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const [site, hotels] = await Promise.all([getSiteContent(), getHotels()])
  return (
    <>
      <JsonLd data={organizationJsonLd(site)} />
      <JsonLd data={websiteJsonLd(site)} />
      <Navbar site={site} hotels={hotels} />
      {children}
      <Footer site={site} hotels={hotels} />
      <ScrollToTop />
    </>
  )
}
