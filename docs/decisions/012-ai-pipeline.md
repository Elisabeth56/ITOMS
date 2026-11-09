# 012: Keep the single-prompt quick fix; collect resolution notes for later retrieval

**Date:** 2026-11-09
**Status:** Accepted. Builds on [005](005-ai-quick-fix.md).

## Context

The quick fix uses one prompt with a validated JSON answer. The natural next step is retrieval over past tickets (ADR 005), but tickets record no fix, so there is nothing to retrieve.

## Options

- **A. Keep the single prompt, require a resolution note when IT resolves a ticket, and commit an eval baseline.**
- **B. Add retrieval over resolved tickets now.** No resolution text exists, so retrieval would find titles without fixes.
- **C. Add AI triage that suggests a category and priority to IT staff.** Useful at higher volume; at about 10 tickets a day IT can set them by hand.

## Decision

Option A.

- `tickets.resolution` is required to move a ticket to `resolved`.
- The prompt moves to its own markdown file and every call logs a prompt version alongside the model and tokens.
- An eval run is committed as the baseline, and every prompt or model change is compared against it.

## Consequences

- Resolving takes IT staff one more sentence.
- Quick fix quality stays where the eval puts it until retrieval exists.

## At 10x

500 people at the current limit of 10 suggestions an hour each could exceed free-tier request limits during a bad morning (an office-wide outage). The prompt already hands office-wide problems to IT; the next step would be a shared limit across all users, then a paid tier.

## Revisit if

About 200 tickets have resolution notes, or the eval shows misses that past fixes would have answered. Then build option B.
