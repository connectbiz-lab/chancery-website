# Chancery Rebuild — Phase 1: Foundation & Data Layer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up the new Next.js app and the complete Supabase data layer (schema, enums, RLS, Storage) so later phases (migration, public site, admin, backend logic) have a working, tested foundation.

**Architecture:** A fresh Next.js (App Router) app at repo root in `chancery-next/`, alongside the still-runnable Django backend. Supabase runs locally via the CLI (Docker); the schema is defined as ordered SQL migrations under `chancery-next/supabase/migrations/`. RLS is enabled on every table from the start. One public-read `media` Storage bucket mirrors the current media folders.

**Tech Stack:** Next.js 15 (App Router, TypeScript, no Tailwind — plain CSS to match existing design), Supabase CLI + local Postgres, `@supabase/supabase-js` + `@supabase/ssr`, `psql` for schema verification.

**Reference spec:** `docs/superpowers/specs/2026-06-23-supabase-vercel-rebuild-design.md`

**Prerequisite:** Docker Desktop running (required by `supabase start`). Local DB URL is the Supabase default: `postgresql://postgres:postgres@127.0.0.1:54322/postgres`.

---

## File structure (created in this phase)

```
chancery-next/
  package.json, tsconfig.json, next.config.ts, .env.local, .gitignore   # scaffold
  app/                      # placeholder home page only (real pages: later phase)
  lib/supabase/
    server.ts               # server client (service role + ssr cookie client)
    client.ts               # browser client
    types.ts                # generated DB types (supabase gen types)
  supabase/
    config.toml             # supabase init output
    migrations/
      0001_enums.sql        # all enum types
      0002_content.sql      # content tables
      0003_leads.sql        # lead, newsletter_subscriber, department_contact
      0004_rls.sql          # admin_users + RLS enable + policies
      0005_storage.sql      # media bucket + storage policies
    tests/
      rls_test.sql          # RLS assertions (anon read/insert rules)
```

---

## Task 1: Scaffold the Next.js app

**Files:**
- Create: `chancery-next/` (via create-next-app)

- [ ] **Step 1: Scaffold**

Run from repo root (`/Users/jagraj/Documents/Github/chancery-website-v2`):

```bash
npx create-next-app@latest chancery-next \
  --ts --app --eslint --no-tailwind --no-src-dir \
  --import-alias "@/*" --use-npm --yes
```

Expected: `chancery-next/` created with `app/`, `package.json`, `tsconfig.json`, `next.config.ts`.

- [ ] **Step 2: Verify dev server boots**

```bash
cd chancery-next && npm run dev
```

Expected: "Ready" on http://localhost:3000. Stop it with Ctrl-C (or run backgrounded and curl `http://localhost:3000` for a `200`).

- [ ] **Step 3: Commit**

```bash
cd /Users/jagraj/Documents/Github/chancery-website-v2
git add chancery-next
git commit -m "feat: scaffold chancery-next (Next.js App Router app)"
```

---

## Task 2: Initialise Supabase locally

**Files:**
- Create: `chancery-next/supabase/config.toml` (via `supabase init`)

- [ ] **Step 1: Init Supabase project**

```bash
cd chancery-next
npx supabase init
```

Expected: `supabase/config.toml` created. Answer "N" if asked to generate VS Code settings.

- [ ] **Step 2: Start the local stack**

```bash
npx supabase start
```

Expected: prints `API URL`, `DB URL`, `anon key`, `service_role key`. Note these — used in Task 7. (First run pulls Docker images; may take a few minutes.)

- [ ] **Step 3: Verify DB reachable**

```bash
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres -c "select version();"
```

Expected: a PostgreSQL version line.

- [ ] **Step 4: Commit**

```bash
git add supabase/config.toml
git commit -m "chore: supabase init (local dev stack)"
```

---

## Task 3: Enum types migration

**Files:**
- Create: `chancery-next/supabase/migrations/0001_enums.sql`

- [ ] **Step 1: Write the migration**

