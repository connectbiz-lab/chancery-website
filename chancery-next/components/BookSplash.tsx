'use client'
import { useEffect } from 'react'

export function BookSplash({ url, hotel }: { url: string; hotel: 'chancery' | 'pavilion' }) {
  useEffect(() => {
    // Brief pause so the user sees the brand splash, then go.
    const t = setTimeout(() => { window.location.href = url }, 750)
    return () => clearTimeout(t)
  }, [url])

  return (
    <main
      className="book-splash"
      style={{
        minHeight: '100dvh',
        display: 'grid',
        placeItems: 'center',
        background: 'var(--c-navy)',
        color: 'var(--c-ivory)',
        padding: '2rem',
        textAlign: 'center',
      }}
    >
      <div>
        <p className="eyebrow center" style={{ color: 'var(--c-gold-soft)' }}>One moment</p>
        <h1 className="h1" style={{ color: 'var(--c-ivory)' }}>Booking your stay</h1>
        <p style={{ color: 'rgba(246,241,231,0.85)', maxWidth: '44ch', margin: '0 auto' }}>
          Redirecting to our secure booking system at{' '}
          {hotel === 'chancery' ? 'The Chancery Hotel, Lavelle Road' : 'The Chancery Pavilion, Residency Road'}.
        </p>
        <noscript><a href={url} style={{ color: 'var(--c-gold-soft)' }}>Continue to booking</a></noscript>
      </div>
    </main>
  )
}
