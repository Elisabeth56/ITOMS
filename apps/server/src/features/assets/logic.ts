// Device register: what the company owns, who holds each device, and its repair history.
// A device's status only changes through the actions here, so it always matches its records.
import {
  hasRole,
  type CreateAssetInput,
  type CreateMaintenanceInput,
  type ListAssetsQuery,
  type UpdateAssetInput,
} from "@itoms/shared"
import type { User } from "../../auth"
import { pool, transaction, type Db } from "../../db"
import { AppError } from "../../errors"

const assetSelect = `
  select a.*, holder.id as holder_id, holder.full_name as holder_name
  from assets a
  left join asset_assignments current on current.asset_id = a.id and current.returned_at is null
  left join profiles holder on holder.id = current.employee_id`

const assetNotFound = () => new AppError(404, "asset_not_found", "That device does not exist.")

/** Turns a duplicate tag or serial number into a message the form can show. */
function rethrowDuplicate(error: unknown): never {
  const constraint = (error as { code?: string; constraint?: string }).constraint ?? ""
  if ((error as { code?: string }).code !== "23505") throw error
  const field = constraint.includes("serial") ? "serial_number" : "asset_tag"
  throw new AppError(409, "asset_duplicate", "Another device already uses that value.", {
    fields: { [field]: ["Already in use"] },
  })
}

async function findAsset(db: Db, id: string, lock = false) {
  const { rows } = await db.query(
    `${assetSelect} where a.id = $1 ${lock ? "for update of a" : ""}`,
    [id],
  )
  if (!rows[0]) throw assetNotFound()
  return rows[0]
}

export async function listAssets(query: ListAssetsQuery) {
  const where = ["true"]
  const params: unknown[] = []
  for (const column of ["type", "status"] as const) {
    if (query[column] === undefined) continue
    params.push(query[column])
    where.push(`a.${column} = $${params.length}`)
  }
  if (query.q) {
    // one search box covers the tag, the serial number, the model and the holder's name
    params.push(`%${query.q}%`)
    const n = params.length
    where.push(
      `(a.asset_tag ilike $${n} or a.serial_number ilike $${n} or a.brand ilike $${n} or a.model ilike $${n} or holder.full_name ilike $${n})`,
    )
  }
  const filter = `where ${where.join(" and ")}`

  const total = await pool.query<{ count: number }>(
    `select count(*)::int as count from (${assetSelect} ${filter}) matched`,
    params,
  )
  const { rows } = await pool.query(
    `${assetSelect} ${filter} order by a.asset_tag
     limit $${params.length + 1} offset $${params.length + 2}`,
    [...params, query.page_size, (query.page - 1) * query.page_size],
  )
  return { items: rows, total: total.rows[0]!.count, page: query.page, page_size: query.page_size }
}

/** Devices the user currently holds. */
export async function listMyAssets(user: User) {
  const { rows } = await pool.query(`${assetSelect} where holder.id = $1 order by a.asset_tag`, [
    user.id,
  ])
  return rows
}

export async function getAsset(user: User, id: string) {
  const asset = await findAsset(pool, id)
  // an employee may open only a device they hold; anything else looks missing
  if (!hasRole(user.role, "it_staff") && asset.holder_id !== user.id) throw assetNotFound()

  const assignments = await pool.query(
    `select s.id, s.assigned_at, s.returned_at, s.condition_note,
            employee.full_name as employee_name, staff.full_name as assigned_by_name
     from asset_assignments s
     join profiles employee on employee.id = s.employee_id
     join profiles staff on staff.id = s.assigned_by
     where s.asset_id = $1 order by s.assigned_at desc`,
    [id],
  )
  const maintenance = await pool.query(
    `select m.id, m.action, m.parts, m.cost, m.performed_at, m.ticket_id,
            p.full_name as performed_by_name,
            'IT-' || lpad(t.number::text, 4, '0') as ticket_ref
     from maintenance_logs m
     join profiles p on p.id = m.performed_by
     left join tickets t on t.id = m.ticket_id
     where m.asset_id = $1 order by m.performed_at desc`,
    [id],
  )
  const tickets = await pool.query(
    `select id, 'IT-' || lpad(number::text, 4, '0') as ref, title, status, created_at
     from tickets where asset_id = $1 order by created_at desc`,
    [id],
  )
  return {
    ...asset,
    assignments: assignments.rows,
    maintenance: maintenance.rows,
    tickets: tickets.rows,
  }
}

