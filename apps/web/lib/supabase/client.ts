import { createBrowserClient } from "@supabase/ssr"

/** Supabase client for the few browser-side steps: accepting an invite and setting a password. */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  )
}
