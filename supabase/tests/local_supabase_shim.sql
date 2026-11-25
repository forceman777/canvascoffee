-- LOCAL TESTING ONLY. Never run this on Supabase (it already has all of this).
-- Recreates the small parts of Supabase the migrations rely on: roles, auth.users, auth.uid(),
-- and the realtime publication.
do $$ begin create role anon nologin; exception when duplicate_object then null; end $$;
do $$ begin create role authenticated nologin; exception when duplicate_object then null; end $$;
create schema if not exists auth;
create table if not exists auth.users (id uuid primary key default gen_random_uuid(), email text unique);
create or replace function auth.uid() returns uuid language sql stable as $$
  select nullif(coalesce(current_setting('request.jwt.claim.sub', true), current_setting('request.jwt.claims', true)::jsonb ->> 'sub'), '')::uuid;
$$;
grant usage on schema auth, public to anon, authenticated;
grant execute on function auth.uid() to anon, authenticated;
do $$ begin create publication supabase_realtime; exception when duplicate_object then null; end $$;
