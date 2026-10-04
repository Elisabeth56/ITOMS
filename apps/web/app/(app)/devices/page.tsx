import Link from "next/link"
import { assetTypes, type Asset, type Page } from "@itoms/shared"
import { Empty } from "@/components/empty"
import { ButtonLink } from "@/components/ui/button"
import { Pill } from "@/components/ui/pill"
import { api, requireStaff } from "@/lib/api"
import { label } from "@/lib/format"

export const metadata = { title: "Devices" }

export default async function DevicesPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; q?: string; page?: string }>
}) {
  await requireStaff()
  const { type, q, page = "1" } = await searchParams
  const query = new URLSearchParams({ page })
  if (type) query.set("type", type)
  if (q) query.set("q", q)

  const [devices, bench] = await Promise.all([
    api<Page<Asset>>(`/assets?${query}`),
    api<Page<Asset>>("/assets?status=under_repair&page_size=1"),
  ])
  const pages = Math.ceil(devices.total / devices.page_size)
  const link = (next: Record<string, string | undefined>) => {
    const params = new URLSearchParams()
    for (const [key, value] of Object.entries({ type, q, ...next }))
      if (value) params.set(key, value)
    return `/devices?${params}`
  }

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="max-w-[18ch] text-[44px] leading-[48px] font-medium tracking-[-0.025em]">
          {devices.total} {devices.total === 1 ? "device" : "devices"}.{" "}
          {bench.total > 0 && `${bench.total} on the bench.`}
        </h1>
        <ButtonLink href="/devices/new">Add device</ButtonLink>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {[undefined, ...assetTypes].map((value) => (
            <Link
              key={value ?? "all"}
              href={link({ type: value, page: undefined })}
              className={`flex min-h-11 items-center rounded-full px-4 ${type === value ? "bg-ink text-surface" : "bg-surface text-ink"}`}
            >
              {value ? label(value) : "All"}
            </Link>
          ))}
        </div>
        <form className="max-w-[320px] flex-[1_1_240px]">
          {type && <input type="hidden" name="type" value={type} />}
          <label htmlFor="q" className="sr-only">
            Search devices
          </label>
          <input
            id="q"
            name="q"
            type="search"
            defaultValue={q}
            placeholder="Search by tag, serial or person"
            className="min-h-11 w-full rounded-full border-[1.5px] border-hairline bg-surface px-4 placeholder:text-ink-3"
          />
        </form>
      </div>

      {devices.items.length === 0 ? (
        <Empty title={q || type ? "No devices match that." : "No devices registered yet."}>
          <p className="text-ink-3">Add each device with the tag from its sticker.</p>
        </Empty>
      ) : (
        <section
          aria-label="Devices"
          className="grid grid-cols-[repeat(auto-fill,minmax(270px,1fr))] gap-3"
        >
          {devices.items.map((device) => (
            <Link
              key={device.id}
              href={`/devices/${device.id}`}
              className="flex flex-col gap-3.5 rounded-tag border-[1.5px] border-dashed border-hairline bg-surface px-5 py-[18px] transition-colors duration-200 hover:border-accent"
            >
              <span className="flex items-center gap-3">
                <span
                  aria-hidden
                  className="size-3 flex-none rounded-full border-[1.5px] border-hairline bg-ground"
                />
                <span className="font-mono font-medium tracking-wide">{device.asset_tag}</span>
              </span>
              <span>
                <span className="block">
                  {[device.brand, device.model].filter(Boolean).join(" ") || label(device.type)}
                </span>
                <span className="block text-sm text-ink-3">
                  {device.holder_name ?? device.location ?? "No location set"}
                </span>
              </span>
              <span className="self-start">
                <Pill value={device.status} />
              </span>
            </Link>
          ))}
        </section>
      )}

      {pages > 1 && (
        <div className="flex items-center gap-3">
          {devices.page > 1 && (
            <ButtonLink variant="quiet" href={link({ page: String(devices.page - 1) })}>
              Previous
            </ButtonLink>
          )}
          {devices.page < pages && (
            <ButtonLink variant="quiet" href={link({ page: String(devices.page + 1) })}>
              Next
            </ButtonLink>
          )}
          <span className="text-sm text-ink-3">
            Page {devices.page} of {pages}
          </span>
        </div>
      )}
    </>
  )
}
