import Link from "next/link"
import { hasRole, ticketStatuses, type Dashboard, type Page, type Ticket } from "@itoms/shared"
import { Empty } from "@/components/empty"
import { QueueFilters, queueFilters, type QueueFilter } from "@/components/queue-filters"
import { QueueTable } from "@/components/queue-table"
import { TicketCard } from "@/components/ticket-card"
import { ButtonLink, Kbd } from "@/components/ui/button"
import { api, getMe, type Me } from "@/lib/api"
import { label } from "@/lib/format"

export const metadata = { title: "Tickets" }

type Search = { status?: string; filter?: string; late?: string; escalated?: string; page?: string }

export default async function TicketsPage({ searchParams }: { searchParams: Promise<Search> }) {
  const search = await searchParams
  const me = await getMe()
  return hasRole(me.role, "it_staff") ? (
    <Queue me={me} search={search} />
  ) : (
    <MyTickets search={search} />
  )
}

function Well({ title, value, tint }: { title: string; value: number; tint: string }) {
  return (
    <div className={`lift rounded-card px-4.5 py-4 ${tint}`}>
      <div className="font-mono text-xs">{title}</div>
      <div className="tick font-dot text-[44px] leading-[52px] font-bold text-ink">
        {String(value).padStart(2, "0")}
      </div>
    </div>
  )
}

/** IT staff and admins: open work, soonest due first, worked from the keyboard. */
async function Queue({ me, search }: { me: Me; search: Search }) {
  // the sidebar's Late and Escalated links are filters on this same page
  const filter: QueueFilter = search.late
    ? "late"
    : queueFilters.some((f) => f.key === search.filter)
      ? (search.filter as QueueFilter)
      : "all"
  const query = new URLSearchParams({ sort: "due", active: "true", page_size: "50" })
  if (filter === "late") query.set("late", "true")
  if (filter === "unassigned") query.set("status", "open")
  if (filter === "mine") query.set("assignee_id", me.id)
  if (search.escalated) query.set("escalated", "true")

  const [tickets, counts] = await Promise.all([
    api<Page<Ticket>>(`/tickets?${query}`),
    api<Dashboard>("/dashboard"),
  ])
  const next = tickets.items.find((ticket) => !ticket.assignee_id) ?? tickets.items[0]
  const title = search.escalated ? "Escalated" : filter === "late" ? "Late" : "Queue"
  const subtitle = search.escalated
    ? "Tickets IT passed up to an administrator."
    : `Sorted by due time.${counts.tickets.late ? ` ${counts.tickets.late} late.` : ""}`

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="rise text-[36px] leading-10 font-medium tracking-[-0.025em]">{title}</h1>
          <p className="mt-1.5 text-ink-2">{subtitle}</p>
        </div>
        {next && (
          <ButtonLink href={`/tickets/${next.id}`} variant="strong">
            Next ticket <Kbd>Enter</Kbd>
          </ButtonLink>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Well title="Open" value={counts.tickets.open} tint="bg-action text-on-action" />
        <Well title="Late" value={counts.tickets.late} tint="bg-peach text-on-peach" />
        <Well
          title="Unassigned"
          value={counts.tickets.unassigned}
          tint="bg-butter text-on-butter"
        />
        <Well
          title="Change requests"
          value={counts.change_requests.pending}
          tint="bg-sage text-on-sage"
        />
      </div>

      {!search.escalated && (
        <QueueFilters current={filter} chosen={!!search.filter || !!search.late} />
      )}

      {tickets.items.length === 0 ? (
        <div className="flex flex-col items-start gap-3 rounded-panel bg-sage p-10 text-on-sage">
          <span className="font-dot text-[72px] leading-[72px] font-bold">00</span>
          <h2 className="text-2xl font-medium tracking-[-0.02em] text-ink">Nothing here</h2>
          <p>New requests show up here, sorted by due time.</p>
        </div>
      ) : (
        <QueueTable tickets={tickets.items} />
      )}

      <p className="flex flex-wrap gap-5 text-[13px] text-ink-3">
        {[
          ["J K", "move"],
          ["Enter", "open"],
          ["A", "assign to me"],
          ["E", "escalate"],
        ].map(([keys, text]) => (
          <span key={keys}>
            <span className="rounded-md border border-hairline px-1.5 py-0.5 font-mono text-[11px]">
              {keys}
            </span>{" "}
            {text}
          </span>
        ))}
      </p>
    </>
  )
}

/** Employees: their own requests, newest first. */
async function MyTickets({ search }: { search: Search }) {
  const query = new URLSearchParams({ page: search.page ?? "1" })
  if (search.status) query.set("status", search.status)
  const tickets = await api<Page<Ticket>>(`/tickets?${query}`)
  const pages = Math.ceil(tickets.total / tickets.page_size)
  const pageLink = (page: number) =>
    `/tickets?${new URLSearchParams({ ...(search.status && { status: search.status }), page: String(page) })}`

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="rise text-[36px] leading-10 font-medium tracking-[-0.025em]">
          Your requests to IT
        </h1>
        <ButtonLink href="/tickets/new" variant="strong">
          Get help <Kbd>N</Kbd>
        </ButtonLink>
      </div>

      <div className="inline-flex flex-wrap gap-0.5 self-start rounded-full bg-surface p-1">
        {[undefined, ...ticketStatuses].map((value) => (
          <Link
            key={value ?? "all"}
            href={value ? `/tickets?status=${value}` : "/tickets"}
            aria-current={search.status === value ? "true" : undefined}
            className={`flex min-h-9 items-center rounded-full px-3.5 text-sm no-underline ${
              search.status === value ? "bg-ink text-surface" : "text-ink-2 hover:bg-sunken"
            }`}
          >
            {value ? label(value) : "All"}
          </Link>
        ))}
      </div>

      {tickets.items.length === 0 ? (
        <Empty title={search.status ? "Nothing here right now." : "No requests yet."}>
          <p className="text-ink-3">
            When something stops working, send a request and IT will pick it up.
          </p>
          <ButtonLink href="/tickets/new" variant="strong">
            Get help
          </ButtonLink>
        </Empty>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {tickets.items.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} />
          ))}
        </div>
      )}

      {pages > 1 && (
        <div className="flex items-center gap-3">
          {tickets.page > 1 && (
            <ButtonLink variant="quiet" href={pageLink(tickets.page - 1)}>
              Newer
            </ButtonLink>
          )}
          {tickets.page < pages && (
            <ButtonLink variant="quiet" href={pageLink(tickets.page + 1)}>
              Older
            </ButtonLink>
          )}
          <span className="text-sm text-ink-3">
            Page {tickets.page} of {pages}
          </span>
        </div>
      )}
    </>
  )
}
