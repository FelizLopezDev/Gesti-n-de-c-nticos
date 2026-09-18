-- RLS behavior test for 0001_profiles_and_rls.sql.
-- Run after the migration in a disposable Supabase/PostgreSQL test database.
-- The test runner must be able to `set local role authenticated`.

begin;

insert into public.profiles (clerk_user_id, username, display_name, role, status)
values
  ('test-active-user', 'test_active_user', 'Test Active User', 'USER', 'ACTIVE'),
  ('test-active-admin', 'test_active_admin', 'Test Active Admin', 'ADMIN', 'ACTIVE'),
  ('test-active-superadmin', 'test_active_superadmin', 'Test Active Superadmin', 'SUPERADMIN', 'ACTIVE'),
  ('test-disabled-user', 'test_disabled_user', 'Test Disabled User', 'USER', 'DISABLED'),
  ('test-disabled-admin', 'test_disabled_admin', 'Test Disabled Admin', 'ADMIN', 'DISABLED'),
  ('test-disabled-superadmin', 'test_disabled_superadmin', 'Test Disabled Superadmin', 'SUPERADMIN', 'DISABLED');

set local role authenticated;

-- ACTIVE USER: own profile allowed; every other profile denied.
select set_config('request.jwt.claims', '{"sub":"test-active-user"}', true);
do $$
begin
  if (
    select coalesce(array_agg(clerk_user_id order by clerk_user_id), '{}'::text[])
    from public.profiles
  ) is distinct from array['test-active-user']::text[] then
    raise exception 'ACTIVE USER must read only their own profile';
  end if;
end;
$$;

-- ACTIVE ADMIN: profile reads allowed; role/status writes denied.
select set_config('request.jwt.claims', '{"sub":"test-active-admin"}', true);
do $$
begin
  if (
    select coalesce(array_agg(clerk_user_id order by clerk_user_id), '{}'::text[])
    from public.profiles
  ) is distinct from array[
    'test-active-admin',
    'test-active-superadmin',
    'test-active-user',
    'test-disabled-admin',
    'test-disabled-superadmin',
    'test-disabled-user'
  ]::text[] then
    raise exception 'ACTIVE ADMIN must read profiles needed for administration';
  end if;

  begin
    update public.profiles
      set role = 'SUPERADMIN'::public.app_role,
          status = 'DISABLED'::public.account_status
      where clerk_user_id = 'test-active-user';
    raise exception 'ACTIVE ADMIN must not modify profile role or status';
  exception
    when insufficient_privilege then null;
  end;
end;
$$;

-- ACTIVE SUPERADMIN: profile reads allowed.
select set_config('request.jwt.claims', '{"sub":"test-active-superadmin"}', true);
do $$
begin
  if (
    select coalesce(array_agg(clerk_user_id order by clerk_user_id), '{}'::text[])
    from public.profiles
  ) is distinct from array[
    'test-active-admin',
    'test-active-superadmin',
    'test-active-user',
    'test-disabled-admin',
    'test-disabled-superadmin',
    'test-disabled-user'
  ]::text[] then
    raise exception 'ACTIVE SUPERADMIN must read profiles';
  end if;
end;
$$;

-- DISABLED accounts: no own or administrative profile reads.
select set_config('request.jwt.claims', '{"sub":"test-disabled-user"}', true);
do $$
begin
  if exists (select 1 from public.profiles) then
    raise exception 'DISABLED USER must not read profiles';
  end if;
end;
$$;

select set_config('request.jwt.claims', '{"sub":"test-disabled-admin"}', true);
do $$
begin
  if exists (select 1 from public.profiles) then
    raise exception 'DISABLED ADMIN must not read profiles';
  end if;
end;
$$;

select set_config('request.jwt.claims', '{"sub":"test-disabled-superadmin"}', true);
do $$
begin
  if exists (select 1 from public.profiles) then
    raise exception 'DISABLED SUPERADMIN must not read profiles';
  end if;
end;
$$;

rollback;
