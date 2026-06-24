import Link from 'next/link'

export const metadata = { title: 'Page not found', robots: { index: false, follow: false } }

export default function NotFound() {
  return (
    <section className="section" style={{ minHeight: '70dvh', display: 'grid', placeItems: 'center' }}>
      <div className="container narrow text-center">
        <p className="eyebrow center">404</p>
        <h1 className="display">Page not found</h1>
        <p className="lede" style={{ margin: '0 auto 2rem' }}>
          The page you&apos;re looking for has moved or doesn&apos;t exist. Try the home page,
          or explore one of our two hotels.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/" className="btn">Home</Link>
          <Link href="/chancery" className="btn ghost">The Chancery Hotel</Link>
          <Link href="/pavilion" className="btn ghost">Chancery Pavilion</Link>
        </div>
      </div>
    </section>
  )
}