```sql
-- 0001_enums.sql — enum types mirroring Django `choices`.
create type hotel_slug         as enum ('chancery', 'pavilion');
create type venue_kind         as enum ('ballroom','banquet','conference','private_dining','executive','al_fresco','divisible');
create type gallery_category   as enum ('hotel','lobby','rooms','dining','events');
create type page_kind          as enum ('home','rooms','faq','careers','catering','privacy','terms','accessibility','sitemap','hotel_home','accommodation','dining','events','offers','gallery','contact','experience','destination');
create type section_kind       as enum ('text','text_image','image_text','callout','cta');
create type lead_interest      as enum ('stay','dining','event','catering','careers','other');
create type hotel_interest     as enum ('chancery','pavilion','either');
create type lead_status        as enum ('new','in_progress','resolved');
create type department         as enum ('reservations','dining','sales','events','catering','careers','general');
create type hotel_scope        as enum ('chancery','pavilion','both');
```

- [ ] **Step 2: Apply and verify**

```bash
cd chancery-next
npx supabase db reset
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres -c "\dT" | grep -c -E 'hotel_slug|venue_kind|page_kind|department'
```

Expected: `db reset` runs migration 0001 with no error; grep count is `4` (at least these present).

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/0001_enums.sql
git commit -m "feat(db): enum types"
```

---

## Task 4: Content tables migration

**Files:**
- Create: `chancery-next/supabase/migrations/0002_content.sql`

- [ ] **Step 1: Write the migration**

```sql
-- 0002_content.sql — content tables (1:1 port of Django content models).
-- Image columns store the Storage object path (text), e.g. 'hotels/foo.webp'.

create extension if not exists "pgcrypto";  -- gen_random_uuid()

-- updated_at trigger helper
create or replace function set_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

create table site_content (
  id integer primary key default 1,
  site_title text not null default 'Chancery Hotels',
  tagline text not null default 'Luxury Hotels in Bangalore',
  meta_description text not null default '',
  footer_note text not null default '',
  newsletter_heading text not null default 'Stay in touch',
  newsletter_description text not null default '',
  og_image text,
  brand_logo text,
  instagram_url text not null default '',
  facebook_url text not null default '',
  tripadvisor_url text not null default '',
  synxis_chain_id text not null default '18850',
  updated_at timestamptz not null default now(),
  constraint site_content_singleton check (id = 1)
);

