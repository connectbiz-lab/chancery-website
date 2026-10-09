// lib/awards.ts — every award the group lists, in one place. The hotel awards
// pages (/[hotel]/awards) and the About page both render from this, so a year or
// title can never differ between surfaces. Source: "Chancery Group Deck —
// Refined" (Recognised Excellence, Alchemy and Matsuri slides) plus the awards
// already published on the site. No awarding body is named unless the source
// names it.
export type AwardScope = 'pavilion' | 'chancery' | 'group'

export type Award = {
  title: string
  /** Awarding body, when the source names one. */
  by?: string
  /** Year(s) as published, e.g. "2023, 2024 & 2025". */
  years: string
}

export type AwardGroup = {
  /** Which hotel this belongs to; 'group' awards show on both hotels' pages. */
  scope: AwardScope
  /** Who won it — the hotel, a restaurant, or a group division. */
  owner: string
  /** Whose logo heads the card: the hotel's, the group's, or a restaurant's (by slug). */
  mark: { kind: 'hotel' } | { kind: 'group' } | { kind: 'restaurant'; slug: string }
  awards: Award[]
}

export const AWARD_GROUPS: AwardGroup[] = [
  {
    scope: 'pavilion', owner: 'The Chancery Pavilion', mark: { kind: 'hotel' },
    awards: [{ title: 'Travellers\u2019 Choice', by: 'Tripadvisor', years: '2023' }],
  },
  {
    // Headed by the Pavilion's logo: the stored Alchemy mark is a white placeholder
    // SVG, not the restaurant's real logo. Switch to { kind: 'restaurant', slug:
    // 'alchemy' } once the real logo is uploaded.
    scope: 'pavilion', owner: 'Alchemy', mark: { kind: 'hotel' },
    awards: [
      { title: 'Best Modern Indian Premium Dining', by: 'Times Food & Nightlife Awards', years: '2023, 2024 & 2025' },
      { title: 'Best Microbrewery, Luxurious Nightout', by: 'Times Food & Nightlife Awards', years: '2025' },
      { title: 'Best Modern Indian Restaurant', by: 'EazyDiner Foodie Awards', years: '2019' },
      { title: 'Noteworthy Newcomer \u2014 Modern Indian Cuisine', by: 'Times Food & Nightlife Awards', years: '2019' },
      { title: 'Grub & Dine Food Awards', by: '93.5 Red FM', years: '2023' },
      { title: 'Beer of India \u2014 Gold (Fruited Sour Ale), Silver (American Porter), Silver (Experimental Grain Beer)', by: 'Brewer World', years: '2023' },
    ],
  },
  {
    scope: 'chancery', owner: 'The Chancery Hotel', mark: { kind: 'hotel' },
    awards: [{ title: 'Travellers\u2019 Choice', by: 'Tripadvisor', years: '2025' }],
  },
  {
    scope: 'chancery', owner: 'Matsuri', mark: { kind: 'restaurant', slug: 'matsuri' },
    awards: [
      { title: 'Best Japanese Premium Dining', by: 'Times Food & Nightlife Awards', years: '2025' },
      { title: 'Epicurean Restaurant Award', years: '2024' },
      { title: 'Best Sushi', by: 'EazyDiner Food Awards', years: '2017' },
      { title: 'Best Japanese Restaurant', by: 'Times Food Awards', years: '2014, 2015 & 2016' },
    ],
  },
  {
    scope: 'chancery', owner: 'Sara Spa', mark: { kind: 'hotel' },
    awards: [{ title: 'Best Luxury Hotel Spa in India', by: 'Luxury Lifestyle Awards', years: '2024' }],
  },
  {
    scope: 'group', owner: 'The Chancery Group', mark: { kind: 'group' },
    awards: [{ title: 'Excellence in Hospitality', by: 'FHRAI', years: '2022' }],
  },
  {
    scope: 'group', owner: 'Catering & Events', mark: { kind: 'group' },
    awards: [{ title: 'Best Outdoor Caterer', by: 'Event Capital Awards', years: '2023' }],
  },
]

/** A hotel's own awards first, then the group-level ones it shares. */
export const awardsFor = (hotel: string) => [
  ...AWARD_GROUPS.filter((g) => g.scope === hotel),
  ...AWARD_GROUPS.filter((g) => g.scope === 'group'),
]

/** "Tripadvisor, 2023" / "2024" — the line beside an award's title. */
export const awardLine = (a: Award) => (a.by ? `${a.by}, ${a.years}` : a.years)

/** Total individual awards in a list of groups (code-computed, never typed). */
export const awardCount = (groups: AwardGroup[]) => groups.reduce((n, g) => n + g.awards.length, 0)
