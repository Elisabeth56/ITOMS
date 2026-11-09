// Device change requests: an employee proposes a correction to a device they hold,
// IT approves or rejects it (ADR 011).
import { z } from "zod"
import { createAssetSchema } from "./assets"

export const changeRequestStatuses = ["pending", "approved", "rejected"] as const
export type ChangeRequestStatus = (typeof changeRequestStatuses)[number]

// the same field rules as an IT edit; anything else in the proposal is refused
export const proposedChangeSchema = createAssetSchema
  .pick({ location: true, brand: true, model: true, serial_number: true })
  .partial()
  .strict()
  .refine((change) => Object.keys(change).length > 0, "Propose at least one change.")

const note = z.string().trim().min(1).max(500)

export const createChangeRequestSchema = z.object({
  proposed: proposedChangeSchema,
  note: note.optional(),
})
export const decideChangeRequestSchema = z.object({ note: note.optional() })
export const listChangeRequestsQuerySchema = z.object({
  status: z.enum(changeRequestStatuses).default("pending"),
})

export type ProposedChange = z.infer<typeof proposedChangeSchema>
export type CreateChangeRequestInput = z.infer<typeof createChangeRequestSchema>
export type DecideChangeRequestInput = z.infer<typeof decideChangeRequestSchema>
export type ListChangeRequestsQuery = z.infer<typeof listChangeRequestsQuerySchema>
