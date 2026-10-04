import cors from "cors"
import express from "express"
import helmet from "helmet"
import { pinoHttp } from "pino-http"
import { requireRole, requireUser } from "./auth"
import { env } from "./env"
import { errorHandler, notFound } from "./errors"
import { assetsRouter } from "./features/assets/router"
import { assistRouter } from "./features/assist/router"
import { dashboardRouter } from "./features/dashboard/router"
import { ticketsRouter } from "./features/tickets/router"
import { usersRouter } from "./features/users/router"

export const app = express()

app.use(helmet())
app.use(cors({ origin: env.WEB_ORIGIN }))
app.use(express.json({ limit: "100kb" }))
app.use(pinoHttp({ enabled: env.NODE_ENV !== "test" }))

app.get("/health", (_req, res) => {
  res.json({ ok: true })
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
