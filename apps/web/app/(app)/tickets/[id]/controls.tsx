"use client"

import { useActionState, useEffect } from "react"
import {
  statusTransitions,
  ticketPriorities,
  type Person,
  type TicketDetail,
  type TicketStatus,
} from "@itoms/shared"
import { FormError } from "@/components/form-error"
import { Button, Kbd } from "@/components/ui/button"
import { Select } from "@/components/ui/field"
import { label } from "@/lib/format"
import { addComment, escalateTicket, updateTicket } from "../actions"

// what the button says for each move
const moveLabels: Partial<Record<TicketStatus, string>> = {
  in_progress: "Start work",
  waiting: "Mark as waiting",
  resolved: "Mark as resolved",
  closed: "Close ticket",
}

/** IT staff: owner, priority and the next stage. */
export function StaffControls({
  ticket,
  staff,
  meId,
}: {
  ticket: TicketDetail
  staff: Person[]
  meId: string
}) {
  const [state, action, pending] = useActionState(updateTicket.bind(null, ticket.id), {})
  const moves = statusTransitions[ticket.status]

  return (
    <div className="flex flex-col gap-4 rounded-card bg-surface p-6">
      <p className="text-[19px] leading-[26px] font-medium tracking-[-0.01em]">
        {ticket.assignee_name ? `With ${ticket.assignee_name}` : "No owner yet"}
      </p>

      {!ticket.assignee_id && (
        <form action={action}>
          <input type="hidden" name="assignee_id" value={meId} />
          <Button variant="strong" disabled={pending} className="w-full">
            Assign to me
          </Button>
        </form>
      )}

      {moves.includes("resolved") && (
        <form action={action} className="flex flex-col gap-3">
          <input type="hidden" name="status" value="resolved" />
          <label htmlFor="resolution" className="font-medium">
            What fixed it?
          </label>
          <textarea
            id="resolution"
            name="resolution"
            rows={3}
            required
            placeholder="Replaced the DisplayPort cable"
            className="w-full rounded-[12px] border-[1.5px] border-hairline bg-ground px-3.5 py-3 placeholder:text-ink-3"
          />
          <Button variant="action" disabled={pending} className="self-start">
            {moveLabels.resolved}
          </Button>
        </form>
      )}

      {moves.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {moves
            .filter((status) => status !== "resolved")
            .map((status) => (
              <form key={status} action={action}>
                <input type="hidden" name="status" value={status} />
                <Button variant="quiet" disabled={pending}>
                  {ticket.status === "resolved" && status === "in_progress"
                    ? "Reopen"
                    : moveLabels[status]}
                </Button>
              </form>
            ))}
        </div>
      )}

      <form action={action} className="flex flex-col gap-4">
        <Select
          label="Owner"
          name="assignee_id"
          defaultValue={ticket.assignee_id ?? ""}
          key={ticket.assignee_id}
        >
          <option value="" disabled>
            Not assigned
          </option>
          {staff.map((person) => (
            <option key={person.id} value={person.id}>
              {person.full_name}
            </option>
          ))}
        </Select>
        <Select
          label="Priority"
          name="priority"
          defaultValue={ticket.priority}
          key={ticket.priority}
        >
          {ticketPriorities.map((priority) => (
            <option key={priority} value={priority}>
              {label(priority)}
            </option>
          ))}
        </Select>
        <Button variant="quiet" disabled={pending}>
          Save changes
        </Button>
      </form>
      <FormError message={state.error} />
    </div>
  )
}

/** The reporter confirms the fix, or sends the ticket back. */
export function ConfirmFix({
  ticketId,
  resolution,
}: {
  ticketId: string
  resolution: string | null
}) {
  const [state, action, pending] = useActionState(updateTicket.bind(null, ticketId), {})
  return (
    <div className="flex flex-col gap-4 rounded-panel bg-action p-6 text-on-action">
      <p className="text-[19px] leading-[26px] font-medium tracking-[-0.01em]">
        IT says this is fixed. Is it?
      </p>
      {resolution && <p>What they did: {resolution}</p>}
      <div className="flex flex-wrap gap-2">
        <form action={action}>
          <input type="hidden" name="status" value="closed" />
          <Button variant="strong" disabled={pending}>
            Yes, it is fixed
          </Button>
        </form>
        <form action={action}>
          <input type="hidden" name="status" value="in_progress" />
          <Button variant="quiet" disabled={pending} className="border-on-action text-on-action">
            No, still not working
          </Button>
        </form>
      </div>
      <FormError message={state.error} />
    </div>
  )
}

export function ReplyForm({
  ticketId,
  isStaff,
  reporterName,
}: {
  ticketId: string
  isStaff: boolean
  reporterName: string
}) {
  const [state, action, pending] = useActionState(addComment.bind(null, ticketId), {})
  return (
    // the key clears the box after a reply is sent
    <form
      action={action}
      id="reply"
      key={String(state.ok) + pending}
      className="flex flex-col gap-4 rounded-card bg-surface px-6 py-5"
    >
      <label htmlFor="body" className="font-medium">
        Reply
      </label>
      <textarea
        id="body"
        name="body"
        onKeyDown={(event) => {
          if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
            event.currentTarget.form?.requestSubmit()
          }
        }}
        rows={3}
        required
        placeholder={
          isStaff ? `Write an update for ${reporterName}` : "Add more detail or answer IT"
        }
        className="w-full rounded-[12px] border-[1.5px] border-hairline bg-ground px-3.5 py-3 placeholder:text-ink-3"
      />
      <div className="flex flex-wrap items-center justify-between gap-4">
        {isStaff ? (
          <label className="flex min-h-11 items-center gap-2.5">
            <input type="checkbox" name="is_internal" className="size-[18px] accent-accent" />
            Internal note, only IT can see it
          </label>
        ) : (
          <span />
        )}
        <Button disabled={pending}>{pending ? "Sending" : "Send reply"}</Button>
      </div>
      <FormError message={state.error} />
    </form>
  )
}

/**
 * The ticket page's header actions and their keys: E escalates, R jumps to the reply box.
 */
export function TicketShortcuts({
  ticketId,
  canEscalate,
}: {
  ticketId: string
  canEscalate: boolean
}) {
  const [state, escalate, escalating] = useActionState(() => escalateTicket(ticketId), {})

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null
      if (target?.closest("input, textarea, select") || event.metaKey || event.ctrlKey) return
      if (event.key.toLowerCase() === "r") {
        event.preventDefault()
        document.getElementById("body")?.focus()
      }
      if (event.key.toLowerCase() === "e" && canEscalate) {
        event.preventDefault()
        document.getElementById("escalate")?.click()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [canEscalate])

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex flex-wrap gap-2">
        {canEscalate && (
          <form action={escalate}>
            <Button id="escalate" variant="signal" disabled={escalating}>
              Escalate <Kbd>E</Kbd>
            </Button>
          </form>
        )}
        <a
          href="#reply"
          className="lift inline-flex min-h-11 items-center gap-2 rounded-full bg-surface px-5 font-medium text-ink no-underline"
        >
          Reply <Kbd>R</Kbd>
        </a>
      </div>
      <FormError message={state.error} />
    </div>
  )
}
