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

// Old-integer-id -> new-uuid maps, keyed by target table name. Populated as parents load.
const idMaps: Record<string, Map<number, string>> = {}

// Delete order = reverse FK dependency, so children go before parents.
const DELETE_ORDER = [
  'page_section', 'page', 'faq_item', 'faq_section', 'gallery_image',
  'venue_image', 'venue', 'restaurant_image', 'restaurant', 'room_image',
  'room_category', 'offer', 'testimonial', 'hotel', 'site_content', 'department_contact',
]

async function resetTarget() {
  for (const t of DELETE_ORDER) {
    const { error } = await supa.from(t).delete().not('id', 'is', null)   // matches all rows
    if (error) throw new Error(`Reset failed for ${t}: ${error.message}`)
  }
  console.log('Target content tables cleared.')
}

type TableSpec = {
  pg: string                 // target Postgres table
  sqlite: string             // source Django table
  fk?: { col: string; parent: string }   // FK column to remap and the parent table whose idMap to use
  boolCols?: string[]        // SQLite 0/1 -> boolean
  enumBlankCols?: string[]   // '' -> null (blank enum fields)
  keepIntId?: boolean        // site_content: keep integer id (=1), no uuid/map
}

async function migrateTable(spec: TableSpec) {
  const rows = db.prepare(`select * from ${spec.sqlite}`).all() as Record<string, unknown>[]
  idMaps[spec.pg] = new Map<number, string>()
  const out = rows.map((r) => {
    const o: Record<string, unknown> = { ...r }
    const oldId = r.id as number
    if (!spec.keepIntId) {
      const newId = randomUUID()
      idMaps[spec.pg].set(oldId, newId)
      o.id = newId
    }
    if (spec.fk) {
      const raw = r[spec.fk.col] as number | null
      if (raw == null) o[spec.fk.col] = null
      else {
        const mapped = idMaps[spec.fk.parent]?.get(raw)
        if (!mapped) throw new Error(`${spec.pg}.${spec.fk.col}=${raw} has no ${spec.fk.parent} mapping`)
        o[spec.fk.col] = mapped
      }
    }
    for (const b of spec.boolCols ?? []) o[b] = !!r[b]
    for (const e of spec.enumBlankCols ?? []) if (r[e] === '' || r[e] == null) o[e] = null
    return o
  })
  if (out.length) {
    const { error } = await supa.from(spec.pg).insert(out)
    if (error) throw new Error(`Insert failed for ${spec.pg}: ${error.message}`)
  }
  console.log(`Loaded ${out.length} -> ${spec.pg}`)
}

async function loadAll() {
  await migrateTable({ pg: 'site_content', sqlite: 'content_sitecontent', keepIntId: true })
  await migrateTable({ pg: 'hotel', sqlite: 'content_hotel' })
  await migrateTable({ pg: 'room_category', sqlite: 'content_roomcategory', fk: { col: 'hotel_id', parent: 'hotel' } })
  await migrateTable({ pg: 'room_image', sqlite: 'content_roomimage', fk: { col: 'room_id', parent: 'room_category' } })
  await migrateTable({ pg: 'restaurant', sqlite: 'content_restaurant', fk: { col: 'hotel_id', parent: 'hotel' } })
  await migrateTable({ pg: 'restaurant_image', sqlite: 'content_restaurantimage', fk: { col: 'restaurant_id', parent: 'restaurant' } })
  await migrateTable({ pg: 'venue', sqlite: 'content_venue', fk: { col: 'hotel_id', parent: 'hotel' }, enumBlankCols: ['kind'] })
  await migrateTable({ pg: 'venue_image', sqlite: 'content_venueimage', fk: { col: 'venue_id', parent: 'venue' } })
  await migrateTable({ pg: 'offer', sqlite: 'content_offer', fk: { col: 'hotel_id', parent: 'hotel' } })
  await migrateTable({ pg: 'gallery_image', sqlite: 'content_galleryimage', fk: { col: 'hotel_id', parent: 'hotel' } })
  await migrateTable({ pg: 'faq_section', sqlite: 'content_faqsection' })
  await migrateTable({ pg: 'faq_item', sqlite: 'content_faqitem', fk: { col: 'section_id', parent: 'faq_section' } })
  await migrateTable({ pg: 'testimonial', sqlite: 'content_testimonial' })
  await migrateTable({ pg: 'page', sqlite: 'content_page', fk: { col: 'hotel_id', parent: 'hotel' } })
  await migrateTable({ pg: 'page_section', sqlite: 'content_pagesection', fk: { col: 'page_id', parent: 'page' } })
  await migrateTable({ pg: 'department_contact', sqlite: 'leads_departmentcontact', boolCols: ['public', 'is_active'] })
}

async function main() {
  console.log('Source DB:', SQLITE_PATH)
  await uploadMedia()
  await resetTarget()
  await loadAll()
}

main().then(() => { db.close(); process.exit(0) })
      .catch((e) => { console.error(e); db.close(); process.exit(1) })
