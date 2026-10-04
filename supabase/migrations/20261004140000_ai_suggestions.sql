-- Optional AI quick fix: what the assistant suggested before a ticket was filed, and what happened next.

create type suggestion_outcome as enum ('solved', 'ticket_filed');

create table ai_suggestions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id),
  category ticket_category not null,
  title text not null,
  description text not null,
  can_help boolean not null,
  summary text not null,
  steps jsonb not null default '[]',
  outcome suggestion_outcome, -- null: the employee left without telling us
  ticket_id uuid references tickets (id) on delete set null,
  model text not null,
  created_at timestamptz not null default now()
);
create index ai_suggestions_user_idx on ai_suggestions (user_id, created_at);
create index ai_suggestions_ticket_idx on ai_suggestions (ticket_id);

alter table ai_suggestions enable row level security;

-- Pin the search path on trigger functions (Supabase security advisor).
alter function set_updated_at() set search_path = '';
alter function forbid_update() set search_path = '';
