import Link from "next/link"
import type { ReactNode } from "react"

/**
 * The asset sticker: dashed outline, punched hole, tag in mono. Used wherever a device
 * appears. `flip` plays the hand-over animation once.
 */
export function AssetTag({
  tag,
  detail,
  href,
  flip = false,
  onSurface = false,
  children,
}: {
  tag: string
  detail?: string
  href?: string
  flip?: boolean
  onSurface?: boolean
  children?: ReactNode
}) {
  const className = `flex items-center gap-3.5 rounded-tag border-[1.5px] border-dashed border-hairline px-4 py-3.5 ${
    onSurface ? "bg-ground" : "bg-surface"
  } ${flip ? "tag-flip" : ""}`
  const content = (
    <>
      <span
        aria-hidden
        className={`size-3 flex-none rounded-full border-[1.5px] border-hairline ${onSurface ? "bg-surface" : "bg-ground"}`}
      />
      <span className="min-w-0 flex-1">
        <span className="block font-mono font-medium tracking-wide">{tag}</span>
        {detail && <span className="block text-sm text-ink-3">{detail}</span>}
      </span>
      {children}
    </>
  )
  return href ? (
    <Link href={href} className={`${className} transition-colors duration-200 hover:border-accent`}>
      {content}
    </Link>
  ) : (
    <div className={className}>{content}</div>
  )
}
