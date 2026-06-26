import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    // We bypass Vercel's optimizer (it cached stale AVIF variants per source URL
    // with no clean purge, so heroes showed the previous photo in AVIF-requesting
    // browsers). Instead a custom loader serves pre-generated width variants
    // (`-480` / `-960` / full-size base) straight from Supabase Storage, giving a
    // real responsive `srcset` with no optimizer in the path — so the stale-AVIF
    // failure mode can't recur. See lib/imageLoader.ts.
    loader: 'custom',
    loaderFile: './lib/imageLoader.ts',
    // Candidate widths the loader maps onto variants: ≤480 → -480, ≤960 → -960,
    // anything larger → the full-size base file.
    deviceSizes: [480, 960, 1920],
    imageSizes: [256, 480],
  },
}

export default nextConfig
