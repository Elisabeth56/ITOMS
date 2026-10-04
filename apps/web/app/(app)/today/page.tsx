import Link from "next/link"
import type { Asset, Dashboard, Page, Ticket } from "@itoms/shared"
import { AssetTag } from "@/components/asset-tag"
import { Empty } from "@/components/empty"
import { TicketCard } from "@/components/ticket-card"
import { ButtonLink } from "@/components/ui/button"
import { api, requireStaff } from "@/lib/api"
import { deviceLine, duration } from "@/lib/format"

export const metadata = { title: "Today" }

const count = (n: number, one: string, many: string) =>
  `${n === 1 ? "One" : n} ${n === 1 ? one : many}`

/** The headline says what needs doing first. */
function headline({ tickets }: Dashboard) {
  if (tickets.unassigned > 0)
    return `${count(tickets.unassigned, "request is", "requests are")} waiting for an owner.`
  if (tickets.open > 0)
    return `${count(tickets.open, "request", "requests")} in hand. None waiting.`
  return "All clear. Nothing is open."
}

export default async function TodayPage() {
  await requireStaff()
  const [dashboard, unassigned, assigned, inProgress, bench] = await Promise.all([
    api<Dashboard>("/dashboard"),
    api<Page<Ticket>>("/tickets?status=open&page_size=5"),
    api<Page<Ticket>>("/tickets?status=assigned&page_size=5"),
    api<Page<Ticket>>("/tickets?status=in_progress&page_size=5"),
    api<Page<Asset>>("/assets?status=under_repair&page_size=6"),
  ])
  const { quick_fix: quickFix } = dashboard
  const active = [...inProgress.items, ...assigned.items]

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="max-w-[18ch] text-[44px] leading-[48px] font-medium tracking-[-0.025em]">
          {headline(dashboard)}
        </h1>
        <ButtonLink href="/tickets/new">New ticket</ButtonLink>
      </div>

      <div className="flex flex-wrap items-start gap-6">
        <section aria-label="Tickets" className="flex min-w-0 flex-[999_1_480px] flex-col gap-3">
          <p className="text-sm text-ink-3">Needs an owner</p>
          {unassigned.items.length === 0 ? (
            <Empty title="Every request has an owner." />
          ) : (
            unassigned.items.map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} showReporter />
            ))
          )}

          <p className="mt-3 text-sm text-ink-3">Being worked on</p>
          {active.length === 0 ? (
            <Empty title="Nothing in progress." />
          ) : (
            active.map((ticket) => <TicketCard key={ticket.id} ticket={ticket} showReporter />)
          )}
          <Link
            href="/tickets"
            className="self-start py-2 text-accent underline-offset-4 hover:underline"
          >
            See every ticket
          </Link>
        </section>

        <aside
          aria-label="Devices under repair"
          className="flex min-w-0 flex-[1_1_320px] flex-col gap-4 rounded-panel bg-surface p-6"
        >
          <div>
            <p className="text-[19px] leading-[26px] font-medium tracking-[-0.01em]">
              On the bench
            </p>
            <p className="text-sm text-ink-3">
              {dashboard.assets.under_repair === 0
                ? "No devices under repair"
                : `${dashboard.assets.under_repair} of ${dashboard.assets.total} devices under repair`}
            </p>
          </div>
          {bench.items.map((device) => (
            <AssetTag
              key={device.id}
              onSurface
              href={`/devices/${device.id}`}
              tag={device.asset_tag}
              detail={deviceLine(device, device.holder_name ?? device.location)}
            />
          ))}

          <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-5">
            <div>
              <dd className="text-[28px] font-medium tracking-[-0.02em] tabular-nums">
                {dashboard.tickets.open}
              </dd>
              <dt className="text-sm text-ink-3">Open tickets</dt>
            </div>
            <div>
              <dd className="text-[28px] font-medium tracking-[-0.02em] tabular-nums">
                {duration(dashboard.avg_fix_hours)}
              </dd>
              <dt className="text-sm text-ink-3">Average time to fix</dt>
            </div>
            <div>
              <dd className="text-[28px] font-medium tracking-[-0.02em] tabular-nums">
                {dashboard.tickets.urgent}
              </dd>
              <dt className="text-sm text-ink-3">Urgent</dt>
            </div>
            <div>
              <dd className="text-[28px] font-medium tracking-[-0.02em] tabular-nums">
                {quickFix.solved} of {quickFix.asked}
              </dd>
              <dt className="text-sm text-ink-3">Solved by the quick fix</dt>
            </div>
          </dl>
        </aside>
      </div>
    </>
  )
}
