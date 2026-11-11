"use server"

import { revalidatePath } from "next/cache"
import { attempt, formValues, type FormState } from "@/lib/actions"
import { api } from "@/lib/api"
import { sendResetLink } from "../../forgot/actions"

export async function updateProfile(_state: FormState, form: FormData): Promise<FormState> {
  const state = await attempt(() => api("/me", { method: "PATCH", body: formValues(form) }))
  revalidatePath("/", "layout")
  return state
}

/** Emails the signed-in person a link to choose a new password. */
export async function resetOwnPassword(): Promise<FormState> {
  const me = await api<{ email: string }>("/me")
  const form = new FormData()
  form.set("email", me.email)
  return sendResetLink({}, form)
}
