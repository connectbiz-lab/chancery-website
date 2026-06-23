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
