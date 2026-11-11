// One search box for the command palette: tickets, devices and people, scoped by role.
// Employees only ever find their own tickets and the devices they hold.
import { Router } from "express"
import { hasRole, searchQuerySchema, type SearchQuery } from "@itoms/shared"
import { pool } from "../../db"
import { validate } from "../../validate"

export const searchRouter = Router()
const LIMIT = 5

searchRouter.get("/", validate({ query: searchQuerySchema }), async (req, res) => {
  const { q } = req.query as unknown as SearchQuery
  const isStaff = hasRole(req.user.role, "it_staff")
  // escape LIKE wildcards so "%" in the box is searched for literally
  const pattern = `%${q.replace(/[\\%_]/g, (c) => `\\${c}`)}%`

  const [tickets, devices, people] = await Promise.all([
    pool.query(
      `select id, 'IT-' || lpad(number::text, 4, '0') as ref, title
       from tickets
       where ($2 or reporter_id = $3)
         and (title ilike $1 or 'IT-' || lpad(number::text, 4, '0') ilike $1)
       order by created_at desc limit ${LIMIT}`,
      [pattern, isStaff, req.user.id],
    ),
    pool.query(
      `select a.id, a.asset_tag, concat_ws(' ', a.brand, a.model) as name, holder.full_name as holder_name
       from assets a
       left join asset_assignments current on current.asset_id = a.id and current.returned_at is null
       left join profiles holder on holder.id = current.employee_id
       where ($2 or holder.id = $3)
         and (a.asset_tag ilike $1 or a.serial_number ilike $1 or a.brand ilike $1 or a.model ilike $1
              or ($2 and holder.full_name ilike $1))
       order by a.asset_tag limit ${LIMIT}`,
      [pattern, isStaff, req.user.id],
    ),
    isStaff
      ? pool.query(
          `select id, full_name, email, role from profiles
           where full_name ilike $1 or email ilike $1 order by full_name limit ${LIMIT}`,
          [pattern],
        )
      : { rows: [] },
  ])
  res.json({ tickets: tickets.rows, devices: devices.rows, people: people.rows })
})
