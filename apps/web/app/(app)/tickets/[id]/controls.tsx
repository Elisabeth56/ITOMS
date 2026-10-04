"use client"

import { useActionState } from "react"
import {
  statusTransitions,
  ticketPriorities,
  type Person,
  type TicketDetail,
  type TicketStatus,
} from "@itoms/shared"
import { FormError } from "@/components/form-error"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/field"
import { label } from "@/lib/format"
import { addComment, updateTicket } from "../actions"

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
    <div className="flex flex-col gap-4 rounded-panel bg-surface p-6">
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

      {moves.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {moves.map((status) => (
            <form key={status} action={action}>
              <input type="hidden" name="status" value={status} />
              <Button variant={status === "resolved" ? "action" : "quiet"} disabled={pending}>
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
export function ConfirmFix({ ticketId }: { ticketId: string }) {
  const [state, action, pending] = useActionState(updateTicket.bind(null, ticketId), {})
  return (
    <div className="flex flex-col gap-4 rounded-panel bg-action p-6 text-on-action">
      <p className="text-[19px] leading-[26px] font-medium tracking-[-0.01em]">
        IT says this is fixed. Is it?
      </p>
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
      key={String(state.ok) + pending}
      className="flex flex-col gap-4 rounded-card bg-surface px-6 py-5"
    >
      <label htmlFor="body" className="font-medium">
        Reply
      </label>
      <textarea
        id="body"
        name="body"
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
