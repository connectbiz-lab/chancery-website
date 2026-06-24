'use client'
import { useState } from 'react'
import type { HotelSlug } from '@/lib/queries/content'

interface FormState {
  name: string
  email: string
  phone: string
  interest: string
  hotel_interest: HotelSlug | 'either'
  message: string
}

/** Contact enquiry form — POSTs to /api/enquiry as a lead. Ported from the
 *  legacy ContactPage form (markup, fields, success/error UI preserved). */
export function ContactForm({ hotel }: { hotel: HotelSlug }) {
  const [form, setForm] = useState<FormState>({
    name: '', email: '', phone: '', interest: 'stay',
    hotel_interest: hotel, message: '',
  })
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'err'>('idle')

  function update<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending')
    try {
      const res = await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...form, page: `${hotel}/contact-us` }),
      })
      if (!res.ok) throw new Error('request failed')
      setStatus('ok')
      setForm({ name: '', email: '', phone: '', interest: 'stay', hotel_interest: hotel, message: '' })
    } catch {
      setStatus('err')
    }
  }

  return (
    <div className="enquiry-band">
      <div className="enquiry-band__head">
        <p className="eyebrow">Enquiry form</p>
        <h2 className="h3">Send us a message</h2>
      </div>
      <form className="enquiry-form" onSubmit={submit}>
        <div className="enquiry-grid">
          <div className="field">
            <label htmlFor="c-name">Full name</label>
            <input id="c-name" type="text" required value={form.name}
              onChange={(e) => update('name', e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="c-email">Email</label>
            <input id="c-email" type="email" required value={form.email}
              onChange={(e) => update('email', e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="c-phone">Phone (optional)</label>
            <input id="c-phone" type="tel" value={form.phone}
              onChange={(e) => update('phone', e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="c-interest">I'm interested in</label>
            <select id="c-interest" value={form.interest}
              onChange={(e) => update('interest', e.target.value)}>
              <option value="stay">A stay / room booking</option>
              <option value="dining">Dining reservation</option>
              <option value="event">An event or wedding</option>
              <option value="catering">Outdoor catering</option>
              <option value="careers">Careers</option>
              <option value="other">Something else</option>
            </select>
          </div>
          <div className="field field--wide">
            <label htmlFor="c-hotel">Property preference</label>
            <select id="c-hotel" value={form.hotel_interest}
              onChange={(e) => update('hotel_interest', e.target.value as HotelSlug | 'either')}>
              <option value="chancery">The Chancery Hotel — Lavelle Road</option>
              <option value="pavilion">Chancery Pavilion — Residency Road</option>
              <option value="either">No preference</option>
            </select>
          </div>
          <div className="field field--full">
            <label htmlFor="c-message">Message</label>
            <textarea id="c-message" rows={3} value={form.message}
              onChange={(e) => update('message', e.target.value)} />
          </div>
        </div>

        <div className="enquiry-actions">
          {status === 'ok' && (
            <p className="form-status ok" role="status">
              Thank you. Our team will be in touch shortly.
            </p>
          )}
          {status === 'err' && (
            <p className="form-status err" role="alert">
              Something went wrong. Please try again or call us directly.
            </p>
          )}
          <button type="submit" className="btn" disabled={status === 'sending'}>
            {status === 'sending' ? 'Sending…' : 'Send enquiry'}
          </button>
        </div>
      </form>
    </div>
  )
}
