// Typed calls to the ITOMS API. Server-only: the session token never reaches browser code.
import "server-only"
import { notFound, redirect } from "next/navigation"
import { cache } from "react"
import { hasRole, type ApiError as ApiErrorBody, type UserRole } from "@itoms/shared"
import { env } from "./env"
import { createClient } from "./supabase/server"

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public fields: Record<string, string[]> = {},
  ) {
    super(message)
  }
}

export async function api<T>(path: string, init?: { method?: string; body?: unknown }): Promise<T> {
  const supabase = await createClient()
  const { data } = await supabase.auth.getSession()
  if (!data.session) redirect("/sign-in")

  const response = await fetch(`${env.API_URL}${path}`, {
    method: init?.method ?? "GET",
    headers: {
      Authorization: `Bearer ${data.session.access_token}`,
      "Content-Type": "application/json",
    },
    body: init?.body === undefined ? undefined : JSON.stringify(init.body),
    cache: "no-store",
  })
  if (response.status === 401) redirect("/sign-in")
  if (response.status === 204) return undefined as T

  const body = await response.json()
  if (!response.ok) {
    const { error } = body as ApiErrorBody
    const fields = (error.details?.fields ?? {}) as Record<string, string[]>
    throw new ApiError(response.status, error.code, error.message, fields)
  }
  return body as T
}

export type Me = { id: string; full_name: string; email: string; role: UserRole }

/** The signed-in person. Cached so a page and its layout share one request. */
export const getMe = cache(() => api<Me>("/me"))

/** For pages only the IT team may open. Anyone else sees "not found". */
export async function requireStaff() {
  const me = await getMe()
  if (!hasRole(me.role, "it_staff")) notFound()
  return me
}
