'use client'
import { useState } from 'react'
import { BookTableModal } from './BookTableModal'
import type { HotelSlug } from '@/lib/queries/content'

/** Client boundary for the dining "Book a table" CTA — holds the modal open
 *  state so the dining page can stay a Server Component. */
export function DiningBookButton({ hotel, restaurant }: { hotel: HotelSlug; restaurant: string }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button type="button" className="btn" onClick={() => setOpen(true)}>
        Book a table
      </button>
      <BookTableModal open={open} onClose={() => setOpen(false)} hotel={hotel} restaurant={restaurant} />
    </>
  )
}
