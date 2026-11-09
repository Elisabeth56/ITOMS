import { hasRole, type MyAsset, type Person } from "@itoms/shared"
import { AssetTag } from "@/components/asset-tag"
import { DotField } from "@/components/dot-field"
import { api } from "@/lib/api"
import { deviceLine, formatDate, label } from "@/lib/format"
import { DetailsForm, ResetPassword, ThemePicker } from "./forms"

export const metadata = { title: "Profile" }

const card = "flex flex-col gap-3 rounded-card bg-surface p-6"

export default async function ProfilePage() {
  const me = await api<Person>("/me")
  const devices = await api<MyAsset[]>("/assets/mine")
  const initials = me.full_name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")

  return (
    <>
      <div className="relative flex flex-wrap items-center gap-6 overflow-hidden rounded-panel bg-sage p-8 text-on-sage">
        <div className="absolute top-6 right-6 hidden sm:block">
          <DotField
            cols={8}
            rows={4}
            pitch={16}
            lit={["0,2", "1,3", "2,2", "3,1", "4,0"]}
            on="fill-on-sage"
            off="fill-on-sage/15"
          />
        </div>
        <span className="flex size-22 items-center justify-center rounded-[28px] bg-butter text-3xl font-medium text-on-butter">
          {initials}
        </span>
        <div>
          <h1 className="rise text-[36px] leading-10 font-medium tracking-[-0.025em] text-ink">
            {me.full_name}
          </h1>
          <p className="mt-1.5">
            {[me.department, label(me.role), `since ${formatDate(me.created_at)}`]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-start gap-4">
        <section className={`${card} flex-[1_1_420px]`}>
          <h2 className="text-lg font-medium">Your details</h2>
          <DetailsForm fullName={me.full_name} department={me.department} />
          <p className="text-sm text-ink-3">
            Email: {me.email}.{" "}
            {hasRole(me.role, "admin") ? "" : "Your role is set by an administrator."}
          </p>
        </section>
        <div className="flex flex-[1_1_360px] flex-col gap-4">
          <section className={card}>
            <h2 className="text-lg font-medium">Appearance</h2>
            <ThemePicker />
          </section>
          <section className={`${card} bg-action text-on-action`}>
            <h2 className="text-lg font-medium text-ink">Password</h2>
            <p className="text-sm">We will email you a link to choose a new one.</p>
            <ResetPassword />
          </section>
          <section className={card}>
            <h2 className="text-lg font-medium">Devices in your name</h2>
            {devices.length === 0 ? (
              <p className="text-ink-3">None right now.</p>
            ) : (
              <div className="flex flex-wrap gap-2.5">
                {devices.map((device) => (
                  <AssetTag
                    key={device.id}
                    href={`/devices/${device.id}`}
                    tag={device.asset_tag}
                    detail={deviceLine(device)}
                    type={device.type}
                    status={device.status}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  )
}
