"use client"

import { useActionState } from "react"
import { userRoles, type Person } from "@itoms/shared"
import { FormError } from "@/components/form-error"
import { Button } from "@/components/ui/button"
import { Field, Select } from "@/components/ui/field"
import { label } from "@/lib/format"
import { changePerson, invitePerson } from "./actions"

export function InviteForm() {
  const [state, action, pending] = useActionState(invitePerson, {})
  const errors = state.fields ?? {}
  return (
    <form
      action={action}
      key={String(state.ok)}
      className="flex flex-col gap-4 rounded-panel bg-surface p-6"
    >
      <p className="text-[19px] leading-[26px] font-medium tracking-[-0.01em]">Invite someone</p>
      <Field label="Full name" name="full_name" required errors={errors.full_name} />
      <Field label="Work email" name="email" type="email" required errors={errors.email} />
      <Field label="Department" name="department" errors={errors.department} />
      <Select label="Role" name="role" defaultValue="employee">
        {userRoles.map((role) => (
          <option key={role} value={role}>
            {label(role)}
          </option>
        ))}
      </Select>
      <FormError message={state.error} />
      {state.ok && (
        <p className="text-ink-2">Invite sent. They will get an email to set a password.</p>
      )}
      <Button variant="strong" disabled={pending}>
        {pending ? "Sending" : "Send invite"}
      </Button>
    </form>
  )
}

/** Role and access for one person. Admins only. */
export function PersonControls({ person }: { person: Person }) {
  const [state, action, pending] = useActionState(changePerson.bind(null, person.id), {})
  return (
    <form action={action} className="flex flex-wrap items-center gap-2">
      <label htmlFor={`role-${person.id}`} className="sr-only">
        Role for {person.full_name}
      </label>
      <select
        id={`role-${person.id}`}
        name="role"
        defaultValue={person.role}
        key={person.role}
        className="min-h-11 rounded-full border-[1.5px] border-hairline bg-ground px-3"
      >
        {userRoles.map((role) => (
          <option key={role} value={role}>
            {label(role)}
          </option>
        ))}
      </select>
      <Button variant="quiet" disabled={pending}>
        Save
      </Button>
      <Button variant="quiet" name="is_active" value={String(!person.is_active)} disabled={pending}>
        {person.is_active ? "Turn off access" : "Turn on access"}
      </Button>
      {state.error && <p className="basis-full text-sm text-urgent">{state.error}</p>}
    </form>
  )
}
