import request from "supertest"
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("../src/token", () => ({
  verifyAccessToken: async (token: string) => (token.startsWith("test:") ? token.slice(5) : null),
}))
// the model is the network boundary: tests decide what it "says"
const generateJson = vi.hoisted(() => vi.fn())
vi.mock("../src/ai/llm", () => ({ generateJson }))

import { app } from "../src/app"
import { pool } from "../src/db"
import { createUser } from "./helpers"

type TestUser = Awaited<ReturnType<typeof createUser>>
let employee: TestUser, staff: TestUser

const api = request(app)
const problem = {
  title: "Printer will not print",
  description: "Nothing comes out.",
  category: "printer",
}
const answer = (data: unknown) => ({ data, model: "test/model", tokens: 120 })
const goodAnswer = {
  can_help: true,
  summary: "Probably a stuck job.",
  steps: ["Turn the printer off and on."],
}

beforeAll(async () => {
  employee = await createUser("employee")
  staff = await createUser("it_staff")
})
beforeEach(() => generateJson.mockReset())
afterAll(() => pool.end())

describe("ai quick fix", () => {
  it("returns the model's steps", async () => {
    generateJson.mockResolvedValue(answer(goodAnswer))
    const res = await api.post("/assist/suggestions").set(employee.auth).send(problem)
    expect(res.status).toBe(201)
    expect(res.body).toMatchObject(goodAnswer)
    expect(res.body.id).toBeDefined()
  })

  it("drops steps when the model says the problem needs IT", async () => {
    generateJson.mockResolvedValue(
      answer({ can_help: false, summary: "Needs IT.", steps: ["Open the case."] }),
    )
    const res = await api.post("/assist/suggestions").set(employee.auth).send(problem)
    expect(res.body).toMatchObject({ can_help: false, steps: [] })
  })

  it("retries once on a malformed answer, then gives up cleanly", async () => {
    generateJson
      .mockResolvedValueOnce(answer({ nonsense: true }))
      .mockResolvedValueOnce(answer(goodAnswer))
    expect((await api.post("/assist/suggestions").set(employee.auth).send(problem)).status).toBe(
      201,
    )

    generateJson.mockResolvedValue(answer({ nonsense: true }))
    const res = await api.post("/assist/suggestions").set(employee.auth).send(problem)
    expect(res.status).toBe(502)
    expect(res.body.error.code).toBe("ai_bad_answer")
  })

  it("shows IT what was already tried when a ticket follows", async () => {
    generateJson.mockResolvedValue(answer(goodAnswer))
    const suggestion = await api.post("/assist/suggestions").set(employee.auth).send(problem)
    const ticket = await api
      .post("/tickets")
      .set(employee.auth)
      .send({ ...problem, suggestion_id: suggestion.body.id })

    const seen = await api.get(`/tickets/${ticket.body.id}`).set(staff.auth)
    expect(seen.body.suggestion).toEqual({ summary: goodAnswer.summary, steps: goodAnswer.steps })
  })

  it("records a solved suggestion once, and only for its owner", async () => {
    generateJson.mockResolvedValue(answer(goodAnswer))
    const { body } = await api.post("/assist/suggestions").set(employee.auth).send(problem)

    expect((await api.post(`/assist/suggestions/${body.id}/solved`).set(staff.auth)).status).toBe(
      404,
    )
    expect(
      (await api.post(`/assist/suggestions/${body.id}/solved`).set(employee.auth)).status,
    ).toBe(204)
    expect(
      (await api.post(`/assist/suggestions/${body.id}/solved`).set(employee.auth)).status,
    ).toBe(404)
  })

  it("limits how often one person can ask in an hour", async () => {
    const heavyUser = await createUser("employee")
    generateJson.mockResolvedValue(answer(goodAnswer))
    for (let i = 0; i < 10; i++)
      await api.post("/assist/suggestions").set(heavyUser.auth).send(problem)

    const res = await api.post("/assist/suggestions").set(heavyUser.auth).send(problem)
    expect(res.status).toBe(429)
    expect(res.body.error.code).toBe("ai_limit_reached")
  })
})
