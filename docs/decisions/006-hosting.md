# 006: Host both the web app and the API on Vercel

**Date:** 2026-10-05

## Context

ADR 001 split the system into a Next.js web app and an Express API. Both need a free host that stays reachable for a live demo. Free container hosts put an idle service to sleep, which means a slow or failed first request in front of a panel.

## Options

- **Vercel for the web app, a container host for the API.** Two dashboards, and the API sleeps when idle.
- **Vercel for both, as two projects from the same repository.** The Express app runs as a function; no sleeping process to wake.

## Decision

Two Vercel projects from this repository: `apps/web` and `apps/server`. On Vercel, `pnpm build` bundles the API and the shared package into one file with esbuild and `api/index.js` serves it as a function. `src/index.ts` still listens on a port everywhere else, so local development and the tests are unchanged.

## Consequences

- Each request may run in a fresh copy of the API, so the database pool is kept small (3) and the connection string must be Supabase's transaction pooler (port 6543).
- There is no always-on process, so scheduled work uses Vercel Cron. A daily call to `/internal/close-stale-tickets`, protected by `CRON_SECRET`, closes tickets left resolved for 3 days.
- The web app reaches the API over the public internet, server to server. The session token is never exposed to browser code.

## Revisit if

The API needs long-lived connections (live updates over WebSockets) or background jobs longer than a function may run.
