# 009: Keep Supabase Auth, with roles read from the database

**Date:** 2026-11-09
**Status:** Accepted. Confirms [003](003-auth-and-permissions.md).

## Options

- **A. Supabase Auth.** Already in place, with invites and password resets.
- **B. Better Auth.** Self-owned in our own Postgres, but every account would need migrating.
- **C. Clerk.** Polished sign-in screens, but another vendor for 50 people.

## Decision

Option A. The API verifies the session token against the project's public keys and reads the role from `profiles` on every request, so a demotion or deactivation applies on the next request rather than when the token expires.

## Consequences

- One extra indexed query per request.
- No public sign-up. Admins invite people.

## At 10x

One primary-key lookup per request is still negligible. Invites by hand stop scaling first.

## Revisit if

The company wants single sign-on with its existing staff accounts (Google Workspace or Microsoft 365).
