import { Router } from "express"
import { suggestFixSchema } from "@itoms/shared"
import { idParams, validate } from "../../validate"
import { markSolved, suggestFix } from "./logic"

export const assistRouter = Router()

assistRouter.post("/suggestions", validate({ body: suggestFixSchema }), async (req, res) => {
  const { model, tokens, ...suggestion } = await suggestFix(req.user, req.body)
  req.log.info({ model, tokens, can_help: suggestion.can_help }, "ai suggestion")
  res.status(201).json(suggestion)
})

assistRouter.post("/suggestions/:id/solved", validate({ params: idParams }), async (req, res) => {
  await markSolved(req.user, req.params.id as string)
  res.status(204).end()
})
