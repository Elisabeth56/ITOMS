import cors from "cors"
import express from "express"
import helmet from "helmet"
import { pinoHttp } from "pino-http"
import { requireRole, requireUser } from "./auth"
import { env } from "./env"
import { AppError, errorHandler, notFound } from "./errors"
import { assetsRouter } from "./features/assets/router"
import { assistRouter } from "./features/assist/router"
import { dashboardRouter } from "./features/dashboard/router"
import { closeStaleTickets } from "./features/tickets/logic"
import { ticketsRouter } from "./features/tickets/router"
import { usersRouter } from "./features/users/router"

export const app = express()

app.use(helmet())
app.use(cors({ origin: env.WEB_ORIGIN }))
app.use(express.json({ limit: "100kb" }))
app.use(
  pinoHttp({
    enabled: env.NODE_ENV !== "test",
    // a logged session token could be replayed until it expires, so never write one down
    redact: ["req.headers.authorization", "req.headers.cookie", 'res.headers["set-cookie"]'],
  }),
)

app.get("/health", (_req, res) => {
  res.json({ ok: true })
})
// called once a day by the host's scheduler, which sends the shared secret
app.get("/internal/close-stale-tickets", async (req, res) => {
  if (!env.CRON_SECRET || req.headers.authorization !== `Bearer ${env.CRON_SECRET}`) {
    throw new AppError(401, "not_allowed", "Not allowed.")
  }
  res.json({ closed: await closeStaleTickets() })
})
app.get("/me", requireUser, (req, res) => {
  res.json(req.user)
})
app.use("/tickets", requireUser, ticketsRouter)
app.use("/assist", requireUser, assistRouter)
app.use("/assets", requireUser, assetsRouter)
app.use("/dashboard", requireUser, requireRole("it_staff"), dashboardRouter)
app.use("/users", requireUser, usersRouter)

app.use(notFound)
app.use(errorHandler)
