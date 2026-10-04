# 001: Separate Express API between the web app and the database

**Date:** 2026-10-04

## Context

ITOMS is an academic project defended in front of a panel. The system has to show a clear client, server and database split, and a REST API that can be explained and tested on its own.

## Options

- **A. Next.js + Supabase only.** Least code. Access rules live in row-level security policies.
- **B. Next.js + Express API + Postgres.** One more service to deploy. Access rules live in API middleware.
- **C. Next.js + a document database.** Poor fit: tickets, people and devices are joined on almost every page.

## Decision

Option B. `apps/web` (Next.js) talks to `apps/server` (Express, TypeScript) over REST. The API is the only thing that reads or writes the database.

## Consequences

- Every permission check is ordinary TypeScript that can be unit tested and shown in the report.
- Two deploys instead of one. Free API hosts sleep when idle, so the demo needs a warm-up.
- Express was chosen over FastAPI so the web app and API share one language and one set of validation schemas (`packages/shared`).

## Revisit if

The API host becomes the main source of demo failures, or a Python-only feature (for example AI ticket triage) is added.
