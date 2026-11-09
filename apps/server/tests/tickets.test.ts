import request from "supertest"
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest"

// the only network boundary: a test token is "test:<user id>"
vi.mock("../src/token", () => ({
  verifyAccessToken: async (token: string) => (token.startsWith("test:") ? token.slice(5) : null),
}))

import { app } from "../src/app"
import { pool } from "../src/db"
import { createUser } from "./helpers"

type TestUser = Awaited<ReturnType<typeof createUser>>
let employee: TestUser, otherEmployee: TestUser, staff: TestUser

const api = request(app)
const newTicket = {
  title: "Printer on 2nd floor jams",
  description: "Jams on every page.",
  category: "printer",
}

async function fileTicket(as: TestUser) {
  const res = await api.post("/tickets").set(as.auth).send(newTicket)
  return res.body
}

beforeAll(async () => {
  employee = await createUser("employee")
  otherEmployee = await createUser("employee")
  staff = await createUser("it_staff")
})
afterAll(() => pool.end())

describe("filing tickets", () => {
  it("rejects requests without a session", async () => {
    const res = await api.get("/tickets")
    expect(res.status).toBe(401)
    expect(res.body.error.code).toBe("not_signed_in")
  })

  it("lets an employee file a ticket, which starts open with a reference", async () => {
    const res = await api.post("/tickets").set(employee.auth).send(newTicket)
    expect(res.status).toBe(201)
    expect(res.body).toMatchObject({ status: "open", priority: "medium", reporter_id: employee.id })
    expect(res.body.ref).toMatch(/^IT-\d{4}$/)
  })

  it("returns field errors for an invalid ticket", async () => {
    const res = await api
      .post("/tickets")
      .set(employee.auth)
      .send({ title: "x", category: "printer" })
    expect(res.status).toBe(422)
    expect(Object.keys(res.body.error.details.fields)).toEqual(["title", "description"])
  })
})

describe("visibility", () => {
  it("hides a ticket from other employees but not from IT staff", async () => {
    const ticket = await fileTicket(employee)
    expect((await api.get(`/tickets/${ticket.id}`).set(otherEmployee.auth)).status).toBe(404)
    expect((await api.get(`/tickets/${ticket.id}`).set(staff.auth)).status).toBe(200)
  })

  it("lists only an employee's own tickets, and every ticket for IT staff", async () => {
    await fileTicket(otherEmployee)
    const mine = await api.get("/tickets").set(employee.auth)
    expect(
      mine.body.items.every((t: { reporter_id: string }) => t.reporter_id === employee.id),
    ).toBe(true)

    const all = await api.get("/tickets").set(staff.auth)
    expect(all.body.total).toBeGreaterThan(mine.body.total)
  })

  it("keeps internal notes away from the reporter", async () => {
    const ticket = await fileTicket(employee)
    await api
      .post(`/tickets/${ticket.id}/comments`)
      .set(staff.auth)
      .send({ body: "Fuser is worn.", is_internal: true })
    await api
      .post(`/tickets/${ticket.id}/comments`)
      .set(staff.auth)
      .send({ body: "Looking into it." })

    const asReporter = await api.get(`/tickets/${ticket.id}`).set(employee.auth)
    expect(asReporter.body.comments.map((c: { body: string }) => c.body)).toEqual([
      "Looking into it.",
    ])
    const asStaff = await api.get(`/tickets/${ticket.id}`).set(staff.auth)
    expect(asStaff.body.comments).toHaveLength(2)

    const res = await api
      .post(`/tickets/${ticket.id}/comments`)
      .set(employee.auth)
      .send({ body: "x", is_internal: true })
    expect(res.status).toBe(403)
  })
})

