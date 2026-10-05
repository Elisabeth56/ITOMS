import { app } from "./app"
import { pool } from "./db"
import { env } from "./env"

// Local and self-hosted entry point. On Vercel, api/index.js serves the bundled app instead.
const server = app.listen(env.PORT, () => {
  console.info(`ITOMS API listening on :${env.PORT}`)
})

process.on("SIGTERM", () => {
  server.close(() => pool.end())
})
