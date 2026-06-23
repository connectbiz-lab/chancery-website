// lib/queries/content.ts — server-side typed reads for the public site.
import { db, cache } from './db'
import type { Database } from '@/lib/supabase/types'

type PageKind = Database['public']['Enums']['page_kind']

const DEPARTMENT_ORDER = ['reservations', 'dining', 'sales', 'events', 'catering', 'careers', 'general'] as const
const DEPARTMENT_LABELS: Record<string, string> = {
  reservations: 'Reservations', dining: 'Dining', sales: 'Sales', events: 'Meetings & Events',
  catering: 'Outdoor Catering', careers: 'Careers', general: 'General Enquiry',
}

export type HotelSlug = 'chancery' | 'pavilion'

export const linesOf = (text: string | null): string[] =>
  (text ?? '').split('\n').map((l) => l.trim()).filter(Boolean)

export const getSiteContent = cache(async () => {
  const { data, error } = await db.from('site_content').select('*').eq('id', 1).single()
  if (error) throw error
  return data
})

export const getHotels = cache(async () => {
  const { data, error } = await db.from('hotel').select('*').order('order')
  if (error) throw error
  return Promise.all((data ?? []).map(withDepartments))
})

export const getHotel = cache(async (slug: string) => {
  // hotel.slug is a generated enum union ("chancery" | "pavilion"); callers pass a
  // raw route param string, so cast for the typed .eq().
  const { data, error } = await db.from('hotel').select('*').eq('slug', slug as HotelSlug).maybeSingle()
  if (error) throw error
  return data ? withDepartments(data) : null
})

async function withDepartments<T extends { slug: string }>(hotel: T) {
  const { data } = await db
    .from('department_contact')
    .select('department, notify_email, phone')
    .or(`hotel.eq.${hotel.slug},hotel.eq.both`)
    .eq('is_active', true)
    .eq('public', true)
  const departments = (data ?? [])
    .map((r) => ({
      department: r.department,
      label: DEPARTMENT_LABELS[r.department] ?? r.department,
      email: r.notify_email,
      phone: r.phone,
    }))
    .sort((a, b) => DEPARTMENT_ORDER.indexOf(a.department as never) - DEPARTMENT_ORDER.indexOf(b.department as never))
  return { ...hotel, departments }
}

// Rooms — join hotel for slug, attach images + amenities_list.
export const getRooms = cache(async (hotelSlug?: string) => {
  const { data, error } = await db.from('room_category')
    .select('*, hotel:hotel_id(slug,name,short_name,location), images:room_image(image,alt,order)')
    .order('order')
  if (error) throw error
  return (data ?? [])
    .filter((r: any) => !hotelSlug || r.hotel?.slug === hotelSlug)
    .map((r: any) => ({
      ...r,
      amenities_list: linesOf(r.amenities),
      images: (r.images ?? []).sort((a: any, b: any) => a.order - b.order),
    }))
})

export const getRestaurants = cache(async (hotelSlug?: string) => {
  const { data, error } = await db.from('restaurant')
    .select('*, hotel:hotel_id(slug,name,short_name,location), images:restaurant_image(image,alt,order)')
    .order('order')
  if (error) throw error
  return (data ?? [])
    .filter((r: any) => !hotelSlug || r.hotel?.slug === hotelSlug)
    .map((r: any) => ({ ...r, images: (r.images ?? []).sort((a: any, b: any) => a.order - b.order) }))
})

export const getVenues = cache(async (hotelSlug?: string) => {
  const { data, error } = await db.from('venue')
    .select('*, hotel:hotel_id(slug,name,short_name,location), images:venue_image(image,alt,order)')
    .order('order')
  if (error) throw error
  return (data ?? [])
    .filter((r: any) => !hotelSlug || r.hotel?.slug === hotelSlug)
    .map((r: any) => ({ ...r, images: (r.images ?? []).sort((a: any, b: any) => a.order - b.order) }))
})

export const getOffers = cache(async (hotelSlug?: string) => {
  const { data, error } = await db.from('offer').select('*, hotel:hotel_id(slug)').order('order')
  if (error) throw error
  // Offers with null hotel are shared (apply to both); hotel-scoped match the slug.
  return (data ?? []).filter((o: any) => !hotelSlug || !o.hotel || o.hotel.slug === hotelSlug)
})

export const getGallery = cache(async (hotelSlug?: string, category?: string) => {
  const { data, error } = await db.from('gallery_image').select('*, hotel:hotel_id(slug)').order('order')
  if (error) throw error
  return (data ?? [])
    .filter((g: any) => !hotelSlug || !g.hotel || g.hotel.slug === hotelSlug)
    .filter((g: any) => !category || g.category === category)
})

export const getTestimonials = cache(async () => {
  const { data, error } = await db.from('testimonial').select('*').order('order')
  if (error) throw error
  return data ?? []
})

export const getFaq = cache(async () => {
  const { data, error } = await db.from('faq_section')
    .select('*, items:faq_item(question,answer,order)').order('order')
  if (error) throw error
  return (data ?? []).map((s: any) => ({ ...s, items: (s.items ?? []).sort((a: any, b: any) => a.order - b.order) }))
})

export const getPage = cache(async (kind: string, hotelSlug?: string) => {
  // PostgREST embedded filters (.eq('hotel.slug', ...)) only null out the embed,
  // they don't filter the parent `page` rows — so a hotel-scoped `kind` returns
  // BOTH hotels' rows. Fetch by kind, then JS-filter on hotel.slug (authoritative).
  const { data, error } = await db
    .from('page')
    .select('*, hotel:hotel_id(slug), sections:page_section(*)')
    .eq('kind', kind as PageKind)
  if (error) throw error
  const match = (data ?? []).find((p: any) =>
    hotelSlug ? p.hotel?.slug === hotelSlug : !p.hotel_id,
  )
  if (!match) return null
  return { ...match, sections: ((match as any).sections ?? []).sort((a: any, b: any) => a.order - b.order) }
})
