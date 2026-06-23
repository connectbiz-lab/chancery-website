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
