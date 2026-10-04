"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import type { SuggestionResult, Ticket } from "@itoms/shared"
import { attempt, formValues, type FormState } from "@/lib/actions"
import { api, ApiError } from "@/lib/api"

export async function createTicket(_state: FormState, form: FormData): Promise<FormState> {
  let id = ""
  const state = await attempt(async () => {
    const ticket = await api<Ticket>("/tickets", { method: "POST", body: formValues(form) })
    id = ticket.id
  })
  if (state.ok) redirect(`/tickets/${id}`)
  return state
}

export type QuickFix = { suggestion?: SuggestionResult; error?: string }

/** Asks the assistant for a quick fix. Never blocks the form: any failure is just a message. */
export async function suggestFix(input: {
  title: string
  description: string
  category: string
}): Promise<QuickFix> {
  try {
    return {
      suggestion: await api<SuggestionResult>("/assist/suggestions", {
        method: "POST",
        body: input,
      }),
    }
  } catch (error) {
    const message =
      error instanceof ApiError ? error.message : "The assistant is not available right now."
    return { error: message }
  }
}

export async function markSolved(suggestionId: string) {
  await api(`/assist/suggestions/${suggestionId}/solved`, { method: "POST" })
  redirect("/tickets?solved=1")
}

export async function updateTicket(
  id: string,
  _state: FormState,
  form: FormData,
): Promise<FormState> {
  const state = await attempt(() =>
    api(`/tickets/${id}`, { method: "PATCH", body: formValues(form) }),
  )
  revalidatePath(`/tickets/${id}`)
  return state
}

export async function addComment(
  id: string,
  _state: FormState,
  form: FormData,
): Promise<FormState> {
  const state = await attempt(() =>
    api(`/tickets/${id}/comments`, {
      method: "POST",
      body: { body: String(form.get("body") ?? ""), is_internal: form.get("is_internal") === "on" },
    }),
  )
  revalidatePath(`/tickets/${id}`)
  return state
}
