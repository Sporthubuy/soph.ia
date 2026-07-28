-- Create default organization and membership when user signs up
create or replace function public.handle_new_user_org()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
declare
  org_id uuid;
  user_email text;
begin
  -- Get user email
  user_email := new.email;

  -- Create organization with email as base
  insert into public.organizations (name, slug)
  values (
    split_part(user_email, '@', 1) || '''s Workspace',
    split_part(user_email, '@', 1) || '-' || substr(new.id::text, 1, 8)
  )
  returning id into org_id;

  -- Create membership as owner
  insert into public.memberships (user_id, organization_id, role)
  values (new.id, org_id, 'owner');

  return new;
end;
$$;

-- Drop existing trigger if it exists
drop trigger if exists on_auth_user_created_org on auth.users;

-- Create new trigger that calls both functions
create or replace function public.handle_new_user_combined()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  -- Create profile
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  );

  -- Create organization and membership
  declare
    org_id uuid;
  begin
    insert into public.organizations (name, slug)
    values (
      split_part(new.email, '@', 1) || '''s Workspace',
      split_part(new.email, '@', 1) || '-' || substr(new.id::text, 1, 8)
    )
    returning id into org_id;

    insert into public.memberships (user_id, organization_id, role)
    values (new.id, org_id, 'owner');
  end;

  return new;
end;
$$;

-- Drop old trigger and create new one
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user_combined();
