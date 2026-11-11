// Device change requests (ADR 011). The current holder proposes corrections to a device;
// IT approves or rejects. Approving writes the change and closes the request together.
import type {
  CreateChangeRequestInput,
  ChangeRequest,
  ChangeRequestStatus,
  DecideChangeRequestInput,
} from "@itoms/shared"
import type { User } from "../../auth"
import { pool, transaction, type Db } from "../../db"
import { AppError } from "../../errors"
import { writeAssetFields } from "../assets/logic"

const requestSelect = `
  select r.id, r.asset_id, a.asset_tag, r.requested_by, requester.full_name as requested_by_name,
         r.proposed, r.note, r.status, decider.full_name as decided_by_name, r.decided_at,
         r.decision_note, r.created_at
  from asset_change_requests r
  join assets a on a.id = r.asset_id
  join profiles requester on requester.id = r.requested_by
  left join profiles decider on decider.id = r.decided_by`

const requestNotFound = () =>
  new AppError(404, "change_request_not_found", "That change request does not exist.")

/** The holder proposes a change. Someone else's device looks missing, like everywhere else. */
export async function createChangeRequest(
  user: User,
  assetId: string,
  input: CreateChangeRequestInput,
) {
  const holds = await pool.query(
    "select 1 from asset_assignments where asset_id = $1 and employee_id = $2 and returned_at is null",
    [assetId, user.id],
  )
  if (!holds.rowCount) throw new AppError(404, "asset_not_found", "That device does not exist.")

  try {
    const { rows } = await pool.query<{ id: string }>(
      `insert into asset_change_requests (asset_id, requested_by, proposed, note)
       values ($1, $2, $3, $4) returning id`,
      [assetId, user.id, JSON.stringify(input.proposed), input.note ?? null],
    )
    return getChangeRequest(pool, rows[0]!.id)
  } catch (error) {
    // the partial unique index allows one pending request per device
    if ((error as { code?: string }).code === "23505") {
      throw new AppError(
        409,
        "change_request_pending",
        "This device already has a change waiting for IT.",
      )
    }
    throw error
  }
}

export async function listChangeRequests(status: ChangeRequestStatus) {
  const { rows } = await pool.query<ChangeRequest>(
    `${requestSelect} where r.status = $1 order by r.created_at`,
    [status],
  )
  return rows
}

async function getChangeRequest(db: Db, id: string) {
  const { rows } = await db.query<ChangeRequest>(`${requestSelect} where r.id = $1`, [id])
  if (!rows[0]) throw requestNotFound()
  return rows[0]
}

/** Locks a pending request so two people cannot decide it at once. */
async function lockPending(tx: Db, id: string) {
  const { rows } = await tx.query<{ asset_id: string; status: string; proposed: object }>(
    "select asset_id, status, proposed from asset_change_requests where id = $1 for update",
    [id],
  )
  const request = rows[0]
  if (!request) throw requestNotFound()
  if (request.status !== "pending") {
    throw new AppError(409, "change_request_decided", `This request was already ${request.status}.`)
  }
  return request
}

function recordDecision(
  tx: Db,
  user: User,
  id: string,
  status: Exclude<ChangeRequestStatus, "pending">,
  note?: string,
) {
  return tx.query(
    `update asset_change_requests
     set status = $2, decided_by = $3, decided_at = now(), decision_note = $4
     where id = $1`,
    [id, status, user.id, note ?? null],
  )
}

/** Applies the change to the device and closes the request, or does neither. */
export async function approveChangeRequest(
  user: User,
  id: string,
  input: DecideChangeRequestInput,
) {
  await transaction(async (tx) => {
    const request = await lockPending(tx, id)
    // proposed was validated against the device fields when it was created, and the
    // table's check constraint allows no other keys
    await writeAssetFields(tx, request.asset_id, request.proposed as Record<string, unknown>)
    await recordDecision(tx, user, id, "approved", input.note)
  })
  return getChangeRequest(pool, id)
}

export async function rejectChangeRequest(user: User, id: string, input: DecideChangeRequestInput) {
  await transaction(async (tx) => {
    await lockPending(tx, id)
    await recordDecision(tx, user, id, "rejected", input.note)
  })
  return getChangeRequest(pool, id)
}