create table hotel (
  id uuid primary key default gen_random_uuid(),
  slug hotel_slug unique not null,
  name text not null,
  short_name text not null default '',
  tagline text not null default '',
  location text not null default '',
  address text not null default '',
  phone text not null default '',
  phone_alt text not null default '',
  fax text not null default '',
  whatsapp text not null default '',
  email text not null default '',
  rooms_count integer not null default 0,
  established text not null default '',
  location_tag text not null default '',
  synxis_id text not null default '',
  tripadvisor_url text not null default '',
  tripadvisor_rating numeric(2,1),
  tripadvisor_count integer,
  google_rating numeric(2,1),
  google_count integer,
  hero_image text,
  about_image text,
  banner_image text,
  logo text,
  intro_heading text not null default '',
  intro_body text not null default '',
  "order" smallint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table room_category (
  id uuid primary key default gen_random_uuid(),
  hotel_id uuid not null references hotel(id) on delete cascade,
  name text not null,
  slug text not null default '',
  size_sqft integer,
  max_guests smallint not null default 2,
  bed_type text not null default '',
  description text not null default '',
  amenities text not null default '',         -- one per line, preserved verbatim
  hero_image text,
  book_url text not null default '',
  "order" smallint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table room_image (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references room_category(id) on delete cascade,
  image text not null,
  alt text not null default '',
  "order" smallint not null default 0
);

create table restaurant (
  id uuid primary key default gen_random_uuid(),
  hotel_id uuid not null references hotel(id) on delete cascade,
  name text not null,
  slug text not null default '',
  cuisine text not null default '',
  timing text not null default '',
  description text not null default '',
  hero_image text,
  logo text,
  "order" smallint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table restaurant_image (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurant(id) on delete cascade,
  image text not null,
  alt text not null default '',
  "order" smallint not null default 0
);

create table venue (
  id uuid primary key default gen_random_uuid(),
  hotel_id uuid not null references hotel(id) on delete cascade,
  name text not null,
  slug text not null default '',
  kind venue_kind,
  description text not null default '',
  area_sqft integer,
  dimensions text not null default '',
  ceiling_ft smallint,
  guests_max integer,
  cap_theatre integer,
  cap_banquet integer,
  cap_classroom integer,
  cap_ushape integer,
  cap_cocktail integer,
  half_day_inr integer,
  full_day_inr integer,
  per_plate_inr integer,
  hero_image text,
  "order" smallint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table venue_image (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references venue(id) on delete cascade,
  image text not null,
  alt text not null default '',
  "order" smallint not null default 0
);

create table offer (
  id uuid primary key default gen_random_uuid(),
  tag text not null default '',
  title text not null,
  description text not null default '',
  image text,
  promo_code text not null default '',
  min_nights smallint,
  hotel_id uuid references hotel(id) on delete set null,   -- null = shared
  "order" smallint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table gallery_image (
  id uuid primary key default gen_random_uuid(),
  hotel_id uuid references hotel(id) on delete cascade,    -- null = shared
  category gallery_category not null default 'hotel',
  image text not null,
  alt text not null default '',
  "order" smallint not null default 0
);

create table faq_section (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  "order" smallint not null default 0
);

create table faq_item (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null references faq_section(id) on delete cascade,
  question text not null,
  answer text not null,
  "order" smallint not null default 0
);

create table testimonial (
  id uuid primary key default gen_random_uuid(),
  quote text not null,
  name text not null,
  title text not null default '',
  rating smallint not null default 5,
  "order" smallint not null default 0
);

create table page (
  id uuid primary key default gen_random_uuid(),
  kind page_kind not null,
  hotel_id uuid references hotel(id) on delete cascade,    -- null = brand-level
  title text not null,
  meta_title text not null default '',
  meta_description text not null default '',
  hero_image text,
  hero_eyebrow text not null default '',
  hero_heading text not null default '',
  hero_subheading text not null default '',
  intro_body text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (kind, hotel_id)
);

create table page_section (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references page(id) on delete cascade,
  kind section_kind not null default 'text',
  eyebrow text not null default '',
  title text not null default '',
  body text not null default '',
  image text,
  image_alt text not null default '',
  cta_label text not null default '',
  cta_url text not null default '',
  "order" smallint not null default 0
);

-- updated_at triggers on tables that have the column
do $$
declare t text;
begin
  foreach t in array array['site_content','hotel','room_category','restaurant','venue','offer','page']
  loop
    execute format('create trigger %I_set_updated_at before update on %I for each row execute function set_updated_at();', t, t);
  end loop;
end $$;

-- helpful indexes for FK lookups / ordering
create index on room_category (hotel_id, "order");
create index on restaurant (hotel_id, "order");
create index on venue (hotel_id, "order");
create index on gallery_image (hotel_id, category, "order");
create index on page (kind, hotel_id);
```

- [ ] **Step 2: Apply and verify table count**

```bash
npx supabase db reset
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres -t -c \
"select count(*) from information_schema.tables where table_schema='public' and table_name in ('site_content','hotel','room_category','room_image','restaurant','restaurant_image','venue','venue_image','offer','gallery_image','faq_section','faq_item','testimonial','page','page_section');"
```

Expected: `15`.

- [ ] **Step 3: Verify the singleton constraint works**

```bash
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres -c "insert into site_content (id) values (1);"
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres -c "insert into site_content (id) values (2);" 2>&1 | grep -c "site_content_singleton"
```

Expected: first insert succeeds (`INSERT 0 1`); second prints `1` (violates check constraint).

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/0002_content.sql
git commit -m "feat(db): content tables"
```

---

## Task 5: Leads & routing tables migration

**Files:**
- Create: `chancery-next/supabase/migrations/0003_leads.sql`

- [ ] **Step 1: Write the migration**

```sql
-- 0003_leads.sql — lead capture, newsletter, and the department routing table.

create table lead (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text not null default '',
  interest lead_interest not null default 'stay',
  hotel_interest hotel_interest not null default 'either',
  message text not null default '',
  page text not null default '',
  restaurant text not null default '',
  venue text not null default '',
  event_type text not null default '',
  covers smallint,
  preferred_date date,
  preferred_time text not null default '',
  status lead_status not null default 'new',
  routed_to text not null default '',
  created_at timestamptz not null default now()
);
create index on lead (created_at desc);

create table newsletter_subscriber (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  created_at timestamptz not null default now()
);

create table department_contact (
  id uuid primary key default gen_random_uuid(),
  hotel hotel_scope not null,
  department department not null,
  notify_email text not null,
  cc_emails text not null default '',
  phone text not null default '',
  public boolean not null default true,
  whatsapp_number text not null default '',
  slack_webhook text not null default '',
  is_active boolean not null default true,
  unique (hotel, department)
);
```

- [ ] **Step 2: Apply and verify**

```bash
npx supabase db reset
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres -t -c \
"select count(*) from information_schema.tables where table_schema='public' and table_name in ('lead','newsletter_subscriber','department_contact');"
```

Expected: `3`.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/0003_leads.sql
git commit -m "feat(db): lead, newsletter, department routing tables"
```

---

## Task 6: RLS policies migration

**Files:**
- Create: `chancery-next/supabase/migrations/0004_rls.sql`

Policy model (from spec §2): content tables = public read, no anon write; `lead`/`newsletter_subscriber` = anon insert only, admin read; `department_contact` = no anon read of internal columns (no anon select at all — the public site will read public columns through a server query using the service role / a dedicated view in a later phase). Admins are rows in `admin_users` keyed by `auth.uid()`.

- [ ] **Step 1: Write the migration**

```sql
-- 0004_rls.sql — enable RLS and define policies.

-- Admin allowlist: a row here (matching the logged-in user's id) grants admin.
create table admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  created_at timestamptz not null default now()
);
alter table admin_users enable row level security;
-- only admins can see the admin list
create policy admin_users_select on admin_users for select to authenticated
  using (exists (select 1 from admin_users a where a.user_id = auth.uid()));

create or replace function is_admin() returns boolean as $$
  select exists (select 1 from admin_users where user_id = auth.uid());
$$ language sql stable security definer;

-- Content tables: enable RLS, public SELECT, admin-only writes.
do $$
declare t text;
begin
  foreach t in array array[
    'site_content','hotel','room_category','room_image','restaurant','restaurant_image',
    'venue','venue_image','offer','gallery_image','faq_section','faq_item','testimonial',
    'page','page_section'
  ] loop
    execute format('alter table %I enable row level security;', t);
    execute format('create policy %I_public_read on %I for select to anon, authenticated using (true);', t, t);
    execute format('create policy %I_admin_write on %I for all to authenticated using (is_admin()) with check (is_admin());', t, t);
  end loop;
end $$;

-- lead: anon may INSERT, only admins may SELECT/UPDATE.
alter table lead enable row level security;
create policy lead_anon_insert on lead for insert to anon, authenticated with check (true);
create policy lead_admin_read  on lead for select to authenticated using (is_admin());
create policy lead_admin_update on lead for update to authenticated using (is_admin()) with check (is_admin());

-- newsletter_subscriber: anon may INSERT, only admins may SELECT.
alter table newsletter_subscriber enable row level security;
create policy news_anon_insert on newsletter_subscriber for insert to anon, authenticated with check (true);
create policy news_admin_read  on newsletter_subscriber for select to authenticated using (is_admin());

-- department_contact: no anon access at all; admins manage. Public columns are
-- exposed via a server-side query (service role) in a later phase.
alter table department_contact enable row level security;
create policy dept_admin_all on department_contact for all to authenticated
  using (is_admin()) with check (is_admin());
```

- [ ] **Step 2: Apply**

```bash
npx supabase db reset
```

Expected: no error; migration 0004 applies.

- [ ] **Step 3: Verify RLS is enabled everywhere**

```bash
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres -t -c \
"select count(*) from pg_tables where schemaname='public' and rowsecurity = false;"
```

Expected: `0` (every public table has RLS on).

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/0004_rls.sql
git commit -m "feat(db): RLS policies + admin allowlist"
```

---

## Task 7: RLS behaviour test (anon read/insert rules)

**Files:**
- Create: `chancery-next/supabase/tests/rls_test.sql`

This is the failing-test-first step: write assertions that exercise the anon role, confirm they behave per spec.

- [ ] **Step 1: Write the test SQL**

```sql
-- rls_test.sql — run as anon, assert spec policy behaviour.
-- Uses Supabase's roles. anon SELECT on content = allowed; anon write = denied;
-- anon INSERT into lead = allowed; anon SELECT on lead = filtered to 0 rows.

\set ON_ERROR_STOP off

-- seed one content row as superuser (RLS bypassed for table owner/postgres)
insert into hotel (slug, name) values ('chancery', 'The Chancery Hotel')
  on conflict (slug) do nothing;
insert into lead (name, email) values ('Seed', 'seed@example.com');

set role anon;

-- 1) anon CAN read content
select '1_content_read' as test, count(*) >= 1 as pass from hotel;

-- 2) anon CANNOT insert content (expect error -> caught, prints failure marker)
do $$
begin
  insert into hotel (slug, name) values ('pavilion', 'X');
  raise notice 'TEST 2_content_write_denied: FAIL (insert succeeded)';
exception when others then
  raise notice 'TEST 2_content_write_denied: PASS';
end $$;

-- 3) anon CAN insert a lead
do $$
begin
  insert into lead (name, email) values ('Anon', 'anon@example.com');
  raise notice 'TEST 3_lead_insert: PASS';
exception when others then
  raise notice 'TEST 3_lead_insert: FAIL';
end $$;

-- 4) anon CANNOT read leads (RLS filters to 0 rows)
select '4_lead_read_blocked' as test, count(*) = 0 as pass from lead;

-- 5) anon CANNOT read department_contact (RLS filters to 0 rows)
select '5_dept_read_blocked' as test, count(*) = 0 as pass from department_contact;

reset role;
```

- [ ] **Step 2: Run it and confirm expected behaviour**

```bash
cd chancery-next
npx supabase db reset
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres -f supabase/tests/rls_test.sql
```

Expected output includes:
- `1_content_read | t`
- `TEST 2_content_write_denied: PASS`
- `TEST 3_lead_insert: PASS`
- `4_lead_read_blocked | t`
- `5_dept_read_blocked | t`

If any line shows `f` or `FAIL`, fix the policy in `0004_rls.sql` and re-run.

- [ ] **Step 3: Commit**

```bash
git add supabase/tests/rls_test.sql
git commit -m "test(db): RLS anon read/insert behaviour"
```

---

## Task 8: Storage bucket migration

**Files:**
- Create: `chancery-next/supabase/migrations/0005_storage.sql`

- [ ] **Step 1: Write the migration**

```sql
-- 0005_storage.sql — public-read media bucket; admin-only writes.
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

-- public read of objects in 'media'
create policy "media public read" on storage.objects for select to anon, authenticated
  using (bucket_id = 'media');

-- only admins may upload/update/delete in 'media'
create policy "media admin write" on storage.objects for all to authenticated
  using (bucket_id = 'media' and is_admin())
  with check (bucket_id = 'media' and is_admin());
```

- [ ] **Step 2: Apply and verify bucket exists**

```bash
npx supabase db reset
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres -t -c \
"select public from storage.buckets where id='media';"
```

Expected: `t`.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/0005_storage.sql
git commit -m "feat(db): media storage bucket + policies"
```

---

## Task 9: Supabase clients + env + generated types

**Files:**
- Create: `chancery-next/.env.local`
- Create: `chancery-next/lib/supabase/server.ts`
- Create: `chancery-next/lib/supabase/client.ts`
- Create: `chancery-next/lib/supabase/types.ts` (generated)
- Modify: `chancery-next/.gitignore` (ensure `.env.local` ignored — create-next-app already ignores it)

- [ ] **Step 1: Install deps**

```bash
cd chancery-next
npm install @supabase/supabase-js @supabase/ssr
```

- [ ] **Step 2: Write `.env.local`**

Use the values printed by `supabase start` (Task 2 Step 2). The local defaults are stable:

```bash
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key from `supabase status`>
SUPABASE_SERVICE_ROLE_KEY=<service_role key from `supabase status`>
```

Get the keys:

```bash
npx supabase status -o env
```

- [ ] **Step 3: Generate DB types**

```bash
npx supabase gen types typescript --local > lib/supabase/types.ts
```

Expected: `lib/supabase/types.ts` contains `export type Database = { public: { Tables: { hotel: ... } } }`.

- [ ] **Step 4: Write the browser client**

```typescript
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './types'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}
```

- [ ] **Step 5: Write the server client**

```typescript
// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import type { Database } from './types'

// Authenticated, cookie-bound client for reads/writes as the current user.
export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (toSet) => {
          try {
            toSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch {
            // called from a Server Component; safe to ignore (middleware refreshes)
          }
        },
      },
    },
  )
}

// Service-role client for trusted server-only operations (lead insert, routing reads).
// NEVER import this into client components.
export function createAdminClient() {
  return createServiceClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  )
}
```

- [ ] **Step 6: Write a typed-query smoke test page**

Replace `app/page.tsx` with a temporary server component that reads `hotel` (proves server read works end-to-end). This will be replaced by the real home page in the public-site phase.

```typescript
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
```

- [ ] **Step 7: Verify end-to-end read**

Seed one hotel, then load the page:

```bash
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres -c \
"insert into hotel (slug, name, \"order\") values ('chancery','The Chancery Hotel',0) on conflict (slug) do nothing;"
npm run dev   # then curl in another shell:
curl -s http://localhost:3000 | grep -c "The Chancery Hotel"
```

Expected: grep prints `1` (the seeded hotel renders via the anon public-read policy). Stop the dev server.

- [ ] **Step 8: Commit**

```bash
git add lib/supabase package.json package-lock.json app/page.tsx
git commit -m "feat: supabase clients, generated types, data-layer smoke test"
```

---

## Phase 1 Done — exit criteria

- `chancery-next` boots; `supabase start` + `db reset` apply all five migrations cleanly.
- All 18 tables (15 content + 3 leads/routing) plus `admin_users` exist with RLS on.
- `rls_test.sql` passes all five assertions.
- `media` bucket exists, public-read.
- The smoke-test home page renders a hotel read through the typed server client.

**Next phase plan:** `2026-06-23-rebuild-phase2-migration.md` — the `migrate.ts` script that loads the Django SQLite content + `backend/media/` files into these tables and the `media` bucket.

---

## Self-review notes

- **Spec coverage:** §2 architecture (app scaffold, two zones — admin zone routes come in phase 4), §2 security/RLS (Tasks 6–7), §3 schema incl. enums/conventions/storage (Tasks 3–5, 8), client/types groundwork for §7 rendering (Task 9). Migration (§6), public pages (§7), admin (§4), and notify engine (§5) are explicitly deferred to later phase plans.
- **Type consistency:** table/column names here are the contract for generated `types.ts`; later phases consume `Database` from `lib/supabase/types.ts`. `is_admin()` and `admin_users` are referenced consistently across 0004 and 0005.
- **No placeholders:** every SQL/TS step contains full content and a concrete verify command.

---

## Execution notes & deviations (filled in after implementation, 2026-06-23)

Phase 1 was executed via subagent-driven development (implementer + spec review + quality review per task). All 9 tasks landed; the data layer is verified. Deviations from the plan as written:

1. **RLS needed table GRANTs (Task 6).** The plan's `0004_rls.sql` policies were correct but unreachable without table-level grants — in Supabase, RLS sits on top of GRANTs. Added a hardened grant block: `revoke all on all tables in schema public from anon, authenticated;` then `grant select, insert, update, delete ...`, plus `revoke all on admin_users ... grant select ... to authenticated`. This both enables the policies and closes a **critical TRUNCATE bypass** (RLS does not gate TRUNCATE; default grants included it). Test 6 (`anon TRUNCATE denied`) was added to `rls_test.sql`.
2. **`is_admin()` hardened** with `set search_path = public, pg_temp` (security-definer best practice).
3. **Future-table footgun documented in 0004.** The revoke/grant is a one-time snapshot — any new table in a later migration MUST re-enable RLS, add policies, and re-apply the revoke/grant.
4. **Storage TRUNCATE intentionally NOT revoked (Task 8).** `storage.objects` is owned by `supabase_storage_admin`; the `postgres` migration role can't revoke it (silent no-op locally; `set role` would break `db reset`). Documented in `0005_storage.sql` as accepted: TRUNCATE is unreachable via Supabase's API surface (PostgREST has no TRUNCATE verb, doesn't expose the `storage` schema), and object writes are gated by the `media admin write` RLS policy.
5. **`server.ts` marked `import 'server-only'`** so accidental client-component import of the service-role client fails at build time.
6. **CI type check:** use `next build` rather than bare `npx tsc --noEmit` — the latter trips on Next.js's generated `.next/types` validator (a known typed-routes quirk), not project source.

### Phase 2 watch-outs (carry into the migration-script plan)
- The loader must run as **service-role** (`createAdminClient`) — content tables are admin-write only under RLS.
- **Image-column convention:** `text` columns store the **Storage object path** (e.g. `hotels/foo.webp`), NOT a full URL; the app builds public URLs. The migration script must upload to the `media` bucket preserving Django's folder paths and write the path into the column.
- `Venue.kind` (blank in Django) maps to a **nullable** enum — query code uses `IS NULL`, not `= ''`.
- Nullable `unique (kind, hotel_id)` / `unique (hotel, department)` do not block duplicate NULL-hotel rows (Postgres treats NULLs as distinct) — faithful to Django, but the loader should not rely on these to dedupe brand-level rows.
