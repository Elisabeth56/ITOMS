import type { RequestHandler } from "express"
import { hasRole, type UserRole } from "@itoms/shared"
import { pool } from "./db"
import { AppError } from "./errors"
import { verifyAccessToken } from "./token"

export type User = { id: string; full_name: string; email: string; role: UserRole }

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace -- Express only exposes Request for extension this way
  namespace Express {
    interface Request {
      user: User
    }
  }
}

/** Requires a valid session and loads the caller's profile onto `req.user`. */
export const requireUser: RequestHandler = async (req, _res, next) => {
  const token = req.headers.authorization?.replace(/^Bearer /, "")
  const userId = token ? await verifyAccessToken(token) : null
  if (!userId) throw new AppError(401, "not_signed_in", "Sign in to continue.")

  // role is read from the database on every request, so a demotion takes effect immediately
  const { rows } = await pool.query<User>(
    "select id, full_name, email, role from profiles where id = $1 and is_active",
    [userId],
  )
  if (!rows[0]) throw new AppError(401, "not_signed_in", "Sign in to continue.")

  req.user = rows[0]
  next()
}

export function requireRole(role: UserRole): RequestHandler {
  return (req, _res, next) => {
    if (!hasRole(req.user.role, role)) {
      throw new AppError(403, "not_allowed", "You do not have permission to do that.")
    }
    next()
  }
}
