"use client"

import { useActionState } from "react"
import { FormError } from "@/components/form-error"
import { Button } from "@/components/ui/button"
import { Field } from "@/components/ui/field"
import { signIn } from "./actions"

export function SignInForm() {
  const [state, action, pending] = useActionState(signIn, {})
  return (
    <form action={action} className="flex flex-col gap-4 rounded-panel bg-surface p-6">
      <Field label="Work email" name="email" type="email" autoComplete="username" required />
      <Field
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
        required
      />
      <FormError message={state.error} />
      <Button variant="strong" disabled={pending} className="min-h-12">
        {pending ? "Signing in" : "Sign in"}
      </Button>
    </form>
  )
}
