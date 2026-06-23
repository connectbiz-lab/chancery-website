// lib/seo.ts — Metadata builder mirroring the legacy PageMeta behaviour.
import type { Metadata } from 'next'
import { mediaUrl } from './media'

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.chanceryhotels.com'
const DEFAULT_OG = `${SITE_URL}/og-cover.jpg`

export function buildMetadata(opts: {
  title: string
  description?: string
  path: string                 // e.g. "/chancery/dining"
  ogImagePath?: string | null  // Storage path; falls back to default OG
  noindex?: boolean
}): Metadata {
  const url = `${SITE_URL}${opts.path}`
  const ogImage = (opts.ogImagePath && mediaUrl(opts.ogImagePath)) || DEFAULT_OG
  return {
    title: opts.title,
    description: opts.description,
    alternates: { canonical: url },
    robots: opts.noindex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      type: 'website', siteName: 'Chancery Hotels', title: opts.title,
      description: opts.description, url, images: [ogImage],
    },
    twitter: { card: 'summary_large_image', title: opts.title, description: opts.description, images: [ogImage] },
  }
}

export function organizationJsonLd(site: { site_title: string; instagram_url: string; facebook_url: string; tripadvisor_url: string }) {
  return {
    '@context': 'https://schema.org', '@type': 'Organization',
    name: site.site_title, url: SITE_URL,
    sameAs: [site.instagram_url, site.facebook_url, site.tripadvisor_url].filter(Boolean),
  }
}
