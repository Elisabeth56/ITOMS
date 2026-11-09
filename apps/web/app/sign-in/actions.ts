"use server"

import { redirect } from "next/navigation"
import type { FormState } from "@/lib/actions"
import { createClient } from "@/lib/supabase/server"

export async function signIn(_state: FormState, form: FormData): Promise<FormState> {
  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: String(form.get("email")),
    password: String(form.get("password")),
  })
  if (error) return { error: "That email and password do not match. Check them and try again." }
  redirect("/home")
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/sign-in")
}

// the public demo accounts from supabase/seed.sql; their password is shown on this page
const demoAccounts = {
  employee: "adaeze.okafor@itoms.example",
  it_staff: "chidi.eze@itoms.example",
  admin: "amaka.obi@itoms.example",
} as const

/** One click into the demo as a given role. */
export async function signInDemo(role: keyof typeof demoAccounts): Promise<FormState> {
  const form = new FormData()
  form.set("email", demoAccounts[role])
  form.set("password", "itoms-demo-2026")
  return signIn({}, form)
}
