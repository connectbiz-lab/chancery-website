// supabase/seed/migrate.ts — one-time loader: legacy Django SQLite + media → Supabase.
// Run: npm run migrate  (from chancery-next/). Idempotent: clears target content tables, reloads.
import { config } from 'dotenv'
import { fileURLToPath } from 'node:url'
import { dirname, join, relative } from 'node:path'
import { randomUUID } from 'node:crypto'
import { readdirSync, statSync, readFileSync } from 'node:fs'
import Database from 'better-sqlite3'
import { createClient } from '@supabase/supabase-js'

const HERE = dirname(fileURLToPath(import.meta.url))           // chancery-next/supabase/seed
const REPO_ROOT = join(HERE, '..', '..', '..')                // repo root
const ENV_PATH = join(HERE, '..', '..', '.env.local')         // chancery-next/.env.local
const SQLITE_PATH = join(REPO_ROOT, 'backend', 'db.sqlite3')
const MEDIA_ROOT = join(REPO_ROOT, 'backend', 'media')

config({ path: ENV_PATH })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!SUPABASE_URL || !SERVICE_KEY) {
  throw new Error(`Missing env. Need NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in ${ENV_PATH}`)
}

const supa = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } })
const db = new Database(SQLITE_PATH, { readonly: true, fileMustExist: true })

const EXPECTED: Record<string, number> = {
  site_content: 1, hotel: 2, room_category: 7, room_image: 14, restaurant: 5,
  restaurant_image: 18, venue: 10, venue_image: 3, offer: 8, gallery_image: 37,
  faq_section: 5, faq_item: 15, testimonial: 4, page: 25, page_section: 0,
  department_contact: 11,
}

const CONTENT_TYPES: Record<string, string> = {
  '.webp': 'image/webp', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.png': 'image/png', '.svg': 'image/svg+xml', '.gif': 'image/gif',
}

function walkFiles(dir: string): string[] {
  const out: string[] = []
  for (const entry of readdirSync(dir)) {
    if (entry.startsWith('.')) continue            // skip .DS_Store and dotfiles
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) out.push(...walkFiles(full))
    else out.push(full)
  }
  return out
}

async function uploadMedia(): Promise<number> {
  const files = walkFiles(MEDIA_ROOT)
  let uploaded = 0
  for (const full of files) {
    const objectPath = relative(MEDIA_ROOT, full).split('\\').join('/')   // posix paths in bucket
    const ext = objectPath.slice(objectPath.lastIndexOf('.')).toLowerCase()
    const contentType = CONTENT_TYPES[ext] ?? 'application/octet-stream'
    const { error } = await supa.storage.from('media').upload(objectPath, readFileSync(full), {
      contentType, upsert: true,
    })
    if (error) throw new Error(`Upload failed for ${objectPath}: ${error.message}`)
    uploaded++
  }
  console.log(`Uploaded ${uploaded} media files.`)
  return uploaded
}

async function main() {
  console.log('Source DB:', SQLITE_PATH)
  await uploadMedia()
}

main().then(() => { db.close(); process.exit(0) })
      .catch((e) => { console.error(e); db.close(); process.exit(1) })
