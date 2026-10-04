# ITOMS

Internal IT Operations Management System: one place for a company's IT team to take support requests, track devices, and keep each device's repair history.

Status: in development. The database schema and the tickets API are built and tested; assets, maintenance, the dashboard and the web app are next.

## Layout

See [docs/architecture.md](docs/architecture.md) for how the parts fit, and [docs/decisions](docs/decisions) for why.

## Run locally

Prerequisites: Node 22+, pnpm, a Postgres 16 database.

```bash
pnpm install
cp .env.example apps/server/.env   # fill in the values
pnpm dev
```

## Checks

```bash
pnpm lint
pnpm typecheck
pnpm test        # needs a Postgres database; see apps/server/vitest.config.ts
```

## Author

Elisabeth Nnamani
