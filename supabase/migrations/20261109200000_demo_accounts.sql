-- The public demo accounts. Their password is printed on the sign-in page, so the API keeps
-- the demo administrator read-only and stops any demo account renaming itself (ADR 013).
alter table profiles add column is_demo boolean not null default false;
