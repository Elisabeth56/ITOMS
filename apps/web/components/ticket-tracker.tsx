import type { TicketStatus } from "@itoms/shared"

const stages = ["Sent", "Assigned", "In progress", "Resolved"]
// waiting sits inside "in progress" for the person who asked
const stageOf: Record<TicketStatus, number> = {
  open: 0,
  assigned: 1,
  in_progress: 2,
  waiting: 2,
  resolved: 3,
  closed: 3,
}

/** Where a request stands, as four segments the reporter can read at a glance. */
export function TicketTracker({ status }: { status: TicketStatus }) {
  const stage = stageOf[status]
  const done = status === "resolved" || status === "closed"
  return (
    <ol className="flex gap-1.5" aria-label={`Stage: ${stages[stage]}`}>
      {stages.map((name, i) => (
        <li key={name} className="flex flex-1 flex-col gap-1.5">
          <span
            className={`h-1.5 rounded-full ${i <= stage ? (done ? "bg-ok" : "bg-accent") : "bg-hairline"}`}
          />
          <span className={`text-xs ${i <= stage ? "text-ink-2" : "text-ink-3"}`}>{name}</span>
        </li>
      ))}
    </ol>
  )
}
