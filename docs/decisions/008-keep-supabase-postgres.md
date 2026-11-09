# 008: Keep Postgres on Supabase

**Date:** 2026-11-09
**Status:** Accepted. Confirms [002](002-postgres.md).

## Context

The question was whether a different database would serve ITOMS better. The access patterns decide it:

| Pattern | Who | How often | Shape |
|---|---|---|---|
| IT queue | IT staff | Many times a day | Filter by status and priority, sort by due time, join the reporter |
| My tickets | Employee | A few times a day | Filter by reporter, newest first |
| Ticket detail | IT staff | Per ticket opened | Ticket, events, comments and AI suggestion by ticket id |
| Dashboard | IT staff | Daily | Counts and averages over all tickets |
| Device detail | Everyone | Per visit | Device, current holder, assignment and repair history |
| Pending change requests | IT staff | Daily | Filter by status, oldest first |

Almost every read joins two or three entities, and every write that changes state also writes history in the same transaction.

## Options

- **A. Supabase Postgres.** Current setup. Auth bundled.
- **B. Neon Postgres plus a separate auth library.** Database branches per pull request, but auth would have to move too.
- **C. MongoDB.** Documents fit poorly: the main screens are joins, and writes span several collections.

## Decision

Option A. The engine fits the data. The host stays awake because the daily cron call queries the database, which keeps the free-tier project from pausing.

## Consequences

- Constraints carry the rules that must never break: unique tags and serials, one holder per device, one pending change request per device, append-only history.
- Auth is tied to Supabase (see 009).

## At 10x

About 36,000 tickets a year and 1,000 devices. Postgres handles this with the current indexes. What breaks first is connection count from serverless functions (see 007), then free-tier database size if attachments are ever stored in rows instead of object storage.

## Revisit if

Search over ticket text needs typo tolerance or ranking beyond Postgres full-text search, or the free tier's size or connection limits are reached.
