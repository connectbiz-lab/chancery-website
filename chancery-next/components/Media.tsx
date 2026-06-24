// components/Media.tsx — next/image from a Supabase Storage path, filling a sized container.
import Image from 'next/image'
import { mediaUrl } from '@/lib/media'

export function Media({
  path, alt, sizes = '100vw', priority = false, className,
}: { path: string | null | undefined; alt: string; sizes?: string; priority?: boolean; className?: string }) {
  const src = mediaUrl(path)
  if (!src) return <span className={`figure placeholder ${className ?? ''}`} aria-hidden />
  return <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className={className} style={{ objectFit: 'cover' }} />
}
