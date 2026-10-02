// lib/destination.ts — content for each hotel's "Destination & Activities" page:
// what to do inside the hotel, and what to see around Bangalore.
//
// In-hotel facts come from the Chancery Group deck (property profiles, F&B
// identity) and the hotel teams' amenities sheet. Places are described in our
// own words and deliberately carry NO distances or travel times — the
// "Directions" link asks Google Maps for the route from the hotel instead.
import type { ComponentType } from 'react'
import {
  DayTripIcon, GalleryIcon, GovernmentIcon, ParkIcon, ShoppingIcon,
} from '@/components/NavIcons'

type Icon = ComponentType<{ size?: number; className?: string }>

export type Experience = {
  kicker: string
  title: string
  body: string
  /** Where the photo comes from: a restaurant's hero image, or the first
   *  gallery photo whose alt text matches. No match → the card has no photo. */
  photo: { restaurant: string } | { galleryAlt: RegExp }
  /** Hotel sub-page the card links to (e.g. 'dining'). */
  to?: string
}

export const HOTEL_EXPERIENCES: Record<string, Experience[]> = {
  pavilion: [
    {
      kicker: 'Rooftop Dining & Microbrewery',
      title: 'Alchemy',
      body: 'Progressive Indian cuisine by Chef Hari Nayak and a microbrewery with seasonal taps, on a rooftop terrace above the city.',
      photo: { restaurant: 'alchemy' },
      to: 'dining',
    },
    {
      kicker: 'All-Day Dining by the Pool',
      title: 'Ithaca',
      body: 'Breakfast to late dinner beside the water — the easiest table in the house at any hour of the day.',
      photo: { restaurant: 'ithaca' },
      to: 'dining',
    },
    {
      kicker: 'Relax',
      title: 'Swimming Pool',
      body: 'Start the morning with a swim, or keep an afternoon free and spend it by the water.',
      photo: { galleryAlt: /swimming pool/i },
    },
    {
      kicker: 'Recharge',
      title: 'Fitness Centre',
      body: 'Keep to your routine while you travel in the hotel’s own fitness centre.',
      photo: { galleryAlt: /fitness/i },
    },
  ],
  chancery: [
    {
      kicker: 'A Culinary Journey to Japan',
      title: 'Matsuri',
      body: 'Omakase menus, live teppanyaki and sake and whisky pairings from Executive Chef Masayoshi Okada’s kitchen.',
      photo: { restaurant: 'matsuri' },
      to: 'dining',
    },
    {
      kicker: 'Sento-Inspired Wellness',
      title: 'Sara Spa',
      body: 'A spa in the Japanese bathhouse tradition — named Best Luxury Hotel Spa in India in 2024.',
      photo: { galleryAlt: /sara spa/i },
    },
    {
      kicker: '24-Hour Coffee Shop',
      title: 'South Parade',
      body: 'Open around the clock for a quiet breakfast meeting, a family lunch or a late supper.',
      photo: { restaurant: 'south-parade' },
      to: 'dining',
    },
  ],
}

export type Place = {
  name: string
  note: string
  /** What to ask Google Maps for; defaults to "<name>, Bengaluru". */
  mapQuery?: string
}

export type PlaceGroup = { Icon: Icon; title: string; places: Place[] }

export const PLACE_GROUPS: PlaceGroup[] = [
  {
    Icon: GovernmentIcon,
    title: 'Heritage & Landmarks',
    places: [
      { name: 'Vidhana Soudha', note: 'Karnataka’s legislature — an imposing granite landmark in the Neo-Dravidian style.' },
      { name: 'Bangalore Palace', note: 'The Tudor-style palace of the Wodeyar royal family, with turrets, carved woodwork and gardens.' },
      { name: 'Tipu Sultan’s Summer Palace', note: 'An eighteenth-century teak palace of carved pillars, arches and balconies.' },
      { name: 'ISKCON Temple', note: 'A hilltop temple complex and one of the city’s most visited places of worship.', mapQuery: 'ISKCON Temple, Rajajinagar, Bengaluru' },
    ],
  },
  {
    Icon: ParkIcon,
    title: 'Parks & Lakes',
    places: [
      { name: 'Cubbon Park', note: 'The green heart of the city — shaded avenues, bandstands and heritage buildings.' },
      { name: 'Lalbagh Botanical Garden', note: 'Historic botanical gardens, known for the Glass House and its flower shows.' },
      { name: 'Ulsoor Lake', note: 'A city lake dotted with islands, at its best early in the morning.' },
    ],
  },
  {
    Icon: GalleryIcon,
    title: 'Arts, Science & Sport',
    places: [
      { name: 'National Gallery of Modern Art', note: 'Modern Indian art in a restored mansion set in its own gardens.' },
      { name: 'Visvesvaraya Industrial & Technological Museum', note: 'Hands-on science galleries that are a favourite with families.' },
      { name: 'Jawaharlal Nehru Planetarium', note: 'Sky-theatre shows and a science park for curious minds.' },
      { name: 'M. Chinnaswamy Stadium', note: 'The home of cricket in Bengaluru.' },
    ],
  },
  {
    Icon: ShoppingIcon,
    title: 'Shopping & Streets',
    places: [
      { name: 'MG Road & Brigade Road', note: 'The city’s best-known high streets — shops, cafés and an evening walk.', mapQuery: 'Brigade Road, Bengaluru' },
      { name: 'Commercial Street', note: 'A lively maze of clothing, jewellery and fabric shops.' },
      { name: 'UB City', note: 'Luxury boutiques and restaurants around an open-air piazza.' },
    ],
  },
  {
    Icon: DayTripIcon,
    title: 'Day Trips',
    places: [
      { name: 'Nandi Hills', note: 'A hill retreat north of the city, loved for its sunrise views.', mapQuery: 'Nandi Hills, Karnataka' },
      { name: 'Mysuru', note: 'The city of palaces — Mysore Palace, Chamundi Hill and the markets make a full day out.', mapQuery: 'Mysore Palace, Mysuru' },
      { name: 'Bannerghatta National Park', note: 'Safaris and a butterfly park on the city’s southern edge.' },
    ],
  },
]
