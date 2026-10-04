import { z } from "zod"
import { userRoles } from "./roles"

export const inviteUserSchema = z.object({
  email: z.email().max(200),
  full_name: z.string().trim().min(2).max(120),
  department: z.string().trim().min(1).max(80).optional(),
  role: z.enum(userRoles).default("employee"),
})

export const updateUserSchema = z
  .object({
    full_name: z.string().trim().min(2).max(120),
    department: z.string().trim().min(1).max(80),
    role: z.enum(userRoles),
    is_active: z.boolean(),
  })
  .partial()
  .refine((input) => Object.keys(input).length > 0, "Nothing to update")

export type InviteUserInput = z.infer<typeof inviteUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
