"use client"

import { useActionState, useEffect, useState } from "react"
import { FormError } from "@/components/form-error"
import { Button } from "@/components/ui/button"
import { Field } from "@/components/ui/field"
import { resetOwnPassword, updateProfile } from "./actions"

export function DetailsForm({
  fullName,
  department,
}: {
  fullName: string
  department: string | null
}) {
  const [state, action, pending] = useActionState(updateProfile, {})
  return (
    <form action={action} className="flex flex-col gap-4">
      <Field
        label="Full name"
        name="full_name"
        defaultValue={fullName}
        required
        errors={state.fields?.full_name}
      />
      <Field
        label="Department"
        name="department"
        defaultValue={department ?? ""}
        errors={state.fields?.department}
      />
      <FormError message={state.error} />
      <div className="flex items-center gap-3">
        <Button variant="strong" disabled={pending}>
          {pending ? "Saving" : "Save"}
        </Button>
        {state.ok && !pending && <span className="text-sm text-ok">Saved</span>}
      </div>
    </form>
  )
}

export function ResetPassword() {
  const [state, action, pending] = useActionState(resetOwnPassword, {})
  return (
    <form action={action} className="flex flex-wrap items-center gap-3">
      <Button variant="light" disabled={pending || state.ok}>
        {state.ok ? "Link sent" : "Send reset link"}
      </Button>
      {state.ok && <span className="text-sm">Check your email.</span>}
    </form>
  )
}

const themes = [
  ["system", "System"],
  ["light", "Light"],
  ["dark", "Dark"],
] as const
type Theme = (typeof themes)[number][0]

/** The choice is kept in this browser and applied before paint by the root layout. */
export function ThemePicker() {
  const [theme, setTheme] = useState<Theme>("system")
  useEffect(() => {
    try {
      const saved = localStorage.getItem("theme")
      if (saved === "light" || saved === "dark") setTheme(saved)
    } catch {
      // storage can be unavailable; nothing else depends on it
    }
  }, [])

  const choose = (next: Theme) => {
    setTheme(next)
    try {
      if (next === "system") localStorage.removeItem("theme")
      else localStorage.setItem("theme", next)
    } catch {
      // storage can be unavailable; nothing else depends on it
    }
    if (next === "system") delete document.documentElement.dataset.theme
    else document.documentElement.dataset.theme = next
  }

  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className="inline-flex gap-0.5 rounded-full bg-sunken p-1"
    >
      {themes.map(([value, text]) => (
        <button
          key={value}
          type="button"
          role="radio"
          aria-checked={theme === value}
          onClick={() => choose(value)}
          className={`min-h-9 rounded-full px-3.5 text-sm transition-colors duration-200 ${
            theme === value ? "bg-ink text-surface" : "text-ink-2"
          }`}
        >
          {text}
        </button>
      ))}
    </div>
  )
}
