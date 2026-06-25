import type { Metadata } from 'next'
import { Fraunces, Cormorant_Garamond, Inter } from 'next/font/google'
import './globals.css'
import './pages.css'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { ScrollToTop } from '@/components/ScrollToTop'
import { JsonLd } from '@/components/JsonLd'
import { getSiteContent, getHotels } from '@/lib/queries/content'
import { organizationJsonLd } from '@/lib/seo'

const fraunces = Fraunces({ subsets: ['latin'], variable: '--font-fraunces', display: 'swap' })
const cormorant = Cormorant_Garamond({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-cormorant', display: 'swap' })
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })

export const metadata: Metadata = {
  title: { default: 'Chancery Hotels', template: '%s | Chancery Hotels' },
  description: 'Luxury hotels in Bangalore — The Chancery Hotel and Chancery Pavilion.',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [site, hotels] = await Promise.all([getSiteContent(), getHotels()])
  return (
    <html lang="en" className={`${fraunces.variable} ${cormorant.variable} ${inter.variable}`}>
      <body>
        <JsonLd data={organizationJsonLd(site)} />
        <Navbar site={site} hotels={hotels} />
        {children}
        <Footer site={site} hotels={hotels} />
        <ScrollToTop />
      </body>
    </html>
  )
}
