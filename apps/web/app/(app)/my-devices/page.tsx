import type { Asset } from "@itoms/shared"
import { AssetTag } from "@/components/asset-tag"
import { Empty } from "@/components/empty"
import { api } from "@/lib/api"

export const metadata = { title: "My devices" }

export default async function MyDevicesPage() {
  const devices = await api<Asset[]>("/assets/mine")
  return (
    <>
      <h1 className="max-w-[18ch] text-[44px] leading-[48px] font-medium tracking-[-0.025em]">
        Devices in your name.
      </h1>
      {devices.length === 0 ? (
        <Empty title="Nothing is assigned to you.">
          <p className="text-ink-3">
            When IT gives you a laptop or phone, it will show here with its tag.
          </p>
        </Empty>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(270px,1fr))] gap-3">
          {devices.map((device) => (
            <AssetTag
              key={device.id}
              href={`/devices/${device.id}`}
              tag={device.asset_tag}
              detail={[device.brand, device.model].filter(Boolean).join(" ")}
            />
          ))}
        </div>
      )}
    </>
  )
}
