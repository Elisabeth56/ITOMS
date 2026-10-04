import { app } from "./app"
import { pool } from "./db"
import { env } from "./env"

const server = app.listen(env.PORT, () => {
  console.info(`ITOMS API listening on :${env.PORT}`)
})

process.on("SIGTERM", () => {
  server.close(() => pool.end())
})
