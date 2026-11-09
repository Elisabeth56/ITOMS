"use client"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import type { ReactNode } from "react"
import { Logo } from "./logo"

export type SidebarLink = {
  href: string
  label: string
  icon: ReactNode
  count?: number
  alert?: boolean
}

// filters that turn the ticket list into its own sidebar section
const sectionFilters = ["late", "escalated"]

function isActive(href: string, pathname: string, search: URLSearchParams) {
  const url = new URL(href, "http://local")
  if (pathname !== url.pathname && !pathname.startsWith(`${url.pathname}/`)) return false
  const wanted = [...url.searchParams]
  if (wanted.length) return wanted.every(([key, value]) => search.get(key) === value)
  return !sectionFilters.some((key) => search.get(key))
}

/** The navy role sidebar. On a phone it becomes a scrolling row above the page. */
export function Sidebar({ links, footer }: { links: SidebarLink[]; footer: ReactNode }) {
  const pathname = usePathname()
  const search = useSearchParams()
  return (
    <nav
      aria-label="Main"
      className="relative flex flex-col gap-1 overflow-hidden rounded-panel bg-deep p-3 text-on-deep md:sticky md:top-4 md:min-h-[calc(100vh-32px)] md:p-4"
    >
      <Link href="/home" className="px-2.5 pt-1 pb-4" aria-label="ITOMS home">
        <Logo light />
      </Link>
      <div className="flex gap-1 overflow-x-auto md:flex-col">
        {links.map((link) => {
          const active = isActive(link.href, pathname, search)
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={active ? "page" : undefined}
              className={`flex min-h-11 flex-none items-center gap-2.5 rounded-xl px-3 text-sm whitespace-nowrap transition-colors duration-200 ${
                active ? "bg-action text-on-action" : "hover:bg-white/10"
              }`}
            >
              {link.icon}
              {link.label}
              {link.count !== undefined && link.count > 0 && (
                <span
                  className={`ml-auto rounded-full px-2 font-mono text-[11px] ${link.alert ? "bg-signal-strong text-white" : ""}`}
                >
                  {link.count}
                </span>
              )}
            </Link>
          )
        })}
      </div>
      <div className="mt-auto hidden md:block">{footer}</div>
    </nav>
  )
}
