// lib/whatsapp.ts — build a WhatsApp click-to-chat (wa.me) deep link.
// Pure util (no server-only) so it works in server and client components.
// Returns null (so every WhatsApp button hides) when EITHER the feature is
// not enabled OR no number is set. The master switch guards against showing
// buttons that point at a non-WhatsApp number (e.g. a landline left in the
// data): keep NEXT_PUBLIC_WHATSAPP_ENABLED unset until real, WhatsApp-capable
// mobile numbers are in `hotel.whatsapp`, then set it to "true".
export function whatsappHref(number: string | null | undefined, message: string): string | null {
  if (process.env.NEXT_PUBLIC_WHATSAPP_ENABLED !== 'true') return null
  const digits = (number ?? '').replace(/\D/g, '')
  if (!digits) return null
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
}
