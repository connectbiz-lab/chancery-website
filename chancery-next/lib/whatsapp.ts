// lib/whatsapp.ts — build a WhatsApp click-to-chat (wa.me) deep link.
// Pure util (no server-only) so it works in server and client components.
// Returns null when no number is set, so callers can hide the button cleanly.
export function whatsappHref(number: string | null | undefined, message: string): string | null {
  const digits = (number ?? '').replace(/\D/g, '')
  if (!digits) return null
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
}
