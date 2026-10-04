import { z } from "zod"

// NEXT_PUBLIC_ values are inlined at build time, so they are read by name, not from a loop
const parsed = z
  .object({
    NEXT_PUBLIC_SUPABASE_URL: z.url(),
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
    API_URL: z.url(),
  })
  .safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    API_URL: process.env.API_URL,
  })

if (!parsed.success) {
  throw new Error(
    `Invalid environment: ${JSON.stringify(z.flattenError(parsed.error).fieldErrors)}`,
  )
}

export const env = parsed.data
