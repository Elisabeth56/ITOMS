import Link from "next/link"
import { hasRole, ticketStatuses, type Page, type Ticket } from "@itoms/shared"
import { Empty } from "@/components/empty"
import { TicketCard } from "@/components/ticket-card"
import { ButtonLink } from "@/components/ui/button"
import { api, getMe } from "@/lib/api"
import { label } from "@/lib/format"

export const metadata = { title: "Tickets" }

export default async function TicketsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>
}) {
  const { status, page = "1" } = await searchParams
  const me = await getMe()
  const isStaff = hasRole(me.role, "it_staff")

  const query = new URLSearchParams({ page })
  if (status) query.set("status", status)
  const tickets = await api<Page<Ticket>>(`/tickets?${query}`)
  const pages = Math.ceil(tickets.total / tickets.page_size)

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="max-w-[18ch] text-[44px] leading-[48px] font-medium tracking-[-0.025em]">
          {isStaff ? "Every request, in one place." : "Your requests to IT."}
        </h1>
        <ButtonLink href="/tickets/new">New request</ButtonLink>
      </div>

      <div className="flex flex-wrap gap-2">
        {[undefined, ...ticketStatuses].map((value) => (
          <Link
            key={value ?? "all"}
            href={value ? `/tickets?status=${value}` : "/tickets"}
            aria-current={status === value ? "true" : undefined}
            className={`flex min-h-11 items-center rounded-full px-4 ${
              status === value ? "bg-ink text-surface" : "bg-surface text-ink"
            }`}
          >
            {value ? label(value) : "All"}
          </Link>
        ))}
      </div>

      {tickets.items.length === 0 ? (
        <Empty title={status ? "Nothing here right now." : "No requests yet."}>
          <p className="text-ink-3">
            When something stops working, send a request and IT will pick it up.
          </p>
        </Empty>
      ) : (
        <div className="flex flex-col gap-3">
          {tickets.items.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} showReporter={isStaff} />
          ))}
        </div>
      )}

      {pages > 1 && (
        <div className="flex items-center gap-3">
          {tickets.page > 1 && (
            <ButtonLink
              variant="quiet"
              href={`/tickets?${new URLSearchParams({ ...(status && { status }), page: String(tickets.page - 1) })}`}
            >
              Newer
            </ButtonLink>
          )}
          {tickets.page < pages && (
            <ButtonLink
              variant="quiet"
              href={`/tickets?${new URLSearchParams({ ...(status && { status }), page: String(tickets.page + 1) })}`}
            >
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
