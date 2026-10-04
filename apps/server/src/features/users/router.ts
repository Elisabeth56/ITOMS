// People: IT staff can look them up; only an administrator can invite or change them.
import { Router } from "express"
import {
  inviteUserSchema,
  updateUserSchema,
  type InviteUserInput,
  type UpdateUserInput,
} from "@itoms/shared"
import { requireRole } from "../../auth"
import { pool } from "../../db"
import { AppError } from "../../errors"
import { inviteAuthUser } from "../../supabase-admin"
import { idParams, validate } from "../../validate"

export const usersRouter = Router()
const admin = requireRole("admin")
const columns = "id, full_name, email, department, role, is_active, created_at"

usersRouter.get("/", requireRole("it_staff"), async (_req, res) => {
  const { rows } = await pool.query(`select ${columns} from profiles order by full_name`)
  res.json(rows)
})

usersRouter.post("/", admin, validate({ body: inviteUserSchema }), async (req, res) => {
  const input = req.body as InviteUserInput
  const existing = await pool.query("select 1 from profiles where email = $1", [input.email])
  if (existing.rowCount) {
    throw new AppError(409, "user_exists", "Someone with that email already has an account.")
  }

  const id = await inviteAuthUser(input.email)
  const { rows } = await pool.query(
    `insert into profiles (id, full_name, email, department, role)
     values ($1, $2, $3, $4, $5) returning ${columns}`,
    [id, input.full_name, input.email, input.department ?? null, input.role],
  )
  res.status(201).json(rows[0])
})

usersRouter.patch(
  "/:id",
  admin,
  validate({ params: idParams, body: updateUserSchema }),
  async (req, res) => {
    const input = req.body as UpdateUserInput
    const targetId = req.params.id as string
    // an administrator cannot lock themselves out
    if (
      targetId === req.user.id &&
      (input.is_active === false || (input.role && input.role !== "admin"))
    ) {
      throw new AppError(
        409,
        "cannot_demote_self",
        "Ask another administrator to change your own access.",
      )
    }

    const names = Object.keys(input)
    const { rows } = await pool.query(
      `update profiles set ${names.map((name, i) => `${name} = $${i + 2}`).join(", ")}
       where id = $1 returning ${columns}`,
      [targetId, ...Object.values(input)],
    )
    if (!rows[0]) throw new AppError(404, "user_not_found", "That person does not exist.")
    res.json(rows[0])
  },
)
