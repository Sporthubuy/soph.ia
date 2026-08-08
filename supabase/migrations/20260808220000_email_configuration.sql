-- Add email notification preferences to user_settings
alter table public.user_settings
add column if not exists email_notifications boolean default true,
add column if not exists email_digest varchar(50) default 'weekly'; -- 'never', 'daily', 'weekly', 'monthly'

-- Add email to organizations table for contact info
alter table public.organizations
add column if not exists contact_email varchar(255),
add column if not exists email_verified boolean default false;

-- Create email_logs table to track sent emails
create table if not exists public.email_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  recipient_email varchar(255) not null,
  subject text not null,
  template_type varchar(50) not null, -- 'welcome', 'password_reset', 'notification', etc
  status varchar(50) not null default 'pending', -- 'pending', 'sent', 'failed', 'bounced'
  error_message text,
  sent_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create index for email_logs
create index if not exists idx_email_logs_org on public.email_logs(organization_id);
create index if not exists idx_email_logs_recipient on public.email_logs(recipient_email);
create index if not exists idx_email_logs_status on public.email_logs(status);

-- Enable RLS on email_logs
alter table public.email_logs enable row level security;

-- RLS policy: users can view email logs for their organization
create policy "users can view organization email logs"
on public.email_logs
for select
to authenticated
using (
  organization_id = public.current_organization_id()
);

-- RLS policy: service role can insert email logs
create policy "service role can insert email logs"
on public.email_logs
for insert
to service_role
with check (true);

-- Create notification preferences table
create table if not exists public.notification_preferences (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  email_on_share boolean default true,
  email_on_mention boolean default true,
  email_on_approval boolean default true,
  email_on_publish boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(profile_id, organization_id)
);

-- Create index for notification_preferences
create index if not exists idx_notification_prefs_profile on public.notification_preferences(profile_id);
create index if not exists idx_notification_prefs_org on public.notification_preferences(organization_id);

-- Enable RLS on notification_preferences
alter table public.notification_preferences enable row level security;

-- RLS policy: users can view their notification preferences
create policy "users can view their notification preferences"
on public.notification_preferences
for select
to authenticated
using (
  profile_id = (select auth.uid())
);

-- RLS policy: users can update their notification preferences
create policy "users can update their notification preferences"
on public.notification_preferences
for update
to authenticated
using (
  profile_id = (select auth.uid())
)
with check (
  profile_id = (select auth.uid())
);

-- RLS policy: users can insert their notification preferences
create policy "users can insert their notification preferences"
on public.notification_preferences
for insert
to authenticated
with check (
  profile_id = (select auth.uid())
);

-- Create trigger to auto-insert notification preferences
create or replace function public.create_notification_preferences()
returns trigger as $$
declare
  user_org_id uuid;
begin
  -- Get the organization_id from the profiles table for this user
  select organization_id into user_org_id
  from public.profiles
  where id = new.id;

  if user_org_id is not null then
    insert into public.notification_preferences (profile_id, organization_id)
    values (new.id, user_org_id)
    on conflict (profile_id, organization_id) do nothing;
  end if;
  return new;
end;
$$ language plpgsql security definer;

-- Create trigger for profiles
drop trigger if exists create_notification_preferences_trigger on public.profiles;
create trigger create_notification_preferences_trigger
  after insert on public.profiles
  for each row
  execute function public.create_notification_preferences();
