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
      .send({ status: "resolved" })
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

    const resolved = await patch(staff, { status: "resolved" })
    expect(resolved.body.resolved_at).not.toBeNull()

    // reporter says it is still broken, IT fixes it again, reporter confirms
    expect((await patch(employee, { status: "in_progress" })).body.resolved_at).toBeNull()
    await patch(staff, { status: "resolved" })
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
      await api.patch(`/tickets/${ticket.id}`).set(staff.auth).send({ status: "resolved" })
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
