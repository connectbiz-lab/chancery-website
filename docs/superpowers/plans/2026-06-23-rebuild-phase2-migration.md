# Chancery Rebuild — Phase 2: Data & Media Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A one-time, idempotent Node/TypeScript script that loads all existing content from the legacy Django SQLite DB into the Supabase Postgres tables, and uploads every legacy media file into the Supabase `media` bucket — with verification that row counts match the source.

**Architecture:** A standalone script `chancery-next/supabase/seed/migrate.ts`, run with `tsx`, reads the read-only legacy DB at `backend/db.sqlite3` via `better-sqlite3` and writes through the Supabase **service-role** client (bypasses RLS — the intended loader path). Image/`text` columns store the Storage object path (e.g. `hotels/hero.webp`); the script uploads files preserving Django's `media/` folder paths. The script is idempotent: it clears the target content tables, then reloads.

**Tech Stack:** TypeScript, `tsx`, `better-sqlite3` (read legacy DB), `@supabase/supabase-js` service-role client, `dotenv`.

**Reference spec:** `docs/superpowers/specs/2026-06-23-supabase-vercel-rebuild-design.md` §6. **Builds on** Phase 1 (`docs/superpowers/plans/2026-06-23-rebuild-phase1-foundation.md`) — read its "Execution notes / Phase 2 watch-outs".

**Prerequisites:** Local Supabase stack running (`cd chancery-next && npx supabase start`); migrations 0001–0005 applied (`npx supabase db reset`). `chancery-next/.env.local` exists with `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`. `psql` is NOT on host — use `docker exec -i supabase_db_chancery-next psql -U postgres -d postgres ...` for any direct DB checks.

---

## Source facts (verified against backend/db.sqlite3 on 2026-06-23)

Legacy tables are `content_*` and `leads_*`. **Django column names equal our Postgres column names** (snake_case), including FK columns (`hotel_id`, `room_id`, `restaurant_id`, `venue_id`, `section_id`, `page_id`). So each row maps over with only: drop integer `id` → generate `uuid` (and record old→new in a map); remap FK integer → mapped uuid; coerce SQLite `0/1` → boolean for `department_contact.public`/`is_active`; coerce blank enum `venue.kind` `''` → `null`.

**Gold counts (the migration must reproduce exactly):**

```
site_content 1, hotel 2, room_category 7, room_image 14, restaurant 5,
restaurant_image 18, venue 10, venue_image 3, offer 8, gallery_image 37,
faq_section 5, faq_item 15, testimonial 4, page 25, page_section 0,
department_contact 11
```

`leads_lead` (4 rows) and `leads_newslettersubscriber` (0 rows) are **NOT migrated** (transactional, not content).

Image columns hold base paths like `hotels/hero.webp`, `brand/TCH.webp`, `rooms/superior-room-bed_S9wrTYW.webp`. The `media/` tree has 506 files (base images + pre-generated `-480/-960/-1600.webp` variants + a stray `.DS_Store`). Upload everything except dotfiles; the variants are harmless and base files referenced by the DB are guaranteed present.

---

## File structure (this phase)

```
chancery-next/
  supabase/seed/migrate.ts      # the whole migration (bootstrap → upload → rows → verify)
  package.json                  # + devDeps (tsx, better-sqlite3, dotenv) + "migrate" script
```

The script is one focused file (~200 lines) with clearly separated functions: `uploadMedia()`, `resetTarget()`, `migrateTable()`, `verifyCounts()`, and `main()`. It has one responsibility — move legacy data into Supabase — so it stays in one file.

---

## Task 1: Bootstrap — deps, env, clients, SQLite read

**Files:**
- Create: `chancery-next/supabase/seed/migrate.ts`
- Modify: `chancery-next/package.json`

- [ ] **Step 1: Install dev dependencies**

```bash
cd /Users/jagraj/Documents/Github/chancery-website-v2/chancery-next
npm install -D tsx better-sqlite3 @types/better-sqlite3 dotenv
```
Expected: installs cleanly. NOTE: `better-sqlite3` is a native module; on macOS arm64 + Node 24 it uses a prebuilt binary. If the install fails to build, STOP and report BLOCKED (we'd switch to Node's built-in `node:sqlite`) — do not work around it silently.

