# 010: Due times from priority, manual escalation to an administrator

**Date:** 2026-11-09
**Status:** Accepted.

## Context

IT teams need to see which tickets are late and pass hard ones up. ITOMS has no notion of a deadline and no way to escalate.

## Options

- **A. Due time from priority, a "late" flag worked out when read, and a manual escalate action.** No job and no new role.
- **B. Escalate automatically when a ticket goes late.** Needs a check every few minutes; Vercel's free plan runs cron jobs once a day.
- **C. A separate manager role that receives escalations.** Another role and another set of permission tests for an office of 50.

## Decision

Option A.

- `tickets.due_at` is set from the priority when a ticket is filed and recomputed when the priority changes: urgent 4 hours, high 8, medium 24, low 72. Hours are wall-clock, not business hours.
- A ticket is late when `due_at < now()` and it is not resolved or closed. This is computed in the query, so it is never stale.
- IT staff can escalate a ticket. This sets `escalated_at`, writes an `escalated` event, and puts the ticket at the top of the administrators' view. Administrators act as the IT manager.

## Consequences

- Wall-clock hours make a ticket filed on Friday evening late by Monday. Accepted for now and visible in the UI.
- Nothing happens on its own when a ticket goes late. Someone has to look at the queue.

## At 10x

At about 100 tickets a day, people stop scanning the queue for late tickets. That is the point to add automatic escalation and notifications, which needs a scheduler that runs more than once a day.

## Revisit if

The company works fixed hours and wants business-hour due times, or late tickets go unnoticed.
