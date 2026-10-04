"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import type { Asset } from "@itoms/shared"
import { attempt, formValues, type FormState } from "@/lib/actions"
import { api } from "@/lib/api"

export async function createDevice(_state: FormState, form: FormData): Promise<FormState> {
  let id = ""
  const state = await attempt(async () => {
    const device = await api<Asset>("/assets", { method: "POST", body: formValues(form) })
    id = device.id
  })
  if (state.ok) redirect(`/devices/${id}`)
  return state
}

/** One action for every change on a device page; `$do` says which. */
export async function changeDevice(
  id: string,
  _state: FormState,
  form: FormData,
): Promise<FormState> {
  const values = formValues(form)
  const todo = String(form.get("$do"))
  const state = await attempt(async () => {
    if (todo === "assign") await api(`/assets/${id}/assign`, { method: "POST", body: values })
    if (todo === "return") await api(`/assets/${id}/return`, { method: "POST", body: values })
    if (todo === "status") await api(`/assets/${id}`, { method: "PATCH", body: values })
    if (todo === "repair") {
      const body = { ...values, cost: values.cost ? Number(values.cost) : undefined }
      await api(`/assets/${id}/maintenance`, { method: "POST", body })
    }
  })
  revalidatePath(`/devices/${id}`)
  return state
}
