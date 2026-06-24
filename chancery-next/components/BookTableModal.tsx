'use client'
import { useEffect, useState } from 'react'
import { CloseIcon } from './NavIcons'
import type { HotelSlug } from '@/lib/queries/content'
import './BookTableModal.css'

interface Props {
  open: boolean
  onClose: () => void
  hotel: HotelSlug
  restaurant: string
}

const EMPTY = { name: '', email: '', phone: '', covers: '2', date: '', time: '', message: '' }

export function BookTableModal({ open, onClose, hotel, restaurant }: Props) {
  const [form, setForm] = useState({ ...EMPTY })
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'err'>('idle')

  // Each fresh open starts from a clean form (the component stays mounted).
  // Adjust state during render on the open→close transition rather than in an
  // effect (React's "you might not need an effect" pattern).
  const [wasOpen, setWasOpen] = useState(open)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) {
      setForm({ ...EMPTY })
      setStatus('idle')
    }
  }

  // Close on Escape; lock body scroll while open.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  function set<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending')
    try {
      const res = await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          interest: 'dining',
          hotel_interest: hotel,
          restaurant,
          covers: Number(form.covers) || null,
          preferred_date: form.date || null,
          preferred_time: form.time,
          message: form.message,
          page: `${hotel}/dining`,
        }),
      })
      if (!res.ok) throw new Error('request failed')
      setStatus('ok')
    } catch {
      setStatus('err')
    }
  }

  return (
    <div className="btm-backdrop" onClick={onClose}>
      <div
        className="btm-dialog"
        role="dialog"
        aria-modal="true"
        aria-label={`Book a table at ${restaurant}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="btm-close" onClick={onClose} aria-label="Close">
          <CloseIcon size={22} />
        </button>

        {status === 'ok' ? (
          <div className="btm-success">
            <p className="eyebrow">Request received</p>
            <h2 className="h3">Thank you, {form.name.split(' ')[0] || 'guest'}.</h2>
            <p>
              Your table request for <strong>{restaurant}</strong> has reached our team — we&rsquo;ll
              confirm by email or phone shortly.
            </p>
            <button type="button" className="btn" onClick={onClose}>Close</button>
          </div>
        ) : (
          <>
            <p className="eyebrow">{restaurant}</p>
            <h2 className="h3">Book a table</h2>
            <form className="btm-form" onSubmit={submit}>
              <div className="btm-grid">
                <label className="field f-wide">
                  <span>Full name</span>
                  <input type="text" required value={form.name}
                    onChange={(e) => set('name', e.target.value)} />
                </label>
                <label className="field">
                  <span>Phone</span>
                  <input type="tel" value={form.phone}
                    onChange={(e) => set('phone', e.target.value)} />
                </label>
                <label className="field f-full">
                  <span>Email</span>
                  <input type="email" required value={form.email}
                    onChange={(e) => set('email', e.target.value)} />
                </label>
                <label className="field">
                  <span>Guests</span>
                  <input type="number" min={1} max={50} required value={form.covers}
                    onChange={(e) => set('covers', e.target.value)} />
                </label>
                <label className="field">
                  <span>Date</span>
                  <input type="date" required value={form.date}
                    onChange={(e) => set('date', e.target.value)} />
                </label>
                <label className="field">
                  <span>Time</span>
                  <input type="time" required value={form.time}
                    onChange={(e) => set('time', e.target.value)} />
                </label>
              </div>
              <label className="field btm-msg">
                <span>Special requests (optional)</span>
                <textarea rows={2} value={form.message}
                  onChange={(e) => set('message', e.target.value)} />
              </label>

              {status === 'err' && (
                <p className="form-status err" role="alert">
                  Something went wrong. Please try again or call the restaurant directly.
                </p>
              )}
              <button type="submit" className="btn" disabled={status === 'sending'}>
                {status === 'sending' ? 'Sending…' : 'Request table'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
