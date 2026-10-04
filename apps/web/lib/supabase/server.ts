import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { env } from "../env"

/** Supabase client for server components and actions. It only handles the session. */
export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet)
              cookieStore.set(name, value, options)
          } catch {
            // server components cannot write cookies; the proxy refreshes the session instead
          }
        },
      },
    },
  )
}
