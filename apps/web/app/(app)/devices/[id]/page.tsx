import Link from "next/link"
import { notFound } from "next/navigation"
import { hasRole, type AssetDetail, type Person } from "@itoms/shared"
import { Pill } from "@/components/ui/pill"
import { api, ApiError, getMe } from "@/lib/api"
import { formatDate, formatNaira, label } from "@/lib/format"
import { DeviceActions } from "./actions-panel"

export const metadata = { title: "Device" }

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
      <div className="flex flex-wrap items-stretch gap-6">
        {/* keyed on the holder so the tag flips when the device changes hands */}
        <div
          key={device.holder_id ?? "nobody"}
          className="tag-flip flex min-w-0 flex-[1_1_320px] flex-col justify-between gap-5 rounded-card border-[1.5px] border-dashed border-hairline bg-surface p-7"
        >
          <div className="flex items-center gap-4">
            <span
              aria-hidden
              className="size-5 flex-none rounded-full border-[1.5px] border-hairline bg-ground"
            />
            <h1 className="font-mono text-[40px] leading-[48px] font-medium break-all">
              {device.asset_tag}
            </h1>
          </div>
          <div>
            <p className="text-[19px] leading-[26px] font-medium tracking-[-0.01em]">
              {[device.brand, device.model].filter(Boolean).join(" ") || label(device.type)}
            </p>
            <p className="text-ink-3">
              {label(device.type)}
              {device.holder_name
                ? ` · held by ${device.holder_name}`
                : device.location
                  ? ` · ${device.location}`
                  : ""}
            </p>
          </div>
          <span className="self-start">
            <Pill value={device.status} />
          </span>
        </div>

        <dl className="grid min-w-0 flex-[999_1_420px] grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-6 rounded-card bg-surface p-7">
          <div>
            <dt className="text-sm text-ink-3">Serial number</dt>
            <dd className="font-mono">{device.serial_number ?? "Not recorded"}</dd>
          </div>
          <div>
            <dt className="text-sm text-ink-3">Bought</dt>
            <dd>{device.purchase_date ? formatDate(device.purchase_date) : "Not recorded"}</dd>
          </div>
          <div>
            <dt className="text-sm text-ink-3">Location</dt>
            <dd>{device.location ?? "Not recorded"}</dd>
          </div>
          <div>
            <dt className="text-sm text-ink-3">Repairs logged</dt>
            <dd className="tabular-nums">{device.maintenance.length}</dd>
          </div>
          <div>
            <dt className="text-sm text-ink-3">Spent on repairs</dt>
            <dd className="tabular-nums">{formatNaira(spent)}</dd>
          </div>
          <div>
            <dt className="text-sm text-ink-3">Tickets</dt>
            <dd className="tabular-nums">{device.tickets.length}</dd>
          </div>
        </dl>
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

        {isStaff && (
          <aside aria-label="Actions" className="min-w-0 flex-[1_1_340px]">
            <DeviceActions device={device} people={people} isAdmin={me.role === "admin"} />
          </aside>
        )}
      </div>
    </>
  )
}
