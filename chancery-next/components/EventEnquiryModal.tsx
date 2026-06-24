'use client'
import { useEffect, useState } from 'react'
import { CloseIcon } from './NavIcons'
import type { HotelSlug } from '@/lib/queries/content'
import './BookTableModal.css' // shared modal chrome (.btm-*)

interface Props {
  open: boolean
  onClose: () => void
  hotel: HotelSlug
  /** Optional pre-selected space (from a venue detail page). */
  venue?: string
}

const EVENT_TYPES = [
  'Wedding',
  'Conference / Meeting',
  'Social Gathering',
  'Private Dining',
  'Corporate Event',
  'Other',
]

const EMPTY = { name: '', email: '', phone: '', eventType: 'Wedding', covers: '', date: '', message: '' }

export function EventEnquiryModal({ open, onClose, hotel, venue = '' }: Props) {
  const [form, setForm] = useState({ ...EMPTY })
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'err'>('idle')

  useEffect(() => {
    if (open) {
      setForm({ ...EMPTY })
      setStatus('idle')
    }
  }, [open])

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
          interest: 'event',
          hotel_interest: hotel,
          event_type: form.eventType,
          venue: venue ?? '',
          covers: Number(form.covers) || null,
          preferred_date: form.date || null,
          message: form.message,
          page: `${hotel}/plan-your-event`,
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
        aria-label="Plan your event"
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
              Our Meetings &amp; Events team will craft a tailored proposal
              {venue ? <> for <strong>{venue}</strong></> : null} and be in touch shortly.
            </p>
            <button type="button" className="btn" onClick={onClose}>Close</button>
          </div>
        ) : (
          <>
            <p className="eyebrow">{venue || 'Meetings & Events'}</p>
            <h2 className="h3">Request a proposal</h2>
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
                <label className="field f-wide">
                  <span>Event type</span>
                  <select value={form.eventType} onChange={(e) => set('eventType', e.target.value)}>
                    {EVENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </label>
                <label className="field">
                  <span>Guests</span>
                  <input type="number" min={1} max={2000} value={form.covers}
                    onChange={(e) => set('covers', e.target.value)} />
                </label>
                <label className="field f-full">
                  <span>Preferred date</span>
                  <input type="date" value={form.date}
                    onChange={(e) => set('date', e.target.value)} />
                </label>
              </div>
              <label className="field btm-msg">
                <span>Tell us about your occasion (optional)</span>
                <textarea rows={2} value={form.message}
                  onChange={(e) => set('message', e.target.value)} />
              </label>

              {status === 'err' && (
                <p className="form-status err" role="alert">
                  Something went wrong. Please try again or email ban.tcp@chanceryhotels.com.
                </p>
              )}
              <button type="submit" className="btn" disabled={status === 'sending'}>
                {status === 'sending' ? 'Sending…' : 'Request proposal'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
