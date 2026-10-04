# ITOMS

Internal IT Operations Management System: one place for a company's IT team to take support requests, track devices, and keep each device's repair history.

## What it does

- Employees report a problem in under a minute and follow it until it is fixed.
- An optional AI quick fix suggests safe first steps before a request is sent.
- IT staff assign, prioritise and resolve tickets, with a full history of every change.
- Every device has a tag, a holder, and a record of each repair and what it cost.
- Administrators invite people and decide who is an employee, IT staff or administrator.

## How it fits together

`apps/web` (Next.js) shows the screens. `apps/server` (Express) applies the rules and is the only part that reaches the database. Sign-in and the Postgres database are on Supabase. See [docs/architecture.md](docs/architecture.md) for the diagram and [docs/decisions](docs/decisions) for why each choice was made.

## Run locally

Prerequisites: Node 22+, pnpm, and a Supabase project.

```bash
pnpm install
cp .env.example apps/server/.env          # then fill in the values
cp apps/web/.env.example apps/web/.env.local
pnpm dev                                   # web on :3000, API on :4000
```

`apps/server/.env`

| Variable                         | Value                                              |
| -------------------------------- | -------------------------------------------------- |
| `DATABASE_URL`                   | Supabase dashboard, Connect, Session pooler string |
| `SUPABASE_URL`                   | `https://<project-ref>.supabase.co`                |
| `WEB_ORIGIN`                     | `http://localhost:3000`                            |
| `PORT`                           | `4000`                                             |
| `GROQ_API_KEY`, `GEMINI_API_KEY` | optional, for the AI quick fix                     |
| `SUPABASE_SERVICE_ROLE_KEY`      | optional, for inviting people                      |

`apps/web/.env.local`

| Variable                               | Value                                         |
| -------------------------------------- | --------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`             | same as `SUPABASE_URL`                        |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase dashboard, API keys, publishable key |
| `API_URL`                              | `http://localhost:4000`                       |

### Demo accounts

`supabase/seed.sql` loads invented people, devices and tickets. Every demo account uses the password `itoms-demo-2026`.

| Email                         | Role          |
| ----------------------------- | ------------- |
| `amaka.obi@itoms.example`     | Administrator |
| `chidi.eze@itoms.example`     | IT staff      |
| `adaeze.okafor@itoms.example` | Employee      |

## Checks

```bash
pnpm lint
pnpm typecheck
pnpm test          # API tests; needs a local Postgres, see apps/server/vitest.config.ts
pnpm eval          # scores the AI quick fix against 32 cases; needs an API key
```

## Author

Elisabeth Nnamani
