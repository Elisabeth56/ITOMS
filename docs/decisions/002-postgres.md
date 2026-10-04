# 002: Postgres (on Supabase) as the only data store

**Date:** 2026-10-04

## Context

The data is small (about 50 employees, around 100 devices, a few thousand tickets a year) and heavily related: a ticket has a reporter, an assignee and sometimes a device; a device has holders and repairs over time. The dashboard needs counts and averages.

## Decision

One Postgres database, hosted on Supabase's free tier. Rules that must never be broken are database constraints: unique asset tags and serial numbers, one open assignment per device, enum types for status values, and an append-only activity trail.

## Consequences

- Joins and reporting are plain SQL.
- No cache, queue or second database; nothing at this scale needs one.
- Free-tier projects pause when idle. Wake the project the day before a demo.

## Revisit if

Search over ticket text or attachments outgrows what Postgres does comfortably.
