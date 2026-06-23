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
$$ language sql stable security definer set search_path = public, pg_temp;

-- Reset table privileges to a known-minimal posture, then grant only what RLS gates.
-- (RLS governs SELECT/INSERT/UPDATE/DELETE row-by-row, but NOT TRUNCATE — so we must
-- not leave TRUNCATE/TRIGGER/REFERENCES granted to anon/authenticated.)
-- NOTE for future migrations: this revoke/grant covers only tables that exist
-- right now ("on all tables" is a one-time snapshot, not a standing rule). Any
-- table added in a later migration MUST repeat: enable RLS, add its policies,
-- and re-apply this revoke/grant — otherwise it ships with no RLS and/or the
-- wrong privileges.
revoke all on all tables in schema public from anon, authenticated;
grant select, insert, update, delete on all tables in schema public to anon, authenticated;
-- service_role is the server-side loader/writer (it has BYPASSRLS, but still needs
-- table-level DML grants — the blanket revoke above does not touch it, but these
-- tables were created without the service_role defaults, so grant them explicitly).
grant select, insert, update, delete on all tables in schema public to service_role;
-- admin_users: never anon-readable; authenticated may read (its own select policy gates rows).
revoke all on admin_users from anon, authenticated;
grant select on admin_users to authenticated;

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
