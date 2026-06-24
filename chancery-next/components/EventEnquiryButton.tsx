'use client'
import { useState } from 'react'
import { EventEnquiryModal } from './EventEnquiryModal'
import type { HotelSlug } from '@/lib/queries/content'

/** Client boundary for the event-enquiry CTA — holds the modal open state so
 *  the events / venue-detail pages can stay Server Components. */
export function EventEnquiryButton({
  hotel,
  venue,
  label = 'Request a proposal',
  className = 'btn',
}: {
  hotel: HotelSlug
  venue?: string
  label?: string
  className?: string
}) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button type="button" className={className} onClick={() => setOpen(true)}>
        {label}
      </button>
      <EventEnquiryModal open={open} onClose={() => setOpen(false)} hotel={hotel} venue={venue} />
    </>
  )
}
