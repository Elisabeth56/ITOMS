"use client"

import Link from "next/link"
import { useActionState } from "react"
import { Button } from "@/components/ui/button"
import { Field } from "@/components/ui/field"
import { sendResetLink } from "./actions"

export function ForgotForm() {
  const [state, action, pending] = useActionState(sendResetLink, {})
  if (state.ok) {
    return (
      <div className="flex flex-col gap-4 rounded-panel bg-surface p-6">
        <p>If that email has an account, a link to set a new password is on its way.</p>
        <Link href="/sign-in" className="text-accent underline-offset-4 hover:underline">
          Back to sign in
        </Link>
      </div>
    )
  }
  return (
    <form action={action} className="flex flex-col gap-4 rounded-panel bg-surface p-6">
      <Field label="Work email" name="email" type="email" autoComplete="username" required />
      <Button variant="strong" disabled={pending} className="min-h-12">
        {pending ? "Sending" : "Email me a link"}
      </Button>
      <Link
        href="/sign-in"
        className="self-center py-2 text-accent underline-offset-4 hover:underline"
      >
        Back to sign in
      </Link>
    </form>
  )
}
