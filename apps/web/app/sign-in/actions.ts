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
  redirect("/")
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/sign-in")
}
