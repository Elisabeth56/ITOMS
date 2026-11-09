"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState, useTransition } from "react"
import type { Ticket } from "@itoms/shared"
import { assignToMe, escalateTicket } from "@/app/(app)/tickets/actions"
import { label, timeAgo } from "@/lib/format"
import { Pill } from "./ui/pill"

const priorityDot: Record<string, string> = {
  urgent: "bg-signal",
  high: "bg-signal",
  medium: "bg-accent",
  low: "bg-hairline",
}

function dueText(ticket: Ticket) {
  if (ticket.status === "waiting") return "Waiting"
  const due = timeAgo(ticket.due_at)
  return ticket.is_late ? `Late, due ${due}` : `Due ${due}`
}

/** True when a key press belongs to a text field, not to the queue. */
function typing(target: EventTarget | null) {
  const element = target as HTMLElement | null
  return !!element?.closest("input, textarea, select, [contenteditable]")
}

/**
 * The IT queue, worked from the keyboard: J and K move, Enter opens, A assigns the ticket
 * to you, E escalates it. Every action reports back in the status line under the table.
 */
export function QueueTable({ tickets }: { tickets: Ticket[] }) {
  const router = useRouter()
  const [selected, setSelected] = useState(0)
  const [message, setMessage] = useState("")
  const [, startTransition] = useTransition()

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (typing(event.target) || event.metaKey || event.ctrlKey || event.altKey) return
      const ticket = tickets[selected]
      const key = event.key.toLowerCase()
      if (key === "j") setSelected((i) => Math.min(i + 1, tickets.length - 1))
      else if (key === "k") setSelected((i) => Math.max(i - 1, 0))
      else if (key === "enter" && ticket) router.push(`/tickets/${ticket.id}`)
      else if ((key === "a" || key === "e") && ticket) {
        startTransition(async () => {
          const state = key === "a" ? await assignToMe(ticket.id) : await escalateTicket(ticket.id)
          setMessage(
            state.error ??
              `${ticket.ref} ${key === "a" ? "is yours" : "was escalated to an administrator"}.`,
          )
          router.refresh()
        })
      } else return
      event.preventDefault()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [tickets, selected, router])

  const head = "px-4 py-3 text-left font-mono text-xs font-medium text-ink-3"
  return (
    <>
      <div className="overflow-x-auto rounded-card bg-surface">
        <table className="w-full min-w-[860px] border-collapse">
          <thead>
            <tr>
              <th scope="col" className={head}>
                Ticket
              </th>
              <th scope="col" className={head}>
                Problem
              </th>
              <th scope="col" className={head}>
                Reporter
              </th>
              <th scope="col" className={head}>
                Category
              </th>
              <th scope="col" className={head}>
                Priority
              </th>
              <th scope="col" className={head}>
                Owner
              </th>
              <th scope="col" className={`${head} text-right`}>
                Due
              </th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((ticket, i) => {
              const active = i === selected
              return (
                <tr
                  key={ticket.id}
                  aria-selected={active}
                  onClick={() => router.push(`/tickets/${ticket.id}`)}
                  onMouseEnter={() => setSelected(i)}
                  className={`cursor-pointer border-t border-hairline transition-colors duration-150 ${active ? "bg-action text-on-action" : ""}`}
                >
                  <td className="px-4 py-3.5 font-mono text-xs">{ticket.ref}</td>
                  <td className="px-4 py-3.5 font-medium">
                    {/* a real link, so the row works without the keyboard shortcuts too */}
                    <a href={`/tickets/${ticket.id}`} className="text-inherit no-underline">
                      {ticket.title}
                    </a>
                    {ticket.escalated_at && (
                      <span className="ml-2 align-middle">
                        <Pill value="escalated" tone="peach" text="Escalated" />
                      </span>
                    )}
                  </td>
                  <td className={`px-4 py-3.5 ${active ? "" : "text-ink-2"}`}>
                    {ticket.reporter_name}
                  </td>
                  <td className="px-4 py-3.5">
                    <Pill value={ticket.category} />
                  </td>
                  <td className="px-4 py-3.5 text-sm">
                    <span className="inline-flex items-center gap-1.5">
                      <span
                        aria-hidden
                        className={`size-2 rounded-full ${priorityDot[ticket.priority]}`}
                      />
                      {label(ticket.priority)}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-sm">
                    {ticket.assignee_name?.split(" ")[0] ?? "Unassigned"}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    {ticket.is_late ? (
                      <Pill value="late" tone="urgent" text={dueText(ticket)} />
                    ) : (
                      <span className="text-[13px]">{dueText(ticket)}</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <p role="status" className="min-h-5 text-sm text-ink-2">
        {message}
      </p>
    </>
  )
}
