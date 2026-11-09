"use client"

import Link from "next/link"
import { useActionState } from "react"
import type { ChangeRequest } from "@itoms/shared"
import { decideChange } from "@/app/(app)/change-requests/actions"
import { label, timeAgo } from "@/lib/format"
import { FormError } from "./form-error"
import { Button, Kbd } from "./ui/button"
import { Pill } from "./ui/pill"

/** One proposed device change, with approve and reject for IT while it is pending. */
export function ChangeRequestCard({
  request,
  current,
}: {
  request: ChangeRequest
  /** the device's current values, to show what each change replaces */
  current?: Record<string, string | null>
}) {
  const [state, action, pending] = useActionState(decideChange.bind(null, request.id), {})
  const decided = request.status !== "pending"

  return (
    <section
      className={`flex flex-col gap-4 rounded-card p-6 ${decided ? "bg-surface" : "bg-butter text-on-butter"}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[17px] font-medium text-ink">
          {request.requested_by_name} asks to change{" "}
          <Link href={`/devices/${request.asset_id}`} className="font-dot font-bold text-ink">
            {request.asset_tag}
          </Link>
        </p>
        {decided ? (
          <Pill value={request.status} />
        ) : (
          <span className="text-sm">{timeAgo(request.created_at)}</span>
        )}
      </div>
      <ul className="flex flex-col gap-1">
        {Object.entries(request.proposed).map(([field, value]) => (
          <li key={field}>
            {label(field)}:{" "}
            {current?.[field] && <span className="line-through opacity-70">{current[field]}</span>}{" "}
            {current?.[field] && "→ "}
            <span className="font-medium text-ink">{value}</span>
          </li>
        ))}
      </ul>
      {request.note && <p className="text-sm">&ldquo;{request.note}&rdquo;</p>}
      {decided ? (
        <p className="text-sm text-ink-3">
          {label(request.status)} by {request.decided_by_name}
          {request.decision_note && `: ${request.decision_note}`}
        </p>
      ) : (
        <form action={action} className="flex flex-col gap-3">
          <label className="sr-only" htmlFor={`note-${request.id}`}>
            Note for {request.requested_by_name}
          </label>
          <input
            id={`note-${request.id}`}
            name="note"
            placeholder="Note, optional"
            className="min-h-11 rounded-[12px] border-[1.5px] border-on-butter/20 bg-surface px-3.5 text-ink"
          />
          <div className="flex flex-wrap gap-2">
            <Button variant="strong" name="decision" value="approve" disabled={pending}>
              Approve <Kbd>⏎</Kbd>
            </Button>
            <Button variant="light" name="decision" value="reject" disabled={pending}>
              Reject
            </Button>
          </div>
          <FormError message={state.error} />
        </form>
      )}
    </section>
  )
}
