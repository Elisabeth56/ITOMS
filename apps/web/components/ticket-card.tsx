import Link from "next/link"
import type { Ticket } from "@itoms/shared"
import { label, timeAgo } from "@/lib/format"
import { TicketTracker } from "./ticket-tracker"
import { Pill } from "./ui/pill"

/** One request in the reporter's own list. */
export function TicketCard({ ticket }: { ticket: Ticket }) {
  const meta = ticket.assignee_name
    ? `with ${ticket.assignee_name}`
    : `filed ${timeAgo(ticket.created_at)}`
  return (
    <Link
      href={`/tickets/${ticket.id}`}
      className="lift flex flex-col gap-4 rounded-card bg-surface p-6 text-ink no-underline"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="font-dot text-2xl font-bold">{ticket.ref}</span>
        <span className="flex gap-2">
          <Pill value={ticket.category} />
          <Pill value={ticket.status} />
        </span>
      </div>
      <div>
        <p className="text-lg font-medium tracking-[-0.01em]">{ticket.title}</p>
        <p className="text-sm text-ink-3">
          {label(ticket.category)} · {meta}
        </p>
      </div>
      <TicketTracker status={ticket.status} />
    </Link>
  )
}
