"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState, type FormEvent } from "react"
import { FormError } from "@/components/form-error"
import { Button, ButtonLink } from "@/components/ui/button"
import { Field } from "@/components/ui/field"
import { createClient } from "@/lib/supabase/client"

type Stage = "checking" | "ready" | "bad-link"

/**
 * Where invite and password-reset emails land. The link carries a one-time session in the
 * URL fragment; we sign the person in with it, then ask for a password.
 */
export function SetPasswordForm() {
  const router = useRouter()
  const [stage, setStage] = useState<Stage>("checking")
  const [error, setError] = useState<string>()
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    const fragment = new URLSearchParams(window.location.hash.slice(1))
    const access_token = fragment.get("access_token")
    const refresh_token = fragment.get("refresh_token")

    async function start() {
      if (access_token && refresh_token) {
        const { error } = await supabase.auth.setSession({ access_token, refresh_token })
        // drop the tokens from the address bar and the browser history
        window.history.replaceState(null, "", window.location.pathname)
        return setStage(error ? "bad-link" : "ready")
      }
      // no tokens in the link: fine only if the person is already signed in
      const { data } = await supabase.auth.getUser()
      setStage(data.user ? "ready" : "bad-link")
    }
    start()
  }, [])

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const password = String(form.get("password"))
    if (password !== String(form.get("confirm"))) return setError("The two passwords do not match.")

    setSaving(true)
    const { error } = await createClient().auth.updateUser({ password })
    setSaving(false)
    if (error) return setError(error.message)
    router.replace("/")
    router.refresh()
  }

  if (stage === "checking") return <p className="text-ink-3">Checking your link.</p>
  if (stage === "bad-link") {
    return (
      <div className="flex flex-col items-start gap-4 rounded-panel bg-surface p-6">
        <p>This link has expired or was already used.</p>
        <ButtonLink href="/forgot" variant="quiet">
          Send me a new link
        </ButtonLink>
      </div>
    )
  }
  return (
    <form onSubmit={save} className="flex flex-col gap-4 rounded-panel bg-surface p-6">
      <Field
        label="New password"
        name="password"
        type="password"
        autoComplete="new-password"
        hint="At least 8 characters."
        minLength={8}
        required
      />
      <Field
        label="Type it again"
        name="confirm"
        type="password"
        autoComplete="new-password"
        minLength={8}
        required
      />
      <FormError message={error} />
      <Button variant="strong" disabled={saving} className="min-h-12">
        {saving ? "Saving" : "Save password and continue"}
      </Button>
    </form>
  )
}
