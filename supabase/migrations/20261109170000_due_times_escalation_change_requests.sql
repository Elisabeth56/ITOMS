-- Due times, resolution notes, escalation and device change requests (ADRs 010, 011, 012).

alter type ticket_event_type add value if not exists 'escalated';

-- How long a ticket may wait before it is late. Wall-clock hours, not business hours (ADR 010).
create function priority_due_interval(p public.ticket_priority) returns interval
language sql immutable set search_path = '' as $$
  select case p
    when 'urgent' then interval '4 hours'
    when 'high' then interval '8 hours'
    when 'medium' then interval '24 hours'
    else interval '72 hours'
  end
$$;

alter table tickets
  add column resolution text,
  add column due_at timestamptz,
  add column escalated_at timestamptz;

-- Tickets fixed before resolution notes existed get a placeholder, so the rule below can hold.
update tickets set resolution = 'Not recorded: resolved before resolution notes were required.'
  where status in ('resolved', 'closed');
update tickets set due_at = created_at + priority_due_interval(priority);
alter table tickets alter column due_at set not null;
alter table tickets add constraint tickets_resolution_required
  check (status not in ('resolved', 'closed') or resolution is not null);

-- The due time always follows the priority, measured from when the ticket was filed,
-- so raising an old ticket to urgent can make it late at once.
create function set_due_at() returns trigger language plpgsql set search_path = '' as $$
begin
  new.due_at = new.created_at + public.priority_due_interval(new.priority);
  return new;
end $$;
create trigger tickets_set_due_at before insert or update of priority on tickets
  for each row execute function set_due_at();

-- The queue is read as "open work, soonest due first".
drop index tickets_queue_idx;
create index tickets_queue_idx on tickets (status, due_at);

-- An employee proposes corrections to a device they hold; IT approves or rejects (ADR 011).
create type change_request_status as enum ('pending', 'approved', 'rejected');

create table asset_change_requests (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references assets (id) on delete cascade,
  requested_by uuid not null references profiles (id),
  -- only these device fields may be proposed; an empty proposal is meaningless
  proposed jsonb not null check (
    jsonb_typeof(proposed) = 'object'
    and proposed <> '{}'
    and proposed - array['location', 'brand', 'model', 'serial_number'] = '{}'::jsonb
  ),
  note text,
  status change_request_status not null default 'pending',
  decided_by uuid references profiles (id),
  decided_at timestamptz,
  decision_note text,
  created_at timestamptz not null default now(),
  -- a request is decided exactly when it is no longer pending
  check ((status = 'pending') = (decided_by is null and decided_at is null))
);
-- One open request per device, so IT never has to merge two proposals.
create unique index asset_change_requests_one_pending_idx on asset_change_requests (asset_id)
  where status = 'pending';
create index asset_change_requests_status_idx on asset_change_requests (status, created_at);

alter table asset_change_requests enable row level security;
