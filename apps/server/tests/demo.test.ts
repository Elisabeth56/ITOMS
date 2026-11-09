import request from "supertest"
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest"

vi.mock("../src/token", () => ({
  verifyAccessToken: async (token: string) => (token.startsWith("test:") ? token.slice(5) : null),
}))

import { app } from "../src/app"
import { pool } from "../src/db"
import { createUser } from "./helpers"

type TestUser = Awaited<ReturnType<typeof createUser>>
let demoAdmin: TestUser, demoEmployee: TestUser

const api = request(app)

beforeAll(async () => {
  demoAdmin = await createUser("admin")
  demoEmployee = await createUser("employee")
  await pool.query("update profiles set is_demo = true where id = any($1)", [
    [demoAdmin.id, demoEmployee.id],
  ])
})
afterAll(() => pool.end())

describe("demo accounts", () => {
  it("lets the demo administrator look but not change anything", async () => {
    expect((await api.get("/users").set(demoAdmin.auth)).status).toBe(200)
    const invite = await api
      .post("/users")
      .set(demoAdmin.auth)
      .send({ email: "someone@example.com", full_name: "Some One" })
    expect(invite.status).toBe(403)
    expect(invite.body.error.code).toBe("demo_read_only")
  })

  it("lets a demo employee file tickets but not rename themselves", async () => {
    const ticket = await api
      .post("/tickets")
      .set(demoEmployee.auth)
      .send({ title: "Printer jams", description: "Every page.", category: "printer" })
    expect(ticket.status).toBe(201)
    expect(
      (await api.patch("/me").set(demoEmployee.auth).send({ full_name: "Renamed" })).status,
    ).toBe(403)
  })
})
