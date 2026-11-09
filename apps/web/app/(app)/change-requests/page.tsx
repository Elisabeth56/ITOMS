import Link from "next/link"
import { changeRequestStatuses, type ChangeRequest } from "@itoms/shared"
import { ChangeRequestCard } from "@/components/change-request-card"
import { api, requireStaff } from "@/lib/api"
import { label } from "@/lib/format"

export const metadata = { title: "Change requests" }

export default async function ChangeRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  await requireStaff()
  const { status = "pending" } = await searchParams
  const requests = await api<ChangeRequest[]>(
    `/change-requests?status=${encodeURIComponent(status)}`,
  )

  return (
    <>
      <div>
        <h1 className="rise text-[36px] leading-10 font-medium tracking-[-0.025em]">
          Change requests
        </h1>
        <p className="mt-1.5 text-ink-2">
          Corrections people proposed to devices they hold. Nothing changes until you approve.
        </p>
      </div>
      <div className="inline-flex gap-0.5 self-start rounded-full bg-surface p-1">
        {changeRequestStatuses.map((value) => (
          <Link
            key={value}
            href={`/change-requests?status=${value}`}
            aria-current={status === value ? "true" : undefined}
            className={`flex min-h-9 items-center rounded-full px-3.5 text-sm no-underline ${
              status === value ? "bg-ink text-surface" : "text-ink-2 hover:bg-sunken"
            }`}
          >
            {label(value)}
          </Link>
        ))}
      </div>
      {requests.length === 0 ? (
        <div className="flex flex-col items-start gap-3 rounded-panel bg-sage p-10 text-on-sage">
          <span className="font-dot text-[72px] leading-[72px] font-bold">00</span>
          <h2 className="text-2xl font-medium tracking-[-0.02em] text-ink">
            {status === "pending" ? "Nothing to review" : `No ${status} requests yet`}
          </h2>
          <p>When someone corrects a device they hold, it shows up here.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {requests.map((request) => (
            <ChangeRequestCard key={request.id} request={request} />
          ))}
        </div>
      )}
    </>
  )
}
