// Ticket vocabulary and request schemas, shared by the web app and the API.
import { z } from "zod"

export const ticketStatuses = [
  "open",
  "assigned",
  "in_progress",
  "waiting",
  "resolved",
  "closed",
] as const
export const ticketPriorities = ["low", "medium", "high", "urgent"] as const
export const ticketCategories = [
  "new_setup",
  "hardware",
  "printer",
  "network",
  "software",
  "account",
  "other",
] as const

export type TicketStatus = (typeof ticketStatuses)[number]
export type TicketPriority = (typeof ticketPriorities)[number]
export type TicketCategory = (typeof ticketCategories)[number]

// "assigned" is never set directly: it happens when IT staff picks an owner for an open ticket.
export const statusTransitions: Record<TicketStatus, readonly TicketStatus[]> = {
  open: [],
  assigned: ["in_progress"],
  in_progress: ["waiting", "resolved"],
  waiting: ["in_progress"],
  resolved: ["closed", "in_progress"],
  closed: [],
}

export const createTicketSchema = z.object({
  title: z.string().trim().min(3).max(150),
  description: z.string().trim().min(1).max(5000),
  category: z.enum(ticketCategories),
  asset_id: z.uuid().optional(),
  // set when the employee tried the AI quick fix first and it did not solve the problem
  suggestion_id: z.uuid().optional(),
})

export const updateTicketSchema = z
  .object({
    status: z.enum(ticketStatuses),
    priority: z.enum(ticketPriorities),
    assignee_id: z.uuid(),
    // what fixed it; required when moving to resolved, shown to the reporter
    resolution: z.string().trim().min(1).max(2000),
  })
  .partial()
  .refine((input) => Object.keys(input).length > 0, "Nothing to update")
  .refine((input) => !input.resolution || input.status === "resolved", {
    message: "A resolution goes with marking the ticket resolved.",
    path: ["resolution"],
  })

export const createCommentSchema = z.object({
  body: z.string().trim().min(1).max(5000),
  is_internal: z.boolean().default(false),
})

export const listTicketsQuerySchema = z.object({
  status: z.enum(ticketStatuses).optional(),
  priority: z.enum(ticketPriorities).optional(),
  category: z.enum(ticketCategories).optional(),
  assignee_id: z.uuid().optional(),
  // open tickets IT passed up to an administrator
  escalated: z.stringbool().optional(),
  late: z.stringbool().optional(),
  // work still to do: anything not resolved or closed
  active: z.stringbool().optional(),
  // IT works the queue soonest-due first; people read their own tickets newest first
  sort: z.enum(["newest", "due"]).default("newest"),
  page: z.coerce.number().int().min(1).default(1),
  page_size: z.coerce.number().int().min(1).max(50).default(20),
})

export type CreateTicketInput = z.infer<typeof createTicketSchema>
export type UpdateTicketInput = z.infer<typeof updateTicketSchema>
export type CreateCommentInput = z.infer<typeof createCommentSchema>
export type ListTicketsQuery = z.infer<typeof listTicketsQuerySchema>