export async function createAsset(input: CreateAssetInput) {
  try {
    const { rows } = await pool.query<{ id: string }>(
      `insert into assets (asset_tag, type, brand, model, serial_number, location, purchase_date, status)
       values ($1, $2, $3, $4, $5, $6, $7, $8) returning id`,
      [
        input.asset_tag,
        input.type,
        input.brand ?? null,
        input.model ?? null,
        input.serial_number ?? null,
        input.location ?? null,
        input.purchase_date ?? null,
        input.status,
      ],
    )
    return findAsset(pool, rows[0]!.id)
  } catch (error) {
    rethrowDuplicate(error)
  }
}

export async function updateAsset(user: User, id: string, input: UpdateAssetInput) {
  if (input.status === "retired" && !hasRole(user.role, "admin")) {
    throw new AppError(403, "not_allowed", "Only an administrator can retire a device.")
  }

  await transaction(async (tx) => {
    const asset = await findAsset(tx, id, true)
    if (input.status && input.status !== "under_repair" && asset.holder_id) {
      throw new AppError(
        409,
        "asset_still_assigned",
        "Return the device before changing its status.",
      )
    }

    const changes = { ...input }
    const columns = Object.keys(changes)
    const assignments = columns.map((column, i) => `${column} = $${i + 2}`)
    try {
      // column names come from the validated schema, never from raw input
      await tx.query(`update assets set ${assignments.join(", ")} where id = $1`, [
        id,
        ...Object.values(changes),
      ])
    } catch (error) {
      rethrowDuplicate(error)
    }
  })
  return findAsset(pool, id)
}

export async function assignAsset(user: User, id: string, employeeId: string) {
  await transaction(async (tx) => {
    const asset = await findAsset(tx, id, true)
    if (asset.status !== "in_stock" && asset.status !== "in_use") {
      throw new AppError(
        409,
        "asset_not_available",
        `A device that is ${asset.status.replace("_", " ")} cannot be assigned.`,
      )
    }
    const employee = await tx.query("select 1 from profiles where id = $1 and is_active", [
      employeeId,
    ])
    if (!employee.rowCount)
      throw new AppError(422, "employee_not_found", "That person does not exist.")

    await tx.query(
      "insert into asset_assignments (asset_id, employee_id, assigned_by) values ($1, $2, $3)",
      [id, employeeId, user.id],
    )
    await tx.query("update assets set status = 'assigned' where id = $1", [id])
  })
  return findAsset(pool, id)
}

export async function returnAsset(id: string, conditionNote?: string) {
  await transaction(async (tx) => {
    const asset = await findAsset(tx, id, true)
    const closed = await tx.query(
      `update asset_assignments set returned_at = now(), condition_note = $2
       where asset_id = $1 and returned_at is null`,
      [id, conditionNote ?? null],
    )
    if (!closed.rowCount)
      throw new AppError(409, "asset_not_assigned", "Nobody is holding that device.")
    // a device handed back while under repair stays under repair
    if (asset.status === "assigned")
      await tx.query("update assets set status = 'in_stock' where id = $1", [id])
  })
  return findAsset(pool, id)
}

export async function logMaintenance(user: User, id: string, input: CreateMaintenanceInput) {
  await transaction(async (tx) => {
    const asset = await findAsset(tx, id, true)
    if (input.ticket_id) {
      const ticket = await tx.query("select 1 from tickets where id = $1", [input.ticket_id])
      if (!ticket.rowCount)
        throw new AppError(422, "ticket_not_found", "That ticket does not exist.")
    }
    await tx.query(
      `insert into maintenance_logs (asset_id, ticket_id, performed_by, action, parts, cost)
       values ($1, $2, $3, $4, $5, $6)`,
      [id, input.ticket_id ?? null, user.id, input.action, input.parts ?? null, input.cost ?? null],
    )

    if (!input.status_after) return
    // a device someone still holds goes back to them, whatever was asked for
    const next =
      asset.holder_id && input.status_after !== "retired" ? "assigned" : input.status_after
    if (next === "retired" && asset.holder_id) {
      throw new AppError(409, "asset_still_assigned", "Return the device before retiring it.")
    }
    await tx.query("update assets set status = $2 where id = $1", [id, next])
  })
  return getAsset(user, id)
}
