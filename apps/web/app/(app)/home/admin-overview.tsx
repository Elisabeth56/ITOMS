import Link from "next/link"
import type { ChangeRequest, Dashboard, Page, Person, Ticket } from "@itoms/shared"
import { Banner } from "@/components/dot-field"
import { ButtonLink } from "@/components/ui/button"
import { Pill } from "@/components/ui/pill"
import { api } from "@/lib/api"
import { duration, label, timeAgo } from "@/lib/format"

const today = new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long" })
const weekday = new Intl.DateTimeFormat("en-GB", { weekday: "narrow" })

function Well({
  title,
  value,
  note,
  tint,
}: {
  title: string
  value: string
  note?: string
  tint: string
}) {
  return (
    <div className={`lift rounded-card px-4.5 py-4 ${tint}`}>
      <div className="font-mono text-xs">{title}</div>
      <div className="tick font-dot text-[40px] leading-[48px] font-bold text-ink">{value}</div>
      {note && <div className="text-xs">{note}</div>}
    </div>
  )
}

/** The administrator's home: what needs a decision first, then how the desk is doing. */
export async function AdminOverview({ name }: { name: string }) {
  const [dashboard, escalated, late, requests, people] = await Promise.all([
    api<Dashboard>("/dashboard"),
    api<Page<Ticket>>("/tickets?escalated=true&sort=due&page_size=10"),
    api<Page<Ticket>>("/tickets?late=true&sort=due&page_size=10"),
    api<ChangeRequest[]>("/change-requests?status=pending"),
    api<Person[]>("/users"),
  ])
  // an escalated ticket that is also late is listed once
  const needsYou = [
    ...escalated.items,
    ...late.items.filter((ticket) => !ticket.escalated_at),
  ].slice(0, 8)
  const { tickets, quick_fix: quickFix } = dashboard
  const peak = Math.max(1, ...dashboard.tickets_per_day.map((day) => day.count))
  const invited = people.filter((person) => person.is_active).length

  return (
    <>
      <Banner
        date={today.format(new Date())}
        title={`Hello, ${name.split(" ")[0]}.`}
        subtitle={
          needsYou.length
            ? `${tickets.escalated} escalated and ${tickets.late} late. They are listed first.`
            : "Nothing is escalated or late."
        }
        action={
          <ButtonLink href="/people" variant="light">
            Invite someone
          </ButtonLink>
        }
      />

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-medium tracking-[-0.01em]">Needs you</h2>
        {needsYou.length === 0 ? (
          <p className="rounded-card bg-sage px-6 py-5 text-on-sage">
            All clear. Nothing waits on a decision.
          </p>
        ) : (
          <ul className="overflow-hidden rounded-card bg-surface">
            {needsYou.map((ticket) => (
              <li key={ticket.id} className="border-t border-hairline first:border-0">
                <Link
                  href={`/tickets/${ticket.id}`}
                  className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 text-ink no-underline transition-colors duration-150 hover:bg-sunken"
                >
                  <span className="flex items-center gap-4">
                    <span className="font-dot text-[22px] font-bold">{ticket.ref}</span>
                    <span>
                      {ticket.title}
                      <span className="block text-[13px] text-ink-2">
                        {ticket.assignee_name ?? "Unassigned"} · filed {timeAgo(ticket.created_at)}
                      </span>
                    </span>
                  </span>
                  {ticket.escalated_at ? (
                    <Pill value="escalated" tone="peach" text="Escalated" />
                  ) : (
                    <Pill value="late" tone="urgent" text="Late" />
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Well
          title="Open"
          value={String(tickets.open).padStart(2, "0")}
          tint="bg-action text-on-action"
        />
        <Well
          title="Average fix"
          value={duration(dashboard.avg_fix_hours)}
          note="Last 30 days"
          tint="bg-sage text-on-sage"
        />
        <Well
          title="Quick fix solved"
          value={String(quickFix.solved).padStart(2, "0")}
          note={`of ${quickFix.asked} asked`}
          tint="bg-butter text-on-butter"
        />
        <Well
          title="Under repair"
          value={String(dashboard.assets.under_repair).padStart(2, "0")}
          tint="bg-peach text-on-peach"
        />
      </div>

      <div className="flex flex-wrap gap-4">
        <section className="flex flex-[2_1_460px] flex-col gap-5 rounded-card bg-surface p-6">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-lg font-medium">New tickets per day</h2>
            <span className="text-[13px] text-ink-3">Last 14 days</span>
          </div>
          <div
            role="img"
            aria-label={`New tickets per day over the last 14 days: ${dashboard.tickets_per_day.map((day) => day.count).join(", ")}`}
            className="flex h-36 items-end gap-1.5"
          >
            {dashboard.tickets_per_day.map((day, i, days) => (
              <div
                key={day.day}
                className="flex h-full flex-1 flex-col items-center justify-end gap-1.5"
              >
                <span className="font-mono text-[11px] text-ink-3">{day.count || ""}</span>
                <span
                  className={`w-full rounded-lg ${i === days.length - 1 ? "bg-accent" : "bg-action"}`}
                  style={{ height: `${Math.max(4, (day.count / peak) * 100)}%` }}
                />
                <span className="font-mono text-[11px] text-ink-3">
                  {weekday.format(new Date(day.day))}
                </span>
              </div>
            ))}
          </div>
        </section>

        <div className="flex flex-[1_1_300px] flex-col gap-4">
          <section className="flex flex-col gap-2 rounded-card bg-butter p-6 text-on-butter">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="text-lg font-medium text-ink">Change requests</h2>
              <Link href="/change-requests" className="text-sm text-on-butter">
                Review
              </Link>
            </div>
            <p className="text-sm">
              {requests.length === 0
                ? "Nothing waiting."
                : `${requests.length} waiting. Oldest: ${requests[0]!.asset_tag} ${Object.keys(
                    requests[0]!.proposed,
                  )
                    .map((f) => label(f).toLowerCase())
                    .join(", ")}, from ${requests[0]!.requested_by_name}.`}
            </p>
          </section>
          <section className="flex flex-col gap-2 rounded-card bg-surface p-6">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="text-lg font-medium">People</h2>
              <Link href="/people" className="text-sm">
                Manage
              </Link>
            </div>
            <p className="text-sm text-ink-2">
              {invited} active · {people.filter((p) => p.role !== "employee").length} on the IT team
            </p>
          </section>
        </div>
      </div>
    </>
  )
}
