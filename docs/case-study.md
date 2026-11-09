# ITOMS: an IT desk for a 50-person office

_Draft. Edit it into your own words before publishing._

## Context

ITOMS is a ticketing and device-tracking system for a small office's IT team. I designed it from what I saw during an IT support internship at a 50-person company in Lagos, where I fixed printers, Wi-Fi, laptops and software problems every day.

## The problem

Requests came in by walking over, a phone call or a WhatsApp message. Nothing recorded who asked, what was done or how long it took. We could not say which laptop someone held or how much a printer had cost in repairs, and the same jammed printer came back every few weeks. Many requests also had a safe first step, like restarting the printer or rejoining the Wi-Fi, that the person could have tried while waiting.

The constraints: about 50 users, a few hundred tickets a year, free tiers only, and a build that one person could finish and explain.

## Approach

**A relational model where the database guards the rules.** Tickets, people and devices are joined on almost every screen, and every change writes a history row. I used Postgres and pushed the rules that must never break into it: a partial unique index allows one holder per device, another allows one pending change request per device, a check constraint refuses a resolved ticket without a resolution, and a trigger keeps the activity trail append-only. The API checks the same rules so it can return clear messages, but the database is the last line.

**Concurrency in the right place.** When two IT staff act on the same ticket, the API locks the row inside a transaction so the second one sees the first one's change. Duplicate inserts, like a second change request for the same laptop, are stopped by the unique index instead, because a row that does not exist yet has nothing to lock.

**Due times without a job queue.** Each priority has a due time (urgent 4 hours, low 72). A trigger sets it when a ticket is filed or re-prioritised, and "late" is computed in each query. There is no scheduler to keep in sync, which matters on a free plan where cron runs once a day.

**A small AI feature, measured before trusted.** Before filing, an employee can ask for a quick fix. It is one prompt with a validated JSON answer: either up to five safe steps, or a hand-over to IT for anything involving passwords, damage, security or several people. A filter removes forbidden steps the model still writes, and every suggestion is stored, so IT sees what was tried. I built a golden set of 32 cases and 15 unseen ones and run them on every prompt change. The latest run: 31 of 32 and 14 of 15 correct hand-over decisions, 2.2 seconds at p95, on Groq's free tier.

**An interface for the people who use it most.** Employees get a four-stage tracker and confirm the fix themselves. IT staff get a queue they can work from the keyboard. Devices are shown as coloured asset tags with the number in a dot-matrix face, so the thing the system tracks is the thing you see.

## Results

- Three roles, eleven screens, a public landing page and one-click demo accounts.
- 57 API tests against a real Postgres, and Playwright tests of the three critical flows against a local Supabase stack in CI.
- The quick fix eval runs on GitHub and commits its results, so quality is tracked per change.
- Every major choice is recorded as a decision record, including the ones I got wrong and corrected.

## What I learned

The hardest part was deciding where each rule should live. Putting the one-holder rule in a unique index instead of application code removed a whole class of race conditions, and it made the tests simpler.

I also learned to check my own claims. One decision record said the daily cron kept the free database awake. During the rebuild I found the project paused, because the live API had never been given its database settings. I corrected the record instead of deleting it.

## Next

Business-hour due times, notifications for late tickets, and retrieval over past resolution notes once there are enough of them to make the quick fix smarter than a single prompt.
