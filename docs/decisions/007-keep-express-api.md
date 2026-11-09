# 007: Keep the Express API, for product reasons

**Date:** 2026-11-09
**Status:** Accepted. Replaces the reasoning in [001](001-separate-express-api.md).

## Context

ADR 001 justified the separate API by the needs of an academic panel. ITOMS is now a portfolio product, so the API has to earn its place on product grounds. The default for a CRUD app with auth is Next.js alone (server actions and route handlers).

## Options

- **A. Keep Express, deployed as a Vercel function.** Already built and tested over HTTP.
- **B. Move everything into Next.js server actions.** One deploy. About a day of rewriting and new tests, with no change a user would see.
- **C. Express in a long-running container.** Allows WebSockets and workers, but free container hosts sleep when idle.

## Decision

Option A. The API is the one place the business rules live, and it is the natural entry point for the clients an IT system grows: an email-to-ticket webhook, or an inventory agent that reports device specs (the model Snipe-IT and GLPI use). The rules in `features/*/logic.ts` are plain functions, so option B stays a mechanical move if the API is ever dropped.

## Consequences

- Two Vercel projects and two sets of environment variables.
- Every request may start a fresh copy of the API, so the database pool stays at 3 and uses the transaction pooler.
- No long-lived connections or long jobs, which rules out WebSockets and work longer than a function may run.

## At 10x (500 people, about 100 tickets a day)

Request volume is still small. The first limit is database connections: concurrent function copies times a pool of 3 against the pooler's client limit. Watch connection errors in the logs.

## Revisit if

Live updates (WebSockets or server-sent events to many clients) or background work longer than a function run becomes a requirement. Move to option C then.
