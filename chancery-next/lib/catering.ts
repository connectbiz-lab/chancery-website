// lib/catering.ts — Outdoor Catering (ODC) facts shared by the /catering page and
// the home-page teasers, so a figure can never differ between them. Sources:
// "Chancery Group Deck — Refined" (Outdoor Catering slide) and the F&B fact sheet.
export const ODC = {
  path: '/catering',
  tagline: 'Fine Dining, at Any Scale',
  /** Guests per event, as published in the group deck. */
  guestRange: '50 – 10,000+',
  teaser:
    'Chancery hospitality, wherever you celebrate — weddings, corporate events, state functions and festivals, catered for 50 to 10,000+ guests.',
  /** Shipped from /public so it deploys with the code (no storage dependency). */
  photo: {
    src: '/catering/odc-table-1200.webp',
    srcSmall: '/catering/odc-table-640.webp',
    alt: 'An outdoor banquet table set by Chancery Outdoor Catering',
  },
} as const
