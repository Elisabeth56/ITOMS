import { z } from "zod"

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.url(),
  SUPABASE_URL: z.url(),
  WEB_ORIGIN: z.url(),
  // only needed for inviting people; never expose it to the browser
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  // AI quick fix is optional: with no key set, the endpoint answers "not available"
  GROQ_API_KEY: z.string().optional(),
  GROQ_MODEL: z.string().default("openai/gpt-oss-20b"),
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().default("gemini-3.5-flash-lite"),
})

const parsed = schema.safeParse(process.env)
if (!parsed.success) {
  console.error("Invalid environment:", z.flattenError(parsed.error).fieldErrors)
  process.exit(1)
}

export const env = parsed.data
