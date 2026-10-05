import { app } from "./app"
import { pool } from "./db"
import { env } from "./env"

// On Vercel the platform calls the exported app; anywhere else we listen on a port.
if (!process.env.VERCEL) {
  const server = app.listen(env.PORT, () => {
    console.info(`ITOMS API listening on :${env.PORT}`)
  })
  process.on("SIGTERM", () => {
    server.close(() => pool.end())
  })
}

export default app
