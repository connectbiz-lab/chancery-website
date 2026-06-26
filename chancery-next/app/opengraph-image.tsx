// app/opengraph-image.tsx — site-wide branded Open Graph card (1200×630).
// Used as the default social-share image whenever a page has no specific photo.
import { ImageResponse } from 'next/og'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = 'Chancery Hotels — Luxury Hotels in Bangalore'

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #1a2238 0%, #2b3a5c 100%)',
          color: '#f6f1e7',
          fontFamily: 'Georgia, serif',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 30, letterSpacing: 8, color: '#c9a85c', textTransform: 'uppercase' }}>
          The Chancery Group of Hotels
        </div>
        <div style={{ fontSize: 88, fontWeight: 600, marginTop: 24 }}>Chancery Hotels</div>
        <div style={{ fontSize: 36, marginTop: 24, color: 'rgba(246,241,231,0.85)' }}>
          Luxury Hotels in Bangalore · Since 1968
        </div>
      </div>
    ),
    { ...size },
  )
}
