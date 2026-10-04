import Link from "next/link"
import type { Ticket } from "@itoms/shared"
import { label, timeAgo } from "@/lib/format"
import { Pill } from "./ui/pill"

export function TicketCard({ ticket, showReporter }: { ticket: Ticket; showReporter: boolean }) {
  const who = showReporter ? ticket.reporter_name : null
  const owner = ticket.assignee_name ? `with ${ticket.assignee_name}` : null
  const meta = [who, owner ?? `filed ${timeAgo(ticket.created_at)}`].filter(Boolean).join(" · ")

  return (
    <Link
      href={`/tickets/${ticket.id}`}
      className="flex flex-wrap items-center justify-between gap-4 rounded-card bg-surface px-6 py-5 transition-transform duration-200 hover:-translate-y-0.5"
    >
      <div className="min-w-0 flex-[1_1_280px]">
        <p className="font-mono text-[13px] text-ink-3">
          {ticket.ref} · {label(ticket.category)}
        </p>
        <p className="text-[19px] leading-[26px] font-medium tracking-[-0.01em]">{ticket.title}</p>
        <p className="text-sm text-ink-3">{meta}</p>
      </div>
      <div className="flex items-center gap-2">
        <Pill value={ticket.priority} />
        <Pill value={ticket.status} />
      </div>
    </Link>
  )
}
