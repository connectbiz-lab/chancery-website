// /llms.txt — the hotels in plain Markdown, for the AI assistants (ChatGPT,
// Claude, Perplexity, Gemini) that read a site to answer questions about it.
// Built from the same CMS rows the pages render, never a hand-copied file, so
// it can't drift from the site. Facts the CMS doesn't hold are left out, not
// filled in: a capacity appears only where the venue row has one.
import { buildSynxisUrl } from '@/lib/booking'
import {
  getFaq, getHotels, getRestaurants, getRooms, getSiteContent, getVenues, type HotelSlug,
} from '@/lib/queries/content'
import { hotelHomePath } from '@/lib/routes'
import { GOOGLE_LISTING, SITE_URL } from '@/lib/seo'

export const revalidate = 3600

const one = (s: string | null | undefined) => (s ?? '').replace(/\s+/g, ' ').trim()

export async function GET() {
  const [site, hotels, rooms, restaurants, venues, faq] = await Promise.all([
    getSiteContent(), getHotels(), getRooms(), getRestaurants(), getVenues(), getFaq(),
  ])

  const out: string[] = []
  out.push(`# ${site.site_title}`, '')
  const summary = [one(site.tagline), one(site.meta_description)].filter(Boolean).join('. ')
  if (summary) out.push(`> ${summary}`, '')
  out.push(`- Website: ${SITE_URL}/`)
  const profiles = [site.instagram_url, site.facebook_url, site.tripadvisor_url].filter(Boolean)
  if (profiles.length) out.push(`- Official profiles: ${profiles.join(' · ')}`)
  out.push(`- Hotels: ${hotels.map((h) => `${h.name} (${h.location})`).join('; ')}`, '')

  for (const h of hotels) {
    const slug = h.slug as HotelSlug
    const home = `${SITE_URL}${hotelHomePath(slug)}`
    const listing = GOOGLE_LISTING[slug]
    out.push(`## ${h.name}`, '')
    if (one(h.intro_body)) out.push(one(h.intro_body), '')
    out.push(`- Address: ${one(h.address)}`)
    out.push(`- Phone: ${[h.phone, h.phone_alt].filter(Boolean).join(' · ')}`)
    if (h.email) out.push(`- Email: ${h.email}`)
    out.push(`- Page: ${home}`)
    out.push(`- Book a room (official booking engine): ${buildSynxisUrl({ hotel: slug })}`)
    if (h.rooms_count) out.push(`- Rooms: ${h.rooms_count}`)
    if (listing) out.push(`- Google listing: ${listing.mapsUrl}`, `- Coordinates: ${listing.lat}, ${listing.lng}`)
    if (h.tripadvisor_url) out.push(`- Tripadvisor: ${h.tripadvisor_url}`)
    out.push('')

    const hotelRooms = rooms.filter((r) => r.hotel?.slug === slug)
    if (hotelRooms.length) {
      out.push('### Rooms and suites', '')
      for (const r of hotelRooms) {
        const facts = [
          r.size_sqft ? `${r.size_sqft} sq ft` : '',
          r.max_guests ? `up to ${r.max_guests} guests` : '',
          one(r.bed_type),
        ].filter(Boolean)
        out.push(`- ${r.name}${facts.length ? ` — ${facts.join(', ')}` : ''}`)
      }
      out.push(`- All rooms: ${SITE_URL}/${slug}/accommodation`, '')
    }

    const hotelRestaurants = restaurants.filter((r) => r.hotel?.slug === slug)
    if (hotelRestaurants.length) {
      out.push('### Restaurants and bars', '')
      for (const r of hotelRestaurants) {
        const facts = [one(r.cuisine), r.timing ? `Hours: ${one(r.timing)}` : ''].filter(Boolean)
        out.push(`- ${r.name}${facts.length ? ` — ${facts.join('. ')}` : ''}`)
      }
      out.push(`- Dining page: ${SITE_URL}/${slug}/dining`, '')
    }

    const hotelVenues = venues.filter((v) => v.hotel?.slug === slug)
    if (hotelVenues.length) {
      out.push('### Event and meeting venues', '')
      for (const v of hotelVenues) {
        const facts = [
          v.guests_max != null ? `up to ${v.guests_max} guests` : '',
          v.area_sqft != null ? `${v.area_sqft.toLocaleString('en-IN')} sq ft` : '',
        ].filter(Boolean)
        out.push(`- ${v.name}${facts.length ? ` — ${facts.join(', ')}` : ''}: ${SITE_URL}/${slug}/plan-your-event/${v.slug}`)
      }
      out.push(`- Event enquiries: ${SITE_URL}/${slug}/plan-your-event`, '')
    }

    const contacts = h.departments.filter((d) => d.phone || d.email)
    if (contacts.length) {
      out.push('### Contacts', '')
      for (const d of contacts) out.push(`- ${d.label}: ${[d.phone, d.email].filter(Boolean).join(' · ')}`)
      out.push('')
    }

    // FAQ sections are titled "<hotel name> · <topic>".
    const sections = faq.filter((s) => s.title.startsWith(`${h.name} ·`))
    if (sections.length) {
      out.push('### Frequently asked questions', '')
      for (const s of sections) {
        for (const it of s.items) out.push(`**${one(it.question)}**`, one(it.answer), '')
      }
    }
  }

  // Any section not titled for one hotel applies to the group.
  const shared = faq.filter((s) => !hotels.some((h) => s.title.startsWith(`${h.name} ·`)))
  if (shared.some((s) => s.items.length)) {
    out.push('## Frequently asked questions — the group', '')
    for (const s of shared) for (const it of s.items) out.push(`**${one(it.question)}**`, one(it.answer), '')
  }

  out.push('## More', '')
  out.push(`- About the group: ${SITE_URL}/about`)
  out.push(`- Every room, both hotels: ${SITE_URL}/rooms`)
  out.push(`- Outdoor catering: ${SITE_URL}/catering`)
  out.push(`- FAQ: ${SITE_URL}/faq`)
  out.push(`- Site map: ${SITE_URL}/site-map`, '')

  return new Response(out.join('\n'), {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  })
}
