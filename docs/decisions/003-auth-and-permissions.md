# 003: Supabase Auth for sign-in, API middleware for permissions

**Date:** 2026-10-04

## Context

Three roles (employee, IT staff, admin), each a superset of the one before. Accounts are created by an admin; there is no public sign-up. The hard requirement is that an employee can never read another employee's tickets.

## Decision

- Supabase Auth handles passwords, sessions and invites.
- The API verifies the session token on every request (`src/token.ts`), then loads the caller's role from `profiles` (`src/auth.ts`). The role is never trusted from the token.
- Role checks are middleware (`requireRole`). Ownership checks are part of the SQL query, so another person's ticket is indistinguishable from a missing one.
- Row-level security is enabled on every table with no policies, so Supabase's public keys cannot reach the data. The API is the only way in.

## Consequences

- Writing our own password storage is avoided.
- Token verification uses the project's public signing keys (JWKS), so the project must use Supabase's asymmetric signing keys.

## Revisit if

The company wants single sign-on with existing staff accounts.
