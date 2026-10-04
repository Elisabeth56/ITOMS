import { randomUUID } from "node:crypto"
import type { UserRole } from "@itoms/shared"
import { pool } from "../src/db"

/** Creates a user with the given role and returns the auth header that signs them in. */
export async function createUser(role: UserRole) {
  const id = randomUUID()
  await pool.query("insert into auth.users (id) values ($1)", [id])
  await pool.query("insert into profiles (id, full_name, email, role) values ($1, $2, $3, $4)", [
    id,
    `Test ${role}`,
    `${id}@example.com`,
    role,
  ])
  return { id, auth: { Authorization: `Bearer test:${id}` } }
}
