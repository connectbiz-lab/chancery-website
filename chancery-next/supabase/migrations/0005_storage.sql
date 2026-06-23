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

-- NOTE on TRUNCATE: RLS does not gate TRUNCATE, and ideally we'd revoke it from
-- anon/authenticated here as we do for the public schema in 0004. We do NOT,
-- because storage.objects is owned by supabase_storage_admin and migrations run
-- as `postgres` (not a superuser, not a member of that role), so the REVOKE
-- silently no-ops locally and a `set role` wrapper would error during db reset.
-- This is acceptable: TRUNCATE is not reachable through Supabase's API surface
-- (PostgREST exposes no TRUNCATE verb and does not expose the `storage` schema;
-- external clients never connect directly as anon). Object writes are gated by
-- the "media admin write" RLS policy above. Storage-schema privileges are part
-- of Supabase's managed posture.
