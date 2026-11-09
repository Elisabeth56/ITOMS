# 013: Public demo accounts, with a read-only administrator

**Date:** 2026-11-09
**Status:** Accepted.

## Context

Reviewers should try ITOMS without asking for an invite, so the sign-in page offers three seeded accounts (employee, IT staff, administrator) and prints their shared password. Anyone on the internet can therefore sign in as an administrator, who can invite real email addresses, change roles and deactivate people.

## Options

- **A. A read-only demo administrator.** The administrator can see everything but change nothing; employee and IT staff demo accounts keep working normally.
- **B. Reset the demo data every night.** Damage lasts at most a day, but invites to real addresses would already have been sent.
- **C. No public administrator.** Safe, but reviewers never see the administrator's view.

## Decision

Option A. `profiles.is_demo` marks the three accounts. After loading the caller, the API refuses any write from a demo administrator and any change a demo account makes to its own profile, with 403 `demo_read_only`. Employee and IT staff demo accounts still file, work and resolve tickets, because that is what a reviewer comes to try.

## Consequences

- The demo data drifts as reviewers file and close tickets. That is acceptable, and the seed can be reloaded with `pnpm db:reset` locally or by hand on the hosted project.
- The check runs on every request, from the same row already loaded for the role.

## Revisit if

Reviewer activity makes the demo data unreadable. Then add option B on top.
