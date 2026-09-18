-- Database authorization foundation for Clerk third-party authentication.
-- This migration deliberately creates no application data or privileged users.

create schema if not exists private;

create type public.app_role as enum ('USER', 'ADMIN', 'SUPERADMIN');
create type public.account_status as enum ('ACTIVE', 'DISABLED');

create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text not null unique,
  username text unique,
  display_name text not null,
  role public.app_role not null,
  status public.account_status not null default 'ACTIVE',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- The predicate intentionally does not include account status: a disabled
-- Superadmin profile still occupies the single Superadmin position.
create unique index profiles_single_superadmin_idx
  on public.profiles (role)
  where role = 'SUPERADMIN'::public.app_role;

-- `private` is not an API schema. These helpers are only callable by the
-- authenticated database role and are not exposed through the Data API.
revoke all on schema private from public;
grant usage on schema private to authenticated;

create function private.current_clerk_user_id()
returns text
language sql
stable
set search_path = ''
as $$
  select auth.jwt() ->> 'sub';
$$;

-- SECURITY DEFINER avoids RLS recursion when a profiles policy asks for the
-- caller's application role. It derives identity only from the verified JWT.
create function private.current_app_role()
returns public.app_role
language sql
stable
security definer
set search_path = ''
as $$
  select profiles.role
  from public.profiles
  where profiles.clerk_user_id = (select private.current_clerk_user_id())
    and profiles.status = 'ACTIVE'::public.account_status
  limit 1;
$$;

create function private.set_profile_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row
  execute function private.set_profile_updated_at();

alter table public.profiles enable row level security;

create policy profiles_select_own_or_administrative
  on public.profiles
  for select
  to authenticated
  using (
    (
      (select private.current_app_role()) = 'USER'::public.app_role
      and clerk_user_id = (select private.current_clerk_user_id())
    )
    or (select private.current_app_role()) in ('ADMIN'::public.app_role, 'SUPERADMIN'::public.app_role)
  );

-- There are intentionally no client INSERT, UPDATE, or DELETE policies.
-- Future privileged mutations must use trusted server-side logic.
grant usage on schema public to authenticated;
revoke all on table public.profiles from public;
revoke all on table public.profiles from anon;
grant select on table public.profiles to authenticated;

revoke all on type public.app_role from public;
revoke all on type public.account_status from public;
grant usage on type public.app_role to authenticated;
grant usage on type public.account_status to authenticated;

revoke all on function private.current_clerk_user_id() from public;
revoke all on function private.current_app_role() from public;
revoke all on function private.set_profile_updated_at() from public;
grant execute on function private.current_clerk_user_id() to authenticated;
grant execute on function private.current_app_role() to authenticated;
