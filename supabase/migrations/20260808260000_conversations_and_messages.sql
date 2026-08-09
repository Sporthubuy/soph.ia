-- Conversations and messages for agent chat history.
-- Each conversation belongs to one agent and one user; messages hang off the
-- conversation. Users can only see their own conversations, and messages are
-- accessible only via their conversation.

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references public.agents(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  title text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_conversations_agent_profile on public.conversations(agent_id, profile_id);
create index if not exists idx_conversations_profile_updated on public.conversations(profile_id, updated_at desc);

alter table public.conversations enable row level security;

create policy "users manage their conversations select"
on public.conversations for select to authenticated
using (profile_id = (select auth.uid()));

create policy "users manage their conversations insert"
on public.conversations for insert to authenticated
with check (profile_id = (select auth.uid()) and organization_id = (select public.current_organization_id()));

create policy "users manage their conversations update"
on public.conversations for update to authenticated
using (profile_id = (select auth.uid()))
with check (profile_id = (select auth.uid()));

create policy "users manage their conversations delete"
on public.conversations for delete to authenticated
using (profile_id = (select auth.uid()));

drop trigger if exists conversations_set_updated_at on public.conversations;
create trigger conversations_set_updated_at
before update on public.conversations
for each row execute function public.set_updated_at();

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_messages_conversation_created on public.messages(conversation_id, created_at);

alter table public.messages enable row level security;

create policy "users see messages of their conversations"
on public.messages for select to authenticated
using (
  exists (
    select 1 from public.conversations c
    where c.id = conversation_id and c.profile_id = (select auth.uid())
  )
);

create policy "users insert messages in their conversations"
on public.messages for insert to authenticated
with check (
  exists (
    select 1 from public.conversations c
    where c.id = conversation_id and c.profile_id = (select auth.uid())
  )
);

create policy "users delete messages in their conversations"
on public.messages for delete to authenticated
using (
  exists (
    select 1 from public.conversations c
    where c.id = conversation_id and c.profile_id = (select auth.uid())
  )
);

grant select, insert, update, delete on public.conversations to authenticated;
grant select, insert, delete on public.messages to authenticated;