describe("lifecycle", () => {
  it("stops employees from assigning or prioritising", async () => {
    const ticket = await fileTicket(employee)
    const res = await api
      .patch(`/tickets/${ticket.id}`)
      .set(employee.auth)
      .send({ priority: "urgent" })
    expect(res.status).toBe(403)
  })

  it("only assigns tickets to IT staff", async () => {
    const ticket = await fileTicket(employee)
    const res = await api
      .patch(`/tickets/${ticket.id}`)
      .set(staff.auth)
      .send({ assignee_id: otherEmployee.id })
    expect(res.status).toBe(422)
    expect(res.body.error.code).toBe("assignee_not_staff")
  })

  it("rejects status moves the lifecycle does not allow", async () => {
    const ticket = await fileTicket(employee)
    const res = await api
      .patch(`/tickets/${ticket.id}`)
      .set(staff.auth)
      .send({ status: "resolved", resolution: "Replaced the cable." })
    expect(res.status).toBe(409)
    expect(res.body.error.code).toBe("invalid_status_change")
  })

  it("runs a ticket from open to closed and records every step", async () => {
    const ticket = await fileTicket(employee)
    const patch = (as: TestUser, body: object) =>
      api.patch(`/tickets/${ticket.id}`).set(as.auth).send(body)

    const assigned = await patch(staff, { assignee_id: staff.id, priority: "high" })
    expect(assigned.body).toMatchObject({
      status: "assigned",
      assignee_id: staff.id,
      priority: "high",
    })

    await patch(staff, { status: "in_progress" })
    expect((await patch(employee, { status: "closed" })).status).toBe(409) // not resolved yet

    const resolved = await patch(staff, { status: "resolved", resolution: "Replaced the cable." })
    expect(resolved.body.resolved_at).not.toBeNull()

    // reporter says it is still broken, IT fixes it again, reporter confirms
    expect((await patch(employee, { status: "in_progress" })).body.resolved_at).toBeNull()
    await patch(staff, { status: "resolved", resolution: "Replaced the cable." })
    const closed = await patch(employee, { status: "closed" })
    expect(closed.body.status).toBe("closed")
    expect(closed.body.closed_at).not.toBeNull()

    expect(
      closed.body.events.map((e: { type: string; to_value: string }) => `${e.type}:${e.to_value}`),
    ).toEqual([
      "created:open",
      `assigned:${staff.id}`,
      "status_changed:assigned",
      "priority_changed:high",
      "status_changed:in_progress",
      "status_changed:resolved",
      "status_changed:in_progress",
      "status_changed:resolved",
      "status_changed:closed",
    ])
  })

  it("refuses edits to the activity trail", async () => {
    await expect(pool.query("update ticket_events set to_value = 'x'")).rejects.toThrow(
      /append-only/,
    )
  })
})

describe("automatic closing", () => {
  it("closes tickets resolved more than 3 days ago, and only for the scheduler", async () => {
    const stale = await fileTicket(employee)
    const fresh = await fileTicket(employee)
    for (const ticket of [stale, fresh]) {
      await api.patch(`/tickets/${ticket.id}`).set(staff.auth).send({ assignee_id: staff.id })
      await api.patch(`/tickets/${ticket.id}`).set(staff.auth).send({ status: "in_progress" })
      await api
        .patch(`/tickets/${ticket.id}`)
        .set(staff.auth)
        .send({ status: "resolved", resolution: "Replaced the cable." })
    }
    await pool.query("update tickets set resolved_at = now() - interval '4 days' where id = $1", [
      stale.id,
    ])

    expect((await api.get("/internal/close-stale-tickets")).status).toBe(401)
    const run = await api
      .get("/internal/close-stale-tickets")
      .set("Authorization", "Bearer test-cron-secret")
    expect(run.body).toEqual({ closed: 1 })

    const closed = await api.get(`/tickets/${stale.id}`).set(employee.auth)
    expect(closed.body.status).toBe("closed")
    expect(closed.body.events.at(-1)).toMatchObject({ to_value: "closed", actor_name: null })
    expect((await api.get(`/tickets/${fresh.id}`).set(employee.auth)).body.status).toBe("resolved")
  })
})

