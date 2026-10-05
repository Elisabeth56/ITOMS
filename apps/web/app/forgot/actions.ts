"use server"

import { createClient } from "@supabase/supabase-js"
import { headers } from "next/headers"
import type { FormState } from "@/lib/actions"
import { env } from "@/lib/env"

export async function sendResetLink(_state: FormState, form: FormData): Promise<FormState> {
  // implicit flow, so the emailed link works in any browser, not only the one that asked
  const supabase = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      auth: { flowType: "implicit", persistSession: false },
    },
  )
  const requestHeaders = await headers()
  const origin = requestHeaders.get("origin") ?? `https://${requestHeaders.get("host")}`
  await supabase.auth.resetPasswordForEmail(String(form.get("email")), {
    redirectTo: `${origin}/welcome`,
  })
  // same answer whether or not the account exists, so the form cannot be used to find accounts
  return { ok: true }
}
