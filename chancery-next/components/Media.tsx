// components/Media.tsx — next/image from a Supabase Storage path, filling a sized container.
import Image from 'next/image'
import { mediaUrl, HERO_BLUR } from '@/lib/media'

export function Media({
  path, alt, sizes = '100vw', priority = false, blur = false, className,
}: { path: string | null | undefined; alt: string; sizes?: string; priority?: boolean; blur?: boolean; className?: string }) {
  const src = mediaUrl(path)
  if (!src) return <span className={`figure placeholder ${className ?? ''}`} aria-hidden />
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      placeholder={blur ? 'blur' : 'empty'}
      blurDataURL={blur ? HERO_BLUR : undefined}
      className={className}
      style={{ objectFit: 'cover' }}
    />
  )
}
