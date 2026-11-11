"use server"

import { revalidatePath } from "next/cache"
import { attempt, type FormState } from "@/lib/actions"
import { api } from "@/lib/api"

/** Approve or reject a device change; `decision` comes from the button pressed. */
export async function decideChange(
  id: string,
  _state: FormState,
  form: FormData,
): Promise<FormState> {
  const decision = form.get("decision") === "approve" ? "approve" : "reject"
  const note = String(form.get("note") ?? "").trim()
  const state = await attempt(() =>
    api(`/change-requests/${id}/${decision}`, {
      method: "POST",
      body: note ? { note } : {},
    }),
  )
  revalidatePath("/", "layout")
  return state
}
