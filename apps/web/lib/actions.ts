import { isRedirectError } from "next/dist/client/components/redirect-error"
import { ApiError } from "./api"

export type FormState = {
  error?: string
  fields?: Record<string, string[]>
  ok?: boolean
}

/** Runs a server action and turns an API error into something a form can show. */
export async function attempt(run: () => Promise<void>): Promise<FormState> {
  try {
    await run()
    return { ok: true }
  } catch (error) {
    if (isRedirectError(error)) throw error
    if (error instanceof ApiError) return { error: error.message, fields: error.fields }
    return { error: "Something went wrong. Please try again." }
  }
}

/** Reads a form into an object, dropping fields the person left empty. */
export function formValues(form: FormData) {
  const values: Record<string, string> = {}
  for (const [key, value] of form.entries()) {
    if (typeof value === "string" && value.trim() !== "" && !key.startsWith("$"))
      values[key] = value
  }
  return values
}
