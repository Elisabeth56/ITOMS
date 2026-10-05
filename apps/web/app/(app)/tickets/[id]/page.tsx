import { notFound } from "next/navigation"
import {
  hasRole,
  type Asset,
  type Person,
  type TicketDetail,
  type TicketEvent,
} from "@itoms/shared"
import { AssetTag } from "@/components/asset-tag"
import { Pill } from "@/components/ui/pill"
import { api, ApiError, getMe } from "@/lib/api"
import { deviceLine, label, timeAgo } from "@/lib/format"
import { ConfirmFix, ReplyForm, StaffControls } from "./controls"

export const metadata = { title: "Ticket" }

function describe(event: TicketEvent, names: Map<string, string>) {
  if (event.type === "created") return "Request filed"
  if (event.type === "priority_changed")
    return `Priority set to ${label(event.to_value ?? "").toLowerCase()}`
  if (event.type === "assigned") return `Assigned to ${names.get(event.to_value ?? "") ?? "IT"}`
  return `Moved to ${label(event.to_value ?? "").toLowerCase()}`
}

/** Loads something that may be missing or hidden from this user, without failing the page. */
async function optional<T>(path: string) {
  try {
    return await api<T>(path)
  } catch (error) {
    if (error instanceof ApiError) return null
    throw error
  }
}

export default async function TicketPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const me = await getMe()
  const isStaff = hasRole(me.role, "it_staff")

  const ticket = await optional<TicketDetail>(`/tickets/${id}`)
  if (!ticket) notFound()
  const [people, device] = await Promise.all([
    isStaff ? api<Person[]>("/users") : [],
    ticket.asset_id ? optional<Asset>(`/assets/${ticket.asset_id}`) : null,
  ])
  const staff = people.filter((person) => person.is_active && person.role !== "employee")
  const names = new Map(people.map((person) => [person.id, person.full_name]))
  const isReporter = ticket.reporter_id === me.id

  return (
    <>
      <div className="flex flex-col gap-2">
        <p className="font-mono text-[13px] text-ink-3">
          {ticket.ref} · {label(ticket.category)} · filed {timeAgo(ticket.created_at)}
        </p>
        <h1 className="text-[28px] leading-[34px] font-medium tracking-[-0.02em]">
          {ticket.title}
        </h1>
        <div className="flex flex-wrap gap-2">
          <Pill value={ticket.priority} surface />
          <Pill value={ticket.status} surface />
        </div>
      </div>

      <div className="flex flex-wrap items-start gap-6">
        <section
          aria-label="Conversation"
          className="flex min-w-0 flex-[999_1_480px] flex-col gap-3"
        >
          <article className="rounded-card bg-surface px-6 py-5">
            <p className="text-sm text-ink-3">{ticket.reporter_name}</p>
            <p className="mt-2 whitespace-pre-line">{ticket.description}</p>
          </article>

          {ticket.suggestion && (
            <article className="rounded-card border-[1.5px] border-dashed border-hairline px-6 py-5">
              <p className="text-sm text-ink-2">Already tried: the AI quick fix suggested this</p>
              <p className="mt-2">{ticket.suggestion.summary}</p>
              <ol className="mt-2 flex list-decimal flex-col gap-1 pl-6">
                {ticket.suggestion.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </article>
          )}

          {ticket.comments.map((comment) => (
            <article
              key={comment.id}
              className={`rounded-card px-6 py-5 ${comment.is_internal ? "bg-sunken" : "bg-surface"}`}
            >
              <p className="text-sm text-ink-2">
                {comment.author_name} · {timeAgo(comment.created_at)}
                {comment.is_internal && ` · internal note, hidden from ${ticket.reporter_name}`}
              </p>
              <p className="mt-2 whitespace-pre-line">{comment.body}</p>
            </article>
          ))}

          {ticket.status !== "closed" && (
            <ReplyForm ticketId={ticket.id} isStaff={isStaff} reporterName={ticket.reporter_name} />
          )}
        </section>

        <aside aria-label="Ticket details" className="flex min-w-0 flex-[1_1_320px] flex-col gap-3">
          {isStaff && <StaffControls ticket={ticket} staff={staff} meId={me.id} />}
          {isReporter && ticket.status === "resolved" && <ConfirmFix ticketId={ticket.id} />}
          {!isStaff && ticket.status !== "resolved" && (
            <div className="rounded-panel bg-surface p-6">
              <p className="text-[19px] leading-[26px] font-medium tracking-[-0.01em]">
                {ticket.assignee_name
                  ? `${ticket.assignee_name} is on it`
                  : "Waiting for IT to pick this up"}
              </p>
            </div>
          )}

          {device && (
            <div className="flex flex-col gap-3 rounded-panel bg-surface p-6">
              <p className="text-sm text-ink-3">Device</p>
              <AssetTag
                onSurface
                tag={device.asset_tag}
                detail={deviceLine(device, device.location)}
                href={isStaff ? `/devices/${device.id}` : undefined}
              />
            </div>
          )}

          <div className="flex flex-col gap-3 rounded-panel bg-surface p-6">
            <p className="text-sm text-ink-3">Activity</p>
            <ol className="flex flex-col gap-3">
              {ticket.events.toReversed().map((event) => (
                <li key={event.id}>
                  <p>{describe(event, names)}</p>
                  <p className="text-sm text-ink-3">
                    {event.actor_name ?? "Automatically"} · {timeAgo(event.created_at)}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </aside>
      </div>
    </>
  )
}