- [ ] **Step 2: Add the `migrate` npm script**

In `chancery-next/package.json`, add to `"scripts"`:
```json
    "migrate": "tsx supabase/seed/migrate.ts"
```

- [ ] **Step 3: Create the bootstrap of `migrate.ts`**

```typescript
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

async function main() {
  console.log('Source DB:', SQLITE_PATH)
  const hotelCount = (db.prepare('select count(*) as n from content_hotel').get() as { n: number }).n
  console.log('Legacy hotels:', hotelCount)
}

main().then(() => { db.close(); process.exit(0) })
      .catch((e) => { console.error(e); db.close(); process.exit(1) })
```

- [ ] **Step 4: Verify bootstrap runs and reads the legacy DB**

```bash
cd /Users/jagraj/Documents/Github/chancery-website-v2/chancery-next
npm run migrate
```
Expected: prints the source DB path and `Legacy hotels: 2`, exits 0.

- [ ] **Step 5: Commit**

```bash
cd /Users/jagraj/Documents/Github/chancery-website-v2
git add chancery-next/supabase/seed/migrate.ts chancery-next/package.json chancery-next/package-lock.json
git commit -m "feat(migrate): bootstrap legacy->supabase migration script"
```

---

## Task 2: Upload media files to the `media` bucket

**Files:**
- Modify: `chancery-next/supabase/seed/migrate.ts`

- [ ] **Step 1: Add the content-type helper and `uploadMedia()`**

Add ABOVE `main()`:
```typescript
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
```

- [ ] **Step 2: Call it from `main()`**

Replace the body of `main()` with:
```typescript
async function main() {
  console.log('Source DB:', SQLITE_PATH)
  await uploadMedia()
}
```

- [ ] **Step 3: Run and verify a known image is publicly fetchable**

```bash
cd /Users/jagraj/Documents/Github/chancery-website-v2/chancery-next
npm run migrate
curl -s -o /dev/null -w "%{http_code}\n" "http://127.0.0.1:54321/storage/v1/object/public/media/hotels/hero.webp"
```
Expected: the script prints `Uploaded N media files.` (N is around 500), and the curl prints `200` (the public bucket serves the uploaded file). Run `npm run migrate` a second time — it must still succeed (idempotent via `upsert: true`).

- [ ] **Step 4: Commit**

```bash
cd /Users/jagraj/Documents/Github/chancery-website-v2
git add chancery-next/supabase/seed/migrate.ts
git commit -m "feat(migrate): upload legacy media tree to supabase storage"
```

---

## Task 3: Reset + load all content rows in FK order

**Files:**
- Modify: `chancery-next/supabase/seed/migrate.ts`

- [ ] **Step 1: Add `resetTarget()`, the id-map store, and `migrateTable()`**

Add ABOVE `main()`:
```typescript
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
```

- [ ] **Step 2: Add the ordered load sequence and wire into `main()`**

Add a `loadAll()` function ABOVE `main()`:
```typescript
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
```
Then update `main()`:
```typescript
async function main() {
  console.log('Source DB:', SQLITE_PATH)
  await uploadMedia()
  await resetTarget()
  await loadAll()
}
```

- [ ] **Step 3: Run the full migration**

```bash
cd /Users/jagraj/Documents/Github/chancery-website-v2/chancery-next
npm run migrate
```
Expected: prints upload count, `Target content tables cleared.`, then `Loaded N -> <table>` lines whose N match the gold counts (e.g. `Loaded 2 -> hotel`, `Loaded 37 -> gallery_image`, `Loaded 0 -> page_section`). Exits 0, no insert errors.

- [ ] **Step 4: Spot-check the data landed via the DB**

```bash
docker exec -i supabase_db_chancery-next psql -U postgres -d postgres -c \
"select (select count(*) from hotel) hotels, (select count(*) from gallery_image) gallery, (select count(*) from room_image) room_imgs, (select count(*) from department_contact) depts;"
```
Expected: `hotels=2, gallery=37, room_imgs=14, depts=11`. Also confirm a FK remapped correctly:
```bash
docker exec -i supabase_db_chancery-next psql -U postgres -d postgres -c \
"select r.name, h.slug from room_category r join hotel h on h.id=r.hotel_id order by 1 limit 3;"
```
Expected: room names with a valid hotel slug (`chancery`/`pavilion`) — proves the integer→uuid FK remap worked.

