// Ticket rules: who can see a ticket, who can change it, and which status moves are legal.
// Employees only ever reach their own tickets; every change is written to ticket_events.
import {
  hasRole,
  statusTransitions,
  type CreateCommentInput,
  type CreateTicketInput,
  type ListTicketsQuery,
  type TicketPriority,
  type TicketStatus,
  type UpdateTicketInput,
} from "@itoms/shared"
import type { User } from "../../auth"
import { pool, transaction, type Db } from "../../db"
import { AppError } from "../../errors"

type Ticket = {
  id: string
  ref: string
  title: string
  description: string
  category: string
  priority: TicketPriority
  status: TicketStatus
  reporter_id: string
  reporter_name: string
  assignee_id: string | null
  assignee_name: string | null
  asset_id: string | null
  created_at: string
  updated_at: string
  resolved_at: string | null
  closed_at: string | null
}

const ticketSelect = `
  select t.id, 'IT-' || lpad(t.number::text, 4, '0') as ref, t.title, t.description,
         t.category, t.priority, t.status, t.reporter_id, reporter.full_name as reporter_name,
         t.assignee_id, assignee.full_name as assignee_name, t.asset_id,
         t.created_at, t.updated_at, t.resolved_at, t.closed_at
  from tickets t
  join profiles reporter on reporter.id = t.reporter_id
  left join profiles assignee on assignee.id = t.assignee_id`

const isStaff = (user: User) => hasRole(user.role, "it_staff")
const ticketNotFound = () => new AppError(404, "ticket_not_found", "That ticket does not exist.")

/** Loads a ticket the user is allowed to see. Other people's tickets look like missing ones. */
async function findTicket(db: Db, user: User, id: string, lock = false) {
  const { rows } = await db.query<Ticket>(
    `${ticketSelect} where t.id = $1 and ($2 or t.reporter_id = $3) ${lock ? "for update of t" : ""}`,
    [id, isStaff(user), user.id],
  )
  if (!rows[0]) throw ticketNotFound()
  return rows[0]
}

function logEvent(
  db: Db,
  ticketId: string,
  actorId: string,
  type: string,
  from: string | null,
  to: string | null,
) {
  return db.query(
    "insert into ticket_events (ticket_id, actor_id, type, from_value, to_value) values ($1, $2, $3, $4, $5)",
    [ticketId, actorId, type, from, to],
  )
}

export async function createTicket(user: User, input: CreateTicketInput) {
  if (input.asset_id) {
    const { rowCount } = await pool.query("select 1 from assets where id = $1", [input.asset_id])
    if (!rowCount) throw new AppError(422, "asset_not_found", "That device does not exist.")
  }

  const id = await transaction(async (tx) => {
    const { rows } = await tx.query<{ id: string }>(
      `insert into tickets (title, description, category, asset_id, reporter_id)
       values ($1, $2, $3, $4, $5) returning id`,
      [input.title, input.description, input.category, input.asset_id ?? null, user.id],
    )
    await logEvent(tx, rows[0]!.id, user.id, "created", null, "open")
    return rows[0]!.id
  })
  return findTicket(pool, user, id)
}

export async function listTickets(user: User, query: ListTicketsQuery) {
  // employees are always scoped to their own tickets, whatever filters they send
  const where = ["($1 or t.reporter_id = $2)"]
  const params: unknown[] = [isStaff(user), user.id]
  for (const column of ["status", "priority", "category", "assignee_id"] as const) {
    if (query[column] === undefined) continue
    params.push(query[column])
    where.push(`t.${column} = $${params.length}`)
  }
  const filter = `where ${where.join(" and ")}`

  const total = await pool.query<{ count: number }>(
    `select count(*)::int as count from tickets t ${filter}`,
    params,
  )
  const { rows } = await pool.query<Ticket>(
    `${ticketSelect} ${filter} order by t.created_at desc
     limit $${params.length + 1} offset $${params.length + 2}`,
    [...params, query.page_size, (query.page - 1) * query.page_size],
  )
  return { items: rows, total: total.rows[0]!.count, page: query.page, page_size: query.page_size }
}

export async function getTicket(user: User, id: string) {
  const ticket = await findTicket(pool, user, id)

  const comments = await pool.query(
    `select c.id, c.body, c.is_internal, c.created_at, c.author_id, p.full_name as author_name
     from ticket_comments c join profiles p on p.id = c.author_id
     where c.ticket_id = $1 and ($2 or not c.is_internal)
     order by c.created_at`,
    [id, isStaff(user)],
  )
  const events = await pool.query(
    `select e.id, e.type, e.from_value, e.to_value, e.created_at, p.full_name as actor_name
     from ticket_events e join profiles p on p.id = e.actor_id
     where e.ticket_id = $1 order by e.created_at`,
    [id],
  )
  return { ...ticket, comments: comments.rows, events: events.rows }
}

export async function updateTicket(user: User, id: string, input: UpdateTicketInput) {
  // the reporter may only confirm or reject a fix; everything else is IT staff work
  const reporterOnlyConfirms =
    input.priority === undefined && input.assignee_id === undefined && input.status !== undefined
  if (!isStaff(user) && !reporterOnlyConfirms) {
    throw new AppError(403, "not_allowed", "Only IT staff can change that.")
  }

  await transaction(async (tx) => {
    const ticket = await findTicket(tx, user, id, true)
    let { status, priority, assignee_id } = ticket

    // assign
    if (input.assignee_id && input.assignee_id !== assignee_id) {
      const staff = await tx.query(
        "select 1 from profiles where id = $1 and is_active and role in ('it_staff', 'admin')",
        [input.assignee_id],
      )
      if (!staff.rowCount)
        throw new AppError(422, "assignee_not_staff", "Tickets can only be assigned to IT staff.")
      await logEvent(tx, id, user.id, "assigned", assignee_id, input.assignee_id)
      assignee_id = input.assignee_id
      if (status === "open") {
        await logEvent(tx, id, user.id, "status_changed", "open", "assigned")
        status = "assigned"
      }
    }

    // reprioritise
    if (input.priority && input.priority !== priority) {
      await logEvent(tx, id, user.id, "priority_changed", priority, input.priority)
      priority = input.priority
    }

    // move status
    if (input.status && input.status !== status) {
      const fromResolved = status === "resolved"
      if (!statusTransitions[status].includes(input.status) || (!isStaff(user) && !fromResolved)) {
        throw new AppError(
          409,
          "invalid_status_change",
          `A ticket cannot go from ${status} to ${input.status}.`,
        )
      }
      await logEvent(tx, id, user.id, "status_changed", status, input.status)
      status = input.status
    }

    await tx.query(
      `update tickets set status = $2::ticket_status, priority = $3, assignee_id = $4,
         resolved_at = case $2::ticket_status when 'resolved' then coalesce(resolved_at, now())
                                              when 'closed' then resolved_at end,
         closed_at = case $2::ticket_status when 'closed' then now() end
       where id = $1`,
      [id, status, priority, assignee_id],
    )
  })
  return getTicket(user, id)
}

export async function addComment(user: User, id: string, input: CreateCommentInput) {
  if (input.is_internal && !isStaff(user)) {
    throw new AppError(403, "not_allowed", "Only IT staff can write internal notes.")
  }
  await findTicket(pool, user, id)

  const { rows } = await pool.query(
    `insert into ticket_comments (ticket_id, author_id, body, is_internal)
     values ($1, $2, $3, $4) returning id, body, is_internal, created_at, author_id`,
    [id, user.id, input.body, input.is_internal],
  )
  return { ...rows[0], author_name: user.full_name }
}
