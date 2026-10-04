-- ITOMS initial schema: people, tickets, assets and their histories.

create type user_role as enum ('employee', 'it_staff', 'admin');
create type ticket_status as enum ('open', 'assigned', 'in_progress', 'waiting', 'resolved', 'closed');
create type ticket_priority as enum ('low', 'medium', 'high', 'urgent');
create type ticket_category as enum ('new_setup', 'hardware', 'printer', 'network', 'software', 'account', 'other');
create type ticket_event_type as enum ('created', 'status_changed', 'assigned', 'priority_changed');
create type asset_type as enum ('laptop', 'desktop', 'printer', 'monitor', 'network_device', 'phone', 'other');
create type asset_status as enum ('in_stock', 'assigned', 'under_repair', 'retired');

create function set_updated_at() returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- One row per user; the login itself lives in Supabase Auth.
create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  email text not null unique,
  department text,
  role user_role not null default 'employee',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table assets (
  id uuid primary key default gen_random_uuid(),
  asset_tag text not null unique,
  type asset_type not null,
  brand text,
  model text,
  serial_number text unique,
  status asset_status not null default 'in_stock',
  location text,
  purchase_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger assets_set_updated_at before update on assets
  for each row execute function set_updated_at();

create table tickets (
  id uuid primary key default gen_random_uuid(),
  number integer generated always as identity unique,
  title text not null check (char_length(title) between 3 and 150),
  description text not null,
  category ticket_category not null,
  priority ticket_priority not null default 'medium',
  status ticket_status not null default 'open',
  reporter_id uuid not null references profiles (id),
  assignee_id uuid references profiles (id),
  asset_id uuid references assets (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  resolved_at timestamptz,
  closed_at timestamptz
);
create trigger tickets_set_updated_at before update on tickets
  for each row execute function set_updated_at();

-- IT queue, "my tickets" and "assigned to me" are the three list views.
create index tickets_queue_idx on tickets (status, priority, created_at);
create index tickets_reporter_idx on tickets (reporter_id, created_at);
create index tickets_assignee_idx on tickets (assignee_id, status);
create index tickets_asset_idx on tickets (asset_id);

create table ticket_comments (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references tickets (id) on delete cascade,
  author_id uuid not null references profiles (id),
  body text not null,
  is_internal boolean not null default false,
  created_at timestamptz not null default now()
);
create index ticket_comments_ticket_idx on ticket_comments (ticket_id, created_at);

create table ticket_events (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references tickets (id) on delete cascade,
  actor_id uuid not null references profiles (id),
  type ticket_event_type not null,
  from_value text,
  to_value text,
  created_at timestamptz not null default now()
);
create index ticket_events_ticket_idx on ticket_events (ticket_id, created_at);

-- The activity trail is the audit record, so rows can be added but never edited.
create function forbid_update() returns trigger language plpgsql as $$
begin
  raise exception '% is append-only', tg_table_name;
end $$;
create trigger ticket_events_append_only before update on ticket_events
  for each row execute function forbid_update();

create table asset_assignments (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references assets (id) on delete cascade,
  employee_id uuid not null references profiles (id),
  assigned_by uuid not null references profiles (id),
  assigned_at timestamptz not null default now(),
  returned_at timestamptz,
  condition_note text
);
-- A device can be held by one person at a time; past assignments stay as history.
create unique index asset_assignments_one_open_idx on asset_assignments (asset_id)
  where returned_at is null;
create index asset_assignments_employee_idx on asset_assignments (employee_id);

create table maintenance_logs (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references assets (id) on delete cascade,
  ticket_id uuid references tickets (id) on delete set null,
  performed_by uuid not null references profiles (id),
  action text not null,
  parts text,
  cost numeric(12, 2) check (cost >= 0), -- naira
  performed_at timestamptz not null default now()
);
create index maintenance_logs_asset_idx on maintenance_logs (asset_id, performed_at);

-- All access goes through the API, which checks roles itself. RLS with no policies
-- shuts the tables to Supabase's public client keys, so the API is the only way in.
alter table profiles enable row level security;
alter table assets enable row level security;
alter table tickets enable row level security;
alter table ticket_comments enable row level security;
alter table ticket_events enable row level security;
alter table asset_assignments enable row level security;
alter table maintenance_logs enable row level security;