describe("due times and resolutions", () => {
  const hours = (ticket: { created_at: string; due_at: string }) =>
    (Date.parse(ticket.due_at) - Date.parse(ticket.created_at)) / 3_600_000

  it("sets the due time from the priority and moves it when the priority changes", async () => {
    const ticket = await fileTicket(employee)
    expect(hours(ticket)).toBe(24) // medium by default

    const raised = await api
      .patch(`/tickets/${ticket.id}`)
      .set(staff.auth)
      .send({ priority: "urgent" })
    expect(hours(raised.body)).toBe(4)
  })

  it("will not resolve a ticket without saying what fixed it", async () => {
    const ticket = await fileTicket(employee)
    const patch = (body: object) => api.patch(`/tickets/${ticket.id}`).set(staff.auth).send(body)
    await patch({ assignee_id: staff.id })
    await patch({ status: "in_progress" })

    const missing = await patch({ status: "resolved" })
    expect(missing.status).toBe(422)
    expect(missing.body.error.code).toBe("resolution_required")

    const resolved = await patch({ status: "resolved", resolution: "Reseated the toner." })
    expect(resolved.body.resolution).toBe("Reseated the toner.")
  })

  it("rejects a resolution sent without resolving", async () => {
    const ticket = await fileTicket(employee)
    const res = await api
      .patch(`/tickets/${ticket.id}`)
      .set(staff.auth)
      .send({ resolution: "Nothing yet" })
    expect(res.status).toBe(422)
  })
})

describe("escalation", () => {
  const escalate = (as: TestUser, id: string) => api.post(`/tickets/${id}/escalate`).set(as.auth)

  it("lets IT staff escalate once, and records it", async () => {
    const ticket = await fileTicket(employee)
    const first = await escalate(staff, ticket.id)
    expect(first.status).toBe(200)
    expect(first.body.escalated_at).not.toBeNull()
    expect(first.body.events.at(-1)).toMatchObject({ type: "escalated" })

    const again = await escalate(staff, ticket.id)
    expect(again.status).toBe(409)
    expect(again.body.error.code).toBe("already_escalated")
  })

  it("does not let employees escalate", async () => {
    const ticket = await fileTicket(employee)
    expect((await escalate(employee, ticket.id)).status).toBe(403)
  })

  it("lists open escalated tickets for the admin view", async () => {
    const ticket = await fileTicket(employee)
    await escalate(staff, ticket.id)
    const list = await api.get("/tickets?escalated=true").set(staff.auth)
    expect(list.body.items.map((t: { id: string }) => t.id)).toContain(ticket.id)
    expect(list.body.items.every((t: { escalated_at: string | null }) => t.escalated_at)).toBe(true)
  })
})

describe("late tickets", () => {
  it("flags late tickets, filters them and sorts the queue by due time", async () => {
    const late = await fileTicket(employee)
    const onTime = await fileTicket(employee)
    await pool.query("update tickets set created_at = now() - interval '2 days' where id = $1", [
      late.id,
    ])
    // the trigger only recomputes on a priority change, so set the old due time directly
    await pool.query("update tickets set due_at = now() - interval '1 day' where id = $1", [
      late.id,
    ])

    const lateList = await api.get("/tickets?late=true&page_size=50").set(staff.auth)
    const ids = lateList.body.items.map((t: { id: string }) => t.id)
    expect(ids).toContain(late.id)
    expect(ids).not.toContain(onTime.id)
    expect(lateList.body.items.every((t: { is_late: boolean }) => t.is_late)).toBe(true)

    const queue = await api.get("/tickets?sort=due&active=true&page_size=50").set(staff.auth)
    expect(
      queue.body.items.every((t: { status: string }) => !["resolved", "closed"].includes(t.status)),
    ).toBe(true)
    const dueTimes = queue.body.items.map((t: { due_at: string }) => Date.parse(t.due_at))
    expect(dueTimes).toEqual([...dueTimes].sort((a, b) => a - b))
  })
})
