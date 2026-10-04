import Link from "next/link"
import type { ComponentProps } from "react"

const base =
  "inline-flex min-h-11 items-center justify-center rounded-full px-5 font-medium transition-opacity duration-200 hover:opacity-85 disabled:opacity-50"
const variants = {
  action: "bg-action text-on-action",
  strong: "bg-accent text-on-accent",
  quiet: "border-[1.5px] border-hairline text-ink",
}
type Variant = keyof typeof variants

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
