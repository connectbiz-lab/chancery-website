-- rls_test.sql — run as anon, assert spec policy behaviour.
-- anon SELECT on content = allowed; anon write = denied;
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

-- 6) anon CANNOT truncate content (TRUNCATE bypasses RLS — must be blocked by privilege)
do $$
begin
  truncate hotel cascade;
  raise notice 'TEST 6_truncate_denied: FAIL (truncate succeeded)';
exception when others then
  raise notice 'TEST 6_truncate_denied: PASS';
end $$;

reset role;
