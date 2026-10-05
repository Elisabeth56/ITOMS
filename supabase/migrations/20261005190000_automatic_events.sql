-- Some changes are made by the system, not a person (a resolved ticket closing itself
-- after 3 days). Those events have no actor.
alter table ticket_events alter column actor_id drop not null;
