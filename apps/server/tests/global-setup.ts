// Rebuilds the test database from the real migrations before the suite runs.
import { readdirSync, readFileSync } from "node:fs"
import { join } from "node:path"
import pg from "pg"

const migrationsDir = join(import.meta.dirname, "../../../supabase/migrations")

export default async function setup() {
  const client = new pg.Client({ connectionString: process.env.DATABASE_URL })
  await client.connect()

  // auth.users belongs to Supabase; a one-column stand-in is enough for foreign keys
  await client.query(`
    drop schema if exists public cascade;
    create schema public;
    create schema if not exists auth;
    create table if not exists auth.users (id uuid primary key);
  `)
  for (const file of readdirSync(migrationsDir).sort()) {
    await client.query(readFileSync(join(migrationsDir, file), "utf8"))
  }
  await client.end()
}
