import Link from "next/link"
import type { ComponentProps } from "react"

const base =
  "lift inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 font-medium transition-opacity duration-200 hover:opacity-90 disabled:opacity-50"
const variants = {
  /** the one primary action per view */
  strong: "bg-accent text-on-accent",
  /** a dark pill for actions on light marketing surfaces */
  ink: "bg-ink text-surface",
  /** the bright call to action on navy surfaces */
  signal: "bg-signal-strong text-white",
  action: "bg-action text-on-action",
  light: "bg-surface text-ink",
  quiet: "border-[1.5px] border-hairline text-ink",
  danger: "bg-urgent-tint text-urgent",
}
type Variant = keyof typeof variants

/** A keyboard hint shown inside a button. */
export function Kbd({ children }: { children: string }) {
  return <span className="font-mono text-[11px] opacity-75">{children}</span>
}

export function Button({
  variant = "action",
  className = "",
  ...props
}: ComponentProps<"button"> & { variant?: Variant }) {
  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />
}

export function ButtonLink({
  variant = "action",
  className = "",
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant }) {
  return <Link className={`${base} ${variants[variant]} ${className}`} {...props} />
}
