import Link from "next/link"
import type { MyAsset, Page, Ticket } from "@itoms/shared"
import { AssetTag } from "@/components/asset-tag"
import { Banner } from "@/components/dot-field"
import { Empty } from "@/components/empty"
import { TicketTracker } from "@/components/ticket-tracker"
import { ButtonLink, Kbd } from "@/components/ui/button"
import { Pill } from "@/components/ui/pill"
import { api } from "@/lib/api"
import { deviceLine, label } from "@/lib/format"
import { ConfirmFix } from "../tickets/[id]/controls"

const today = new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long" })

function greeting() {
  // Lagos time, whatever region the server runs in
  const hour = Number(
    new Intl.DateTimeFormat("en-GB", { hour: "numeric", timeZone: "Africa/Lagos" }).format(
      new Date(),
    ),
  )
  return hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening"
}

export async function EmployeeHome({ name }: { name: string }) {
  const [tickets, devices] = await Promise.all([
    api<Page<Ticket>>("/tickets?page_size=50"),
    api<MyAsset[]>("/assets/mine"),
  ])
  const open = tickets.items.filter((ticket) => ticket.status !== "closed")
  const waiting = open.filter((ticket) => ticket.status === "resolved").length
  const pending = devices.filter((device) => device.pending_change)

  const subtitle = !open.length
    ? "Nothing open with IT right now."
    : `${open.length} ${open.length === 1 ? "request" : "requests"} open.${waiting ? ` ${waiting} ${waiting === 1 ? "needs" : "need"} your answer.` : ""}`

  return (
    <>
      <Banner
        date={today.format(new Date())}
        title={`${greeting()}, ${name.split(" ")[0]}.`}
        subtitle={subtitle}
        action={
          <ButtonLink href="/tickets/new" variant="signal">
            Get help <Kbd>N</Kbd>
          </ButtonLink>
        }
      />

      <section className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="text-xl font-medium tracking-[-0.01em]">Your requests</h2>
          <Link href="/tickets" className="text-sm">
            See all
          </Link>
        </div>
        {open.length === 0 ? (
          <Empty title="All clear.">
            <p className="text-ink-3">
              When something stops working, tell IT here and follow it until it is fixed.
            </p>
          </Empty>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {open.map((ticket) => (
              <div key={ticket.id} className="flex flex-col gap-4 rounded-card bg-surface p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <Link
                    href={`/tickets/${ticket.id}`}
                    className="tick font-dot text-2xl font-bold text-ink no-underline"
                  >
                    {ticket.ref}
                  </Link>
                  {ticket.status === "resolved" ? (
                    <Pill value="resolved" tone="butter" text="Waiting for you" />
                  ) : ticket.assignee_name ? (
                    <Pill
                      value="assigned"
                      text={`${ticket.assignee_name.split(" ")[0]} is on it`}
                    />
                  ) : (
                    <Pill value={ticket.status} />
                  )}
                </div>
                <Link
                  href={`/tickets/${ticket.id}`}
                  className="text-lg font-medium text-ink no-underline"
                >
                  {ticket.title}
                </Link>
                <TicketTracker status={ticket.status} />
                {ticket.status === "resolved" && (
                  <ConfirmFix ticketId={ticket.id} resolution={ticket.resolution} />
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-medium tracking-[-0.01em]">Devices in your name</h2>
        {devices.length === 0 ? (
          <Empty title="Nothing is assigned to you.">
            <p className="text-ink-3">
              When IT gives you a laptop or phone, it shows here with its tag.
            </p>
          </Empty>
        ) : (
          <div className="flex flex-wrap gap-3">
            {devices.map((device) => (
              <AssetTag
                key={device.id}
                href={`/devices/${device.id}`}
                tag={device.asset_tag}
                detail={deviceLine(device, device.location)}
                type={device.type}
                status={device.status}
              />
            ))}
          </div>
        )}
        {pending.map((device) => (
          <div
            key={device.id}
            className="flex flex-wrap items-center gap-2.5 rounded-card bg-butter px-4 py-3 text-sm text-on-butter"
          >
            <span aria-hidden className="pulse-dot size-2 rounded-full bg-signal-strong" />
            You asked to change {device.asset_tag}:{" "}
            {Object.entries(device.pending_change!)
              .map(([field, value]) => `${label(field).toLowerCase()} to ${value}`)
              .join(", ")}
            . IT will review it.
          </div>
        ))}
      </section>
    </>
  )
}