- [ ] **Step 5: Commit**

```bash
cd /Users/jagraj/Documents/Github/chancery-website-v2
git add chancery-next/supabase/seed/migrate.ts
git commit -m "feat(migrate): reset + load all content rows with FK remap"
```

---

## Task 4: Count verification + idempotency + end-to-end proof

**Files:**
- Modify: `chancery-next/supabase/seed/migrate.ts`

- [ ] **Step 1: Add `verifyCounts()` that asserts against the gold numbers**

Add ABOVE `main()`:
```typescript
async function verifyCounts() {
  const failures: string[] = []
  for (const [table, expected] of Object.entries(EXPECTED)) {
    const { count, error } = await supa.from(table).select('*', { count: 'exact', head: true })
    if (error) { failures.push(`${table}: count error ${error.message}`); continue }
    if (count !== expected) failures.push(`${table}: expected ${expected}, got ${count}`)
  }
  if (failures.length) throw new Error('Count verification FAILED:\n' + failures.join('\n'))
  console.log('Count verification PASSED for all', Object.keys(EXPECTED).length, 'tables.')
}
```

- [ ] **Step 2: Call it at the end of `main()`**

```typescript
async function main() {
  console.log('Source DB:', SQLITE_PATH)
  await uploadMedia()
  await resetTarget()
  await loadAll()
  await verifyCounts()
}
```

- [ ] **Step 3: Run end-to-end and confirm verification passes**

```bash
cd /Users/jagraj/Documents/Github/chancery-website-v2/chancery-next
npm run migrate
```
Expected: ends with `Count verification PASSED for all 16 tables.`, exits 0.

- [ ] **Step 4: Prove idempotency — run it again**

```bash
npm run migrate
```
Expected: same successful output, still `Count verification PASSED` (counts unchanged — reset+reload produced identical totals, no duplicates).

- [ ] **Step 5: End-to-end proof through the app**

The Phase-1 smoke page (`app/page.tsx`) lists hotels. Start dev server backgrounded and confirm both real hotels render:
```bash
npm run dev   # backgrounded; then in another shell:
curl -s http://localhost:3000 | grep -oE "The Chancery Hotel|Chancery Pavilion" | sort -u
```
Expected: both `Chancery Pavilion` and `The Chancery Hotel` appear (real migrated names, not seed data). Stop the dev server.

- [ ] **Step 6: Commit**

```bash
cd /Users/jagraj/Documents/Github/chancery-website-v2
git add chancery-next/supabase/seed/migrate.ts
git commit -m "feat(migrate): gold-count verification; phase 2 complete"
```

---

## Phase 2 Done — exit criteria

- `npm run migrate` runs clean and idempotently: uploads ~500 media files, clears + reloads all content tables.
- `Count verification PASSED for all 16 tables` (counts equal the gold numbers).
- A public Storage URL for a migrated image returns `200`.
- FK relationships are intact (room_category → hotel join returns valid slugs).
- The smoke page renders the two real hotel names.

**Next phase plan:** `2026-06-23-rebuild-phase3-public-site.md` — port the React components/pages to Next.js Server Components reading this data, with SEO + ISR.

---

## Self-review notes

- **Spec coverage (§6):** read source (Task 1), upload media preserving paths (Task 2), insert rows in FK order with path columns (Task 3), verify counts + idempotent reset (Tasks 3–4), original Django repo untouched (read-only `better-sqlite3` open + only `backend/media` reads, no writes). Leads skipped by default — matches spec.
- **Type consistency:** `idMaps` keyed by target `pg` name; every `fk.parent` value (`hotel`, `room_category`, `restaurant`, `venue`, `faq_section`, `page`) is a `pg` name loaded BEFORE its child in `loadAll()`, so the map is always populated first. `EXPECTED` keys are exactly the 16 loaded target tables. `migrateTable`/`resetTarget`/`verifyCounts`/`uploadMedia` signatures are consistent across tasks.
- **No placeholders:** every step has full code and a concrete verify command with expected output.
- **Watch-outs honored:** runs as service-role (bypasses RLS); image columns get Storage paths (not URLs); `venue.kind` blank→null; no reliance on nullable-unique dedupe (reset clears first).
