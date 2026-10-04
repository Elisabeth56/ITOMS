import { z } from "zod"

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.url(),
  SUPABASE_URL: z.url(),
  WEB_ORIGIN: z.url(),
})

const parsed = schema.safeParse(process.env)
if (!parsed.success) {
  console.error("Invalid environment:", z.flattenError(parsed.error).fieldErrors)
  process.exit(1)
}

export const env = parsed.data
