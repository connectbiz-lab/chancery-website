'use client'
import { useEffect, useRef, useState } from 'react'

/** Adds class `in` to the wrapper when it scrolls into view (one-shot),
 *  mirroring the legacy useReveal() hook + `.reveal`/`.in` CSS. */
export function Reveal({ children, className = '', as: Tag = 'div' }: {
  children: React.ReactNode; className?: string; as?: 'div' | 'section'
}) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [shown, setShown] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el || shown) return
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) { setShown(true); io.disconnect() }
    }, { threshold: 0.05, rootMargin: '0px 0px -60px 0px' })
    io.observe(el)
    return () => io.disconnect()
  }, [shown])
  return <Tag ref={ref as never} className={`reveal ${shown ? 'in' : ''} ${className}`}>{children}</Tag>
}
