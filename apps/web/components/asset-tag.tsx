import Link from "next/link"
import type { ReactNode } from "react"

// each device type has its own tag colour, so a list of tags reads at a glance
const plates: Record<string, string> = {
  laptop: "bg-action",
  desktop: "bg-action",
  phone: "bg-action",
  printer: "bg-butter",
  monitor: "bg-sage",
  network_device: "bg-peach",
}
const dots: Record<string, string> = {
  in_stock: "bg-accent",
  assigned: "bg-ok",
  in_use: "bg-ok",
  under_repair: "bg-signal",
  retired: "bg-ink-3",
}

/**
 * The asset tag: a coloured plate with a punched hole, the tag number in dot-matrix and
 * one line of detail. Used wherever a device appears. `flip` plays the hand-over motion.
 */
export function AssetTag({
  tag,
  detail,
  type = "other",
  status,
  href,
  flip = false,
  big = false,
  children,
}: {
  tag: string
  detail?: string
  type?: string
  status?: string
  href?: string
  flip?: boolean
  big?: boolean
  children?: ReactNode
}) {
  const className = `relative inline-flex items-center gap-4 rounded-tag py-3.5 pr-5 pl-8 text-ink ${plates[type] ?? "bg-surface"} ${flip ? "tag-flip" : ""}`
  const content = (
    <>
      <span
        aria-hidden
        className="absolute top-1/2 left-2.5 -mt-[5px] size-2.5 rounded-full bg-ground"
      />
      {status && (
        <span
          aria-hidden
          className={`pulse-dot size-2 flex-none rounded-full ${dots[status] ?? "bg-ink-3"}`}
        />
      )}
      <span
        className={`tick font-dot font-bold tracking-[0.04em] whitespace-nowrap ${big ? "text-[30px] leading-[34px] sm:text-[40px] sm:leading-[44px]" : "text-[26px] leading-[30px]"}`}
      >
        {tag}
      </span>
      {detail && <span className="min-w-0 font-mono text-xs leading-4 text-ink-2">{detail}</span>}
      {children}
    </>
  )
  return href ? (
    <Link href={href} className={`${className} lift`}>
      {content}
    </Link>
  ) : (
    <div className={className}>{content}</div>
  )
}
