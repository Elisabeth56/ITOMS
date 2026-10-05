import pg from "pg"
import { env } from "./env"

// a small pool: on serverless hosts many copies of the API share the database's connection limit
export const pool = new pg.Pool({ connectionString: env.DATABASE_URL, max: 3 })

// The database can drop an idle connection (restart, pooler timeout). Without this handler
// that would crash the whole API; the pool simply opens a new connection on the next query.
pool.on("error", (error) => console.error("idle database connection lost:", error.message))

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
