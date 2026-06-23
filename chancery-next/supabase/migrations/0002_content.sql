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
  amenities text not null default '',
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
  hotel_id uuid references hotel(id) on delete set null,
  "order" smallint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table gallery_image (
  id uuid primary key default gen_random_uuid(),
  hotel_id uuid references hotel(id) on delete cascade,
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
  hotel_id uuid references hotel(id) on delete cascade,
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

do $$
declare t text;
begin
  foreach t in array array['site_content','hotel','room_category','restaurant','venue','offer','page']
  loop
    execute format('create trigger %I_set_updated_at before update on %I for each row execute function set_updated_at();', t, t);
  end loop;
end $$;

create index on room_category (hotel_id, "order");
create index on restaurant (hotel_id, "order");
create index on venue (hotel_id, "order");
create index on gallery_image (hotel_id, category, "order");
create index on page (kind, hotel_id);
