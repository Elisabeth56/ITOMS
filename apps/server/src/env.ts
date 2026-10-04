import { z } from "zod"

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.url(),
  SUPABASE_URL: z.url(),
  WEB_ORIGIN: z.url(),
  // AI quick fix is optional: with no key set, the endpoint answers "not available"
  GROQ_API_KEY: z.string().optional(),
  GROQ_MODEL: z.string().default("llama-3.3-70b-versatile"),
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().default("gemini-2.5-flash"),
})

const parsed = schema.safeParse(process.env)
if (!parsed.success) {
  console.error("Invalid environment:", z.flattenError(parsed.error).fieldErrors)
  process.exit(1)
}

export const env = parsed.data
