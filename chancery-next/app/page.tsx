// app/page.tsx
import { createClient } from '@/lib/supabase/server'

export default async function Home() {
  const supabase = await createClient()
  const { data: hotels, error } = await supabase.from('hotel').select('slug,name').order('order')
  return (
    <main style={{ padding: 24, fontFamily: 'system-ui' }}>
      <h1>Chancery — data layer smoke test</h1>
      {error && <p style={{ color: 'crimson' }}>Error: {error.message}</p>}
      <ul>{(hotels ?? []).map((h) => <li key={h.slug}>{h.name}</li>)}</ul>
      <p>{(hotels ?? []).length} hotel(s) found.</p>
    </main>
  )
}
