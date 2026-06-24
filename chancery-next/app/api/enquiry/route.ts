// app/api/enquiry/route.ts — capture an enquiry as a `lead` row.
// Phase 5 adds department routing + Resend/Slack notification on top of this.
import { createAdminClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/supabase/types'

type Interest = Database['public']['Enums']['lead_interest']
type HotelInterest = Database['public']['Enums']['hotel_interest']

const INTERESTS: Interest[] = ['stay', 'dining', 'event', 'catering', 'careers', 'other']
const HOTEL_INTERESTS: HotelInterest[] = ['chancery', 'pavilion', 'either']

export async function POST(req: Request) {
  let body: Record<string, unknown>
  try { body = await req.json() } catch { return Response.json({ ok: false, error: 'Bad JSON' }, { status: 400 }) }

  const name = String(body.name ?? '').trim()
  const email = String(body.email ?? '').trim()
  if (!name || !/.+@.+\..+/.test(email)) {
    return Response.json({ ok: false, error: 'Name and a valid email are required.' }, { status: 400 })
  }

  const interest: Interest = INTERESTS.includes(String(body.interest) as Interest) ? (String(body.interest) as Interest) : 'other'
  const hotel_interest: HotelInterest = HOTEL_INTERESTS.includes(String(body.hotel_interest) as HotelInterest) ? (String(body.hotel_interest) as HotelInterest) : 'either'
  const coversNum = Number(body.covers)
  const lead = {
    name, email,
    phone: String(body.phone ?? '').trim(),
    interest, hotel_interest,
    message: String(body.message ?? '').trim(),
    page: String(body.page ?? '').trim(),
    restaurant: String(body.restaurant ?? '').trim(),
    venue: String(body.venue ?? '').trim(),
    event_type: String(body.event_type ?? '').trim(),
    covers: Number.isFinite(coversNum) && coversNum > 0 ? Math.floor(coversNum) : null,
    preferred_date: body.preferred_date ? String(body.preferred_date) : null,
    preferred_time: String(body.preferred_time ?? '').trim(),
  }

  const supa = createAdminClient()
  const { error } = await supa.from('lead').insert(lead)
  if (error) return Response.json({ ok: false, error: error.message }, { status: 500 })
  return Response.json({ ok: true })
}
