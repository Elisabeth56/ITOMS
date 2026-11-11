import Link from "next/link"
import { notFound } from "next/navigation"
import { hasRole, type AssetDetail, type Person } from "@itoms/shared"
import { AssetTag } from "@/components/asset-tag"
import { ChangeRequestCard } from "@/components/change-request-card"
import { DotField } from "@/components/dot-field"
import { Pill } from "@/components/ui/pill"
import { api, ApiError, getMe } from "@/lib/api"
import { formatDate, formatNaira, label } from "@/lib/format"
import { ChangeRequestForm } from "@/components/change-request-form"
import { DeviceActions } from "./actions-panel"

export const metadata = { title: "Device" }

// the header takes the colour of the device's tag
const plate: Record<string, string> = {
  printer: "bg-butter text-on-butter",
  monitor: "bg-sage text-on-sage",
  network_device: "bg-peach text-on-peach",
}

export default async function DevicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const me = await getMe()
  const isStaff = hasRole(me.role, "it_staff")

  let device: AssetDetail
  try {
    device = await api<AssetDetail>(`/assets/${id}`)
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound()
    throw error
  }
  const people = isStaff ? (await api<Person[]>("/users")).filter((person) => person.is_active) : []
  const spent = device.maintenance.reduce((sum, entry) => sum + Number(entry.cost ?? 0), 0)

  return (
    <>
      <Link href={isStaff ? "/devices" : "/my-devices"} className="text-sm no-underline">
        ← {isStaff ? "Devices" : "My devices"}
      </Link>
      <div
        className={`relative flex flex-wrap items-center gap-8 overflow-hidden rounded-panel p-8 ${plate[device.type] ?? "bg-action text-on-action"}`}
      >
        <div className="absolute right-6 bottom-4 hidden md:block">
          <DotField
            cols={10}
            rows={4}
            pitch={16}
            lit={["0,3", "1,2", "2,3", "3,2", "4,1", "5,2", "6,1", "7,0"]}
            on="fill-accent"
            off="fill-current/15"
          />
        </div>
        {/* keyed on the holder so the tag flips when the device changes hands */}
        <div key={device.holder_id ?? "nobody"} className="tag-flip -rotate-2">
          <AssetTag tag={device.asset_tag} type="other" status={device.status} big />
        </div>
        <div className="relative">
          <h1 className="text-[28px] leading-8 font-medium tracking-[-0.02em] text-ink">
            {[device.brand, device.model].filter(Boolean).join(" ") || label(device.type)}
          </h1>
          <p className="mt-1">
            {label(device.type)} · <Pill value={device.status} tone="light" />
            {device.holder_name && ` · held by ${device.holder_name}`}
          </p>
          <dl className="mt-4 flex flex-wrap gap-x-7 gap-y-3">
            {[
              ["Serial", device.serial_number],
              ["Bought", device.purchase_date && formatDate(device.purchase_date)],
              ["Location", device.location],
            ].map(([name, value]) => (
              <div key={name}>
                <dt className="font-mono text-xs">{name}</dt>
                <dd className="font-medium text-ink">{value || "Not recorded"}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {isStaff && device.pending_change && (
        <ChangeRequestCard
          request={{
            id: device.pending_change.id,
            asset_id: device.id,
            asset_tag: device.asset_tag,
            requested_by: device.holder_id ?? "",
            requested_by_name: device.holder_name ?? "The holder",
            proposed: device.pending_change.proposed,
            note: device.pending_change.note,
            status: "pending",
            decided_by_name: null,
            decided_at: null,
            decision_note: null,
            created_at: device.pending_change.created_at,
          }}
          current={{
            location: device.location,
            brand: device.brand,
            model: device.model,
            serial_number: device.serial_number,
          }}
        />
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          ["Spent on repairs", formatNaira(spent), "bg-peach text-on-peach"],
          [
            "Repairs logged",
            String(device.maintenance.length).padStart(2, "0"),
            "bg-sage text-on-sage",
          ],
          [
            "Tickets about it",
            String(device.tickets.length).padStart(2, "0"),
            "bg-action text-on-action",
          ],
        ].map(([name, value, tint]) => (
          <div key={name} className={`lift rounded-card px-4.5 py-4 ${tint}`}>
            <div className="font-mono text-xs">{name}</div>
            <div className="font-dot text-[36px] leading-[44px] font-bold text-ink">{value}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-start gap-6">
        <div className="flex min-w-0 flex-[999_1_480px] flex-col gap-8">
          <section aria-label="Repair history" className="flex flex-col gap-3">
            <h2 className="text-[19px] leading-[26px] font-medium tracking-[-0.01em]">
              Repair history
            </h2>
            {device.maintenance.length === 0 ? (
              <p className="rounded-card bg-surface px-6 py-5 text-ink-3">
                No repairs logged for this device.
              </p>
            ) : (
              <div className="overflow-x-auto rounded-card bg-surface p-2">
                <table className="w-full min-w-[640px] border-collapse text-left">
                  <thead>
                    <tr className="text-sm text-ink-3">
                      <th scope="col" className="px-4 py-3 font-normal">
                        Date
                      </th>
                      <th scope="col" className="px-4 py-3 font-normal">
                        What was done
                      </th>
                      <th scope="col" className="px-4 py-3 font-normal">
                        By
                      </th>
                      <th scope="col" className="px-4 py-3 font-normal">
                        Ticket
                      </th>
                      <th scope="col" className="px-4 py-3 text-right font-normal">
                        Cost
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {device.maintenance.map((entry) => (
                      <tr key={entry.id} className="align-top">
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          {formatDate(entry.performed_at)}
                        </td>
                        <td className="px-4 py-3.5">
                          {entry.action}
                          {entry.parts && (
                            <span className="block text-sm text-ink-3">Parts: {entry.parts}</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">{entry.performed_by_name}</td>
                        <td className="px-4 py-3.5 font-mono text-sm whitespace-nowrap">
                          {entry.ticket_id ? (
                            <Link href={`/tickets/${entry.ticket_id}`} className="text-accent">
                              {entry.ticket_ref}
                            </Link>
                          ) : (
                            ""
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-right tabular-nums">
                          {entry.cost ? formatNaira(entry.cost) : ""}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section aria-label="Who has had it" className="flex flex-col gap-3">
            <h2 className="text-[19px] leading-[26px] font-medium tracking-[-0.01em]">
              Who has had it
            </h2>
            {device.assignments.length === 0 ? (
              <p className="rounded-card bg-surface px-6 py-5 text-ink-3">
                This device has not been given to anyone yet.
              </p>
            ) : (
              <ol className="flex flex-col gap-3.5 rounded-card bg-surface px-6 py-5">
                {device.assignments.map((entry) => (
                  <li key={entry.id} className="flex flex-wrap justify-between gap-2">
                    <span>
                      {entry.employee_name}
                      {entry.condition_note && (
                        <span className="block text-sm text-ink-3">
                          Returned: {entry.condition_note}
                        </span>
                      )}
                    </span>
                    <span className="text-ink-3">
                      {entry.returned_at
                        ? `${formatDate(entry.assigned_at)} to ${formatDate(entry.returned_at)}`
                        : `Since ${formatDate(entry.assigned_at)}`}
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </section>

          {device.tickets.length > 0 && (
            <section aria-label="Tickets" className="flex flex-col gap-3">
              <h2 className="text-[19px] leading-[26px] font-medium tracking-[-0.01em]">
                Tickets about this device
              </h2>
              <ul className="flex flex-col gap-3.5 rounded-card bg-surface px-6 py-5">
                {device.tickets.map((ticket) => (
                  <li key={ticket.id} className="flex flex-wrap items-center justify-between gap-2">
                    <Link href={`/tickets/${ticket.id}`} className="min-w-0">
                      <span className="font-mono text-sm text-ink-3">{ticket.ref}</span>{" "}
                      {ticket.title}
                    </Link>
                    <Pill value={ticket.status} />
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {!isStaff && device.holder_id === me.id && <ChangeRequestForm device={device} />}
        {isStaff && (
          <aside aria-label="Actions" className="min-w-0 flex-[1_1_340px]">
            <DeviceActions device={device} people={people} isAdmin={me.role === "admin"} />
          </aside>
        )}
      </div>
    </>
  )
}
