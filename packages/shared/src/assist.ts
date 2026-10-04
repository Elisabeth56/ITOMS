// Request and response shapes for the optional AI quick fix.
import { z } from "zod"
import { ticketCategories } from "./tickets"

export const suggestFixSchema = z.object({
  title: z.string().trim().min(3).max(150),
  description: z.string().trim().max(5000).default(""),
  category: z.enum(ticketCategories),
})

/** What the model must return. Checked before anything reaches the employee. */
export const suggestionSchema = z.object({
  can_help: z.boolean(),
  summary: z.string().trim().min(1).max(600),
  // models often leave steps out when handing over to IT, so a missing list means none
  steps: z
    .array(z.string().trim().min(1).max(300))
    .max(5)
    .nullish()
    .transform((steps) => steps ?? []),
})

export type SuggestFixInput = z.infer<typeof suggestFixSchema>
export type Suggestion = z.infer<typeof suggestionSchema>
