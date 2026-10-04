import request from "supertest"
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest"

vi.mock("../src/token", () => ({
  verifyAccessToken: async (token: string) => (token.startsWith("test:") ? token.slice(5) : null),
}))
const inviteAuthUser = vi.hoisted(() => vi.fn())
vi.mock("../src/supabase-admin", () => ({ inviteAuthUser }))

import { randomUUID } from "node:crypto"
import { app } from "../src/app"
import { pool } from "../src/db"
import { createUser } from "./helpers"

type TestUser = Awaited<ReturnType<typeof createUser>>
let employee: TestUser, otherEmployee: TestUser, staff: TestUser, admin: TestUser

const api = request(app)
let tagCounter = 0
async function addDevice(extra: object = {}) {
  const res = await api
    .post("/assets")
    .set(staff.auth)
    .send({ asset_tag: `LAP-T${++tagCounter}`, type: "laptop", brand: "Dell", ...extra })
  return res.body
}

beforeAll(async () => {
  employee = await createUser("employee")
  otherEmployee = await createUser("employee")
  staff = await createUser("it_staff")
  admin = await createUser("admin")
})
afterAll(() => pool.end())

describe("device register", () => {
  it("lets IT staff register a device, and refuses employees", async () => {
    const device = await addDevice()
    expect(device).toMatchObject({ status: "in_stock", holder_id: null })

    const res = await api
      .post("/assets")
      .set(employee.auth)
      .send({ asset_tag: "X-1", type: "laptop" })
    expect(res.status).toBe(403)
    expect((await api.get("/assets").set(employee.auth)).status).toBe(403)
  })

  it("refuses a duplicate tag and says which field", async () => {
    const device = await addDevice()
    const res = await api
      .post("/assets")
      .set(staff.auth)
      .send({ asset_tag: device.asset_tag, type: "laptop" })
    expect(res.status).toBe(409)
    expect(res.body.error.details.fields.asset_tag).toBeDefined()
  })

  it("finds devices by tag or holder name", async () => {
    const device = await addDevice({ asset_tag: "PRN-FIND-ME", type: "printer", status: "in_use" })
    const res = await api.get("/assets?q=find-me").set(staff.auth)
    expect(res.body.items.map((a: { id: string }) => a.id)).toEqual([device.id])
    expect(res.body.items[0].status).toBe("in_use")
  })
})

describe("assignment", () => {
  it("gives a device to one person at a time and keeps the history", async () => {
    const device = await addDevice()
    const assigned = await api
      .post(`/assets/${device.id}/assign`)
      .set(staff.auth)
      .send({ employee_id: employee.id })
    expect(assigned.body).toMatchObject({ status: "assigned", holder_id: employee.id })

    const again = await api
      .post(`/assets/${device.id}/assign`)
      .set(staff.auth)
      .send({ employee_id: otherEmployee.id })
    expect(again.status).toBe(409)

    const returned = await api
      .post(`/assets/${device.id}/return`)
      .set(staff.auth)
      .send({ condition_note: "Good" })
    expect(returned.body).toMatchObject({ status: "in_stock", holder_id: null })
    await api
      .post(`/assets/${device.id}/assign`)
      .set(staff.auth)
      .send({ employee_id: otherEmployee.id })

    const detail = await api.get(`/assets/${device.id}`).set(staff.auth)
    expect(detail.body.assignments).toHaveLength(2)
    expect(detail.body.assignments[1]).toMatchObject({ condition_note: "Good" })
  })

  it("shows an employee only the devices they hold", async () => {
    const mine = await addDevice()
    const theirs = await addDevice()
    await api.post(`/assets/${mine.id}/assign`).set(staff.auth).send({ employee_id: employee.id })
    await api
      .post(`/assets/${theirs.id}/assign`)
      .set(staff.auth)
      .send({ employee_id: otherEmployee.id })

    const list = await api.get("/assets/mine").set(employee.auth)
    expect(list.body.map((a: { id: string }) => a.id)).toContain(mine.id)
    expect(list.body.map((a: { id: string }) => a.id)).not.toContain(theirs.id)
    expect((await api.get(`/assets/${mine.id}`).set(employee.auth)).status).toBe(200)
    expect((await api.get(`/assets/${theirs.id}`).set(employee.auth)).status).toBe(404)
  })

  it("refuses to return a device nobody holds", async () => {
    const device = await addDevice()
    expect((await api.post(`/assets/${device.id}/return`).set(staff.auth).send({})).status).toBe(
      409,
    )
  })
})

