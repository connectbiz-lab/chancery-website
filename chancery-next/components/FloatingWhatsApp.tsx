'use client'
// components/FloatingWhatsApp.tsx — fixed bottom-right click-to-chat button.
// Picks the right hotel's number by route (same approach as the navbar), and
// renders nothing if that number isn't set.
import { usePathname } from 'next/navigation'
import { whatsappHref } from '@/lib/whatsapp'
import { WhatsAppIcon } from './WhatsAppButton'
import './FloatingWhatsApp.css'

interface Props {
  pavilion: string | null
  chancery: string | null
}

export function FloatingWhatsApp({ pavilion, chancery }: Props) {
  const pathname = usePathname()
  const onChancery = pathname.startsWith('/chancery')
  // Brand/group pages default to the flagship (Pavilion) number.
  const number = onChancery ? chancery : pavilion
  const hotelName = onChancery ? 'The Chancery Hotel' : 'The Chancery Pavilion'

  const href = whatsappHref(number, `Hi, I have an enquiry about ${hotelName}.`)
  if (!href) return null

  return (
    <a
      className="wa-fab"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Chat with ${hotelName} on WhatsApp`}
    >
      <WhatsAppIcon size={28} />
    </a>
  )
}
