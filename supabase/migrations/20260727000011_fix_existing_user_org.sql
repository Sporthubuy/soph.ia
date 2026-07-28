-- Add organization and membership for existing users who don't have one
do $$
declare
  v_user_id uuid;
  v_org_id uuid;
  v_user_record record;
begin
  -- Find all users without memberships
  for v_user_record in
    select p.id, p.email
    from public.profiles p
    where not exists (
      select 1 from public.memberships m where m.user_id = p.id
    )
  loop
    v_user_id := v_user_record.id;

    -- Create organization for this user
    insert into public.organizations (name, slug)
    values (
      split_part(v_user_record.email, '@', 1) || '''s Workspace',
      split_part(v_user_record.email, '@', 1) || '-' || substr(v_user_id::text, 1, 8)
    )
    returning id into v_org_id;

    -- Create membership as owner
    insert into public.memberships (user_id, organization_id, role)
    values (v_user_id, v_org_id, 'owner');
  end loop;
end $$;
