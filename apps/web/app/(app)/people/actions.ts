"use server"

import { revalidatePath } from "next/cache"
import { attempt, formValues, type FormState } from "@/lib/actions"
import { api } from "@/lib/api"

export async function invitePerson(_state: FormState, form: FormData): Promise<FormState> {
  const state = await attempt(() => api("/users", { method: "POST", body: formValues(form) }))
  revalidatePath("/people")
  return state
}

export async function changePerson(
  id: string,
  _state: FormState,
  form: FormData,
): Promise<FormState> {
  const values = formValues(form)
  const body = {
    role: values.role,
    ...(values.is_active && { is_active: values.is_active === "true" }),
  }
  const state = await attempt(() => api(`/users/${id}`, { method: "PATCH", body }))
  revalidatePath("/people")
  return state
}
