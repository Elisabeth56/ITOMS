# 004: Plain SQL through node-postgres, no ORM

**Date:** 2026-10-04

## Context

Several operations must be all-or-nothing: changing a ticket and writing its activity trail, or assigning a device and updating its status.

## Options

- **supabase-js:** no multi-statement transactions without stored procedures.
- **An ORM (Prisma, Drizzle):** another schema to keep in step with the migrations.
- **node-postgres with SQL:** transactions are direct, and queries read the same in the code and in the report.

## Decision

`pg` with hand-written SQL, and one small `transaction()` helper in `src/db.ts`.

## Consequences

Result rows are typed by hand next to each query. With seven tables this is manageable.

## Revisit if

The schema grows enough that hand-typed rows drift from the database.
