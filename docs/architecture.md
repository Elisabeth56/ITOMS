# Architecture

```mermaid
flowchart LR
  subgraph Browser
    W[Next.js web app]
  end
  subgraph Vercel
    A[Express API, one function]
    CR[Daily cron]
  end
  subgraph Supabase
    AU[Auth]
    DB[(Postgres)]
  end
  subgraph AI providers
    G[Groq]
    GM[Gemini, fallback]
  end
  W -- sign in --> AU
  W -- REST + session token --> A
  A -- verify token --> AU
  A -- SQL --> DB
  A -- quick fix prompt --> G
  A -. if Groq fails .-> GM
  CR -- close stale tickets --> A
```

1. The user signs in through Supabase Auth and the web app receives a session token.
2. The web app calls the API with that token.
3. The API verifies the token, loads the user's role from `profiles`, and applies role and ownership rules.
4. The API reads and writes Postgres. Changes to a ticket and its activity trail happen in one transaction.
5. The optional quick fix sends the problem text to Groq, or Gemini if Groq fails, and stores the answer before a ticket exists.
6. Once a day Vercel Cron calls the API to close tickets left resolved for 3 days.

## Layout

| Path              | Holds                                                                     |
| ----------------- | ------------------------------------------------------------------------- |
| `apps/web`        | Next.js frontend: sign-in, tickets, quick fix, devices, people            |
| `apps/server`     | Express API: `features/<name>/router.ts` for routes, `logic.ts` for rules |
| `packages/shared` | Validation schemas and vocabulary used by both apps                       |
| `supabase/`       | Migrations, seed data and local Supabase config (`pnpm db:reset`)         |
| `docs/decisions`  | Why each major choice was made                                            |

## Ticket lifecycle

```mermaid
stateDiagram-v2
  [*] --> open
  open --> assigned: IT assigns an owner
  assigned --> in_progress
  in_progress --> waiting: blocked
  waiting --> in_progress: unblocked
  in_progress --> resolved
  resolved --> in_progress: reporter says not fixed
  resolved --> closed: reporter confirms
  closed --> [*]
```
