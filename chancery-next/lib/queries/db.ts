// lib/queries/db.ts — server-side Supabase client for PUBLIC reads (RLS public-read).
// No cookies -> pages can be statically rendered + ISR. Wrap reads in cache() for
// per-request dedupe.
import { createClient } from '@supabase/supabase-js'
import { cache } from 'react'
import type { Database } from '@/lib/supabase/types'

export const db = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { persistSession: false } },
)

export { cache }
