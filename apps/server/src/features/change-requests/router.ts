import { Router } from "express"
import {
  decideChangeRequestSchema,
  listChangeRequestsQuerySchema,
  type ListChangeRequestsQuery,
} from "@itoms/shared"
import { requireRole } from "../../auth"
import { idParams, validate } from "../../validate"
import { approveChangeRequest, listChangeRequests, rejectChangeRequest } from "./logic"

// IT staff review requests here; employees create them under /assets/:id/change-requests
export const changeRequestsRouter = Router()
changeRequestsRouter.use(requireRole("it_staff"))

changeRequestsRouter.get(
  "/",
  validate({ query: listChangeRequestsQuerySchema }),
  async (req, res) => {
    res.json(await listChangeRequests((req.query as unknown as ListChangeRequestsQuery).status))
  },
)

const decide = validate({ params: idParams, body: decideChangeRequestSchema })

changeRequestsRouter.post("/:id/approve", decide, async (req, res) => {
  res.json(await approveChangeRequest(req.user, req.params.id as string, req.body))
})
changeRequestsRouter.post("/:id/reject", decide, async (req, res) => {
  res.json(await rejectChangeRequest(req.user, req.params.id as string, req.body))
})
