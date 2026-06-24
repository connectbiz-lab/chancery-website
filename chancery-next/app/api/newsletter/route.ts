// app/api/newsletter/route.ts — insert a subscriber (full provider sync is Phase 5).
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  const { email } = await req.json().catch(() => ({ email: '' }))
  if (!email || !/.+@.+\..+/.test(email)) return Response.json({ ok: false, error: 'Invalid email' }, { status: 400 })
  const supa = createAdminClient()
  const { error } = await supa.from('newsletter_subscriber').upsert({ email }, { onConflict: 'email' })
  if (error) return Response.json({ ok: false, error: error.message }, { status: 500 })
  return Response.json({ ok: true })
}
