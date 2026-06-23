import type { Metadata } from 'next'
import { Fraunces, Cormorant_Garamond, Inter } from 'next/font/google'
import './globals.css'

const fraunces = Fraunces({ subsets: ['latin'], variable: '--font-fraunces', display: 'swap' })
const cormorant = Cormorant_Garamond({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-cormorant', display: 'swap' })
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })

export const metadata: Metadata = {
  title: { default: 'Chancery Hotels', template: '%s | Chancery Hotels' },
  description: 'Luxury hotels in Bangalore — The Chancery Hotel and Chancery Pavilion.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${cormorant.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  )
}
