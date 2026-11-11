import request from "supertest"
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest"

vi.mock("../src/token", () => ({
  verifyAccessToken: async (token: string) => (token.startsWith("test:") ? token.slice(5) : null),
}))

import { app } from "../src/app"
import { pool } from "../src/db"
import { createUser } from "./helpers"

type TestUser = Awaited<ReturnType<typeof createUser>>
let holder: TestUser, otherEmployee: TestUser, staff: TestUser

const api = request(app)
let tagCounter = 0

/** Registers a device and hands it to the holder. */
async function heldDevice(extra: object = {}) {
  const device = await api
    .post("/assets")
    .set(staff.auth)
    .send({ asset_tag: `CR-T${++tagCounter}`, type: "laptop", ...extra })
  await api
    .post(`/assets/${device.body.id}/assign`)
    .set(staff.auth)
    .send({ employee_id: holder.id })
  return device.body
}
const propose = (as: TestUser, assetId: string, body: object) =>
  api.post(`/assets/${assetId}/change-requests`).set(as.auth).send(body)

beforeAll(async () => {
  holder = await createUser("employee")
  otherEmployee = await createUser("employee")
  staff = await createUser("it_staff")
})
afterAll(() => pool.end())

describe("proposing a change", () => {
  it("lets the holder propose a change, and only one at a time", async () => {
    const device = await heldDevice()
    const first = await propose(holder, device.id, {
      proposed: { location: "3rd floor" },
      note: "Moved with my team.",
    })
    expect(first.status).toBe(201)
    expect(first.body).toMatchObject({ status: "pending", proposed: { location: "3rd floor" } })

    const second = await propose(holder, device.id, { proposed: { location: "4th floor" } })
    expect(second.status).toBe(409)
    expect(second.body.error.code).toBe("change_request_pending")

    const detail = await api.get(`/assets/${device.id}`).set(holder.auth)
    expect(detail.body.pending_change).toMatchObject({ proposed: { location: "3rd floor" } })
  })

  it("hides other people's devices", async () => {
    const device = await heldDevice()
    const res = await propose(otherEmployee, device.id, { proposed: { location: "Lobby" } })
    expect(res.status).toBe(404)
  })

  it("refuses fields an employee may not change", async () => {
    const device = await heldDevice()
    const res = await propose(holder, device.id, { proposed: { status: "retired" } })
    expect(res.status).toBe(422)
  })
})

describe("deciding a change", () => {
  it("applies an approved change to the device and records who approved it", async () => {
    const device = await heldDevice()
    const req = await propose(holder, device.id, { proposed: { location: "Room 3B" } })

    expect((await api.get("/change-requests").set(holder.auth)).status).toBe(403)
    const pending = await api.get("/change-requests").set(staff.auth)
    expect(pending.body.map((r: { id: string }) => r.id)).toContain(req.body.id)

    const approved = await api
      .post(`/change-requests/${req.body.id}/approve`)
      .set(staff.auth)
      .send({})
    expect(approved.body).toMatchObject({ status: "approved", decided_by_name: "Test it_staff" })
    expect((await api.get(`/assets/${device.id}`).set(staff.auth)).body.location).toBe("Room 3B")

    const again = await api.post(`/change-requests/${req.body.id}/reject`).set(staff.auth).send({})
    expect(again.status).toBe(409)
    expect(again.body.error.code).toBe("change_request_decided")
  })

  it("leaves the request pending when the change cannot be applied", async () => {
    await heldDevice({ serial_number: "TAKEN-1" })
    const device = await heldDevice()
    const req = await propose(holder, device.id, { proposed: { serial_number: "TAKEN-1" } })

    const res = await api.post(`/change-requests/${req.body.id}/approve`).set(staff.auth).send({})
    expect(res.status).toBe(409)
    expect(res.body.error.code).toBe("asset_duplicate")

    const pending = await api.get("/change-requests").set(staff.auth)
    const stillThere = pending.body.find((r: { id: string }) => r.id === req.body.id)
    expect(stillThere.status).toBe("pending")
  })

  it("records a rejection with its reason and leaves the device alone", async () => {
    const device = await heldDevice({ location: "2nd floor" })
    const req = await propose(holder, device.id, { proposed: { location: "Home" } })

    const rejected = await api
      .post(`/change-requests/${req.body.id}/reject`)
      .set(staff.auth)
      .send({ note: "Company laptops stay in the office." })
    expect(rejected.body).toMatchObject({
      status: "rejected",
      decision_note: "Company laptops stay in the office.",
    })
    expect((await api.get(`/assets/${device.id}`).set(staff.auth)).body.location).toBe("2nd floor")
  })
})