describe("repairs and retiring", () => {
  it("logs a repair against a ticket and puts the device back with its holder", async () => {
    const device = await addDevice()
    await api.post(`/assets/${device.id}/assign`).set(staff.auth).send({ employee_id: employee.id })
    const ticket = await api.post("/tickets").set(employee.auth).send({
      title: "Laptop will not charge",
      description: "Dead.",
      category: "hardware",
      asset_id: device.id,
    })

    await api.patch(`/assets/${device.id}`).set(staff.auth).send({ status: "under_repair" })
    const res = await api.post(`/assets/${device.id}/maintenance`).set(staff.auth).send({
      action: "Replaced the charger.",
      cost: 18500,
      ticket_id: ticket.body.id,
      status_after: "in_stock",
    })

    expect(res.status).toBe(201)
    expect(res.body.status).toBe("assigned") // still held by the employee
    expect(res.body.maintenance[0]).toMatchObject({
      action: "Replaced the charger.",
      ticket_ref: ticket.body.ref,
    })
    expect(Number(res.body.maintenance[0].cost)).toBe(18500)
    expect(res.body.tickets).toHaveLength(1)
  })

  it("lets only an administrator retire a device, and only once it is returned", async () => {
    const device = await addDevice()
    expect(
      (await api.patch(`/assets/${device.id}`).set(staff.auth).send({ status: "retired" })).status,
    ).toBe(403)

    await api.post(`/assets/${device.id}/assign`).set(staff.auth).send({ employee_id: employee.id })
    expect(
      (await api.patch(`/assets/${device.id}`).set(admin.auth).send({ status: "retired" })).status,
    ).toBe(409)

    await api.post(`/assets/${device.id}/return`).set(staff.auth).send({})
    const retired = await api
      .patch(`/assets/${device.id}`)
      .set(admin.auth)
      .send({ status: "retired" })
    expect(retired.body.status).toBe("retired")
    expect(
      (
        await api
          .post(`/assets/${device.id}/assign`)
          .set(staff.auth)
          .send({ employee_id: employee.id })
      ).status,
    ).toBe(409)
  })
})

describe("dashboard", () => {
  it("is for IT staff and reports the counts", async () => {
    expect((await api.get("/dashboard").set(employee.auth)).status).toBe(403)
    const res = await api.get("/dashboard").set(staff.auth)
    expect(res.status).toBe(200)
    expect(res.body.tickets.open).toBeGreaterThan(0)
    expect(res.body.assets.total).toBeGreaterThan(0)
    expect(res.body.recent_activity.length).toBeGreaterThan(0)
    expect(res.body.quick_fix).toHaveProperty("solved")
  })
})

describe("people", () => {
  it("lets only an administrator invite someone", async () => {
    const invite = {
      email: `new-${randomUUID()}@example.com`,
      full_name: "New Person",
      role: "it_staff",
    }
    expect((await api.post("/users").set(staff.auth).send(invite)).status).toBe(403)

    const id = randomUUID()
    await pool.query("insert into auth.users (id) values ($1)", [id])
    inviteAuthUser.mockResolvedValue(id)
    const res = await api.post("/users").set(admin.auth).send(invite)
    expect(res.status).toBe(201)
    expect(res.body).toMatchObject({ id, role: "it_staff", is_active: true })

    expect((await api.post("/users").set(admin.auth).send(invite)).status).toBe(409)
  })

  it("applies a role change at once, and stops an admin locking themselves out", async () => {
    const person = await createUser("it_staff")
    expect((await api.get("/assets").set(person.auth)).status).toBe(200)

    await api.patch(`/users/${person.id}`).set(admin.auth).send({ role: "employee" })
    expect((await api.get("/assets").set(person.auth)).status).toBe(403)

    await api.patch(`/users/${person.id}`).set(admin.auth).send({ is_active: false })
    expect((await api.get("/tickets").set(person.auth)).status).toBe(401)

    const self = await api.patch(`/users/${admin.id}`).set(admin.auth).send({ role: "employee" })
    expect(self.status).toBe(409)
  })
})
