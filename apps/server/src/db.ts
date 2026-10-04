import pg from "pg"
import { env } from "./env"

export const pool = new pg.Pool({ connectionString: env.DATABASE_URL })

/** Anything that can run a query: the pool, or a client inside a transaction. */
export type Db = Pick<pg.Pool, "query">

/** Runs `fn` in one transaction; any thrown error rolls everything back. */
export async function transaction<T>(fn: (tx: Db) => Promise<T>): Promise<T> {
  const client = await pool.connect()
  try {
    await client.query("begin")
    const result = await fn(client)
    await client.query("commit")
    return result
  } catch (error) {
    await client.query("rollback")
    throw error
  } finally {
    client.release()
  }
}
