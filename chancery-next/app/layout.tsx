// app/layout.tsx — the BARE root layout: fonts, global styles and site metadata
// only. Page chrome (Navbar + Footer) lives in app/(main)/layout.tsx; the
// route group keeps every URL unchanged.
import type { Metadata, Viewport } from 'next'
import { Fraunces, Cormorant_Garamond, Inter } from 'next/font/google'
import './globals.css'
import './pages.css'
import { SITE_URL } from '@/lib/seo'

const fraunces = Fraunces({ subsets: ['latin'], variable: '--font-fraunces', display: 'swap' })
const cormorant = Cormorant_Garamond({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-cormorant', display: 'swap' })
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: 'Chancery Hotels — Luxury Hotels in Bangalore', template: '%s | Chancery Hotels' },
  description: 'Luxury hotels in Bangalore — The Chancery Hotel on Lavelle Road and The Chancery Pavilion on Residency Road. Award-winning dining, banquets and stays since 1968.',
  keywords: [
    'Chancery Hotels', 'luxury hotels Bangalore', 'The Chancery Hotel', 'Chancery Pavilion',
    'hotels Lavelle Road', 'hotels Residency Road', 'banquet halls Bangalore', 'wedding venues Bangalore',
    'fine dining Bangalore', 'Matsuri', 'Alchemy',
  ],
}

export const viewport: Viewport = {
  themeColor: '#1a2238',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${cormorant.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  )
}
