import { Router } from "express"
import {
  createCommentSchema,
  createTicketSchema,
  listTicketsQuerySchema,
  updateTicketSchema,
  type ListTicketsQuery,
} from "@itoms/shared"
import { requireRole } from "../../auth"
import { idParams, validate } from "../../validate"
import {
  addComment,
  createTicket,
  escalateTicket,
  getTicket,
  listTickets,
  updateTicket,
} from "./logic"

export const ticketsRouter = Router()

ticketsRouter.get("/", validate({ query: listTicketsQuerySchema }), async (req, res) => {
  res.json(await listTickets(req.user, req.query as unknown as ListTicketsQuery))
})

ticketsRouter.post("/", validate({ body: createTicketSchema }), async (req, res) => {
  res.status(201).json(await createTicket(req.user, req.body))
})

ticketsRouter.get("/:id", validate({ params: idParams }), async (req, res) => {
  res.json(await getTicket(req.user, req.params.id as string))
})

ticketsRouter.patch(
  "/:id",
  validate({ params: idParams, body: updateTicketSchema }),
  async (req, res) => {
    res.json(await updateTicket(req.user, req.params.id as string, req.body))
  },
)

ticketsRouter.post(
  "/:id/comments",
  validate({ params: idParams, body: createCommentSchema }),
  async (req, res) => {
    res.status(201).json(await addComment(req.user, req.params.id as string, req.body))
  },
)

ticketsRouter.post(
  "/:id/escalate",
  requireRole("it_staff"),
  validate({ params: idParams }),
  async (req, res) => {
    res.json(await escalateTicket(req.user, req.params.id as string))
  },
)
