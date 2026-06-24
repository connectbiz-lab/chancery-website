import type { NextConfig } from 'next'

// Allow next/image to optimize images served from Supabase Storage.
const supabaseUrl = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'http://127.0.0.1:54321')

const nextConfig: NextConfig = {
  images: {
    // Serve Supabase Storage images directly without Vercel's optimizer.
    // The optimizer was caching stale/wrong AVIF variants per source URL with
    // no clean purge, so hero images showed the previous photo in browsers
    // (which request AVIF) even though the raw WebP was correct. The stored
    // images are already compressed WebP (~30-150KB), so skipping optimization
    // costs little and removes the stale-variant failure mode entirely.
    unoptimized: true,
    // Local Supabase Storage is served from 127.0.0.1; Next 16 blocks
    // optimizing local-IP hosts by default. Allow it only when the Supabase
    // host is a local address (dev) — production uses a real hostname.
    dangerouslyAllowLocalIP: ['127.0.0.1', 'localhost', '::1'].includes(supabaseUrl.hostname),
    remotePatterns: [
      {
        protocol: supabaseUrl.protocol.replace(':', '') as 'http' | 'https',
        hostname: supabaseUrl.hostname,
        port: supabaseUrl.port || undefined,
        pathname: '/storage/v1/object/public/media/**',
      },
    ],
  },
}

export default nextConfig
