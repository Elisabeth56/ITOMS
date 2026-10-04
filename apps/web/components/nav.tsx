"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

/** The pill navigation. The current section is filled with the accent. */
export function Nav({ links }: { links: { href: string; label: string }[] }) {
  const pathname = usePathname()
  return (
    <nav
      aria-label="Main"
      className="order-last flex basis-full flex-wrap gap-1 rounded-[26px] bg-surface p-1 sm:order-none sm:basis-auto"
    >
      {links.map((link) => {
        const active = pathname === link.href || pathname.startsWith(`${link.href}/`)
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={`rounded-full px-[18px] py-2.5 transition-colors duration-200 ${
              active ? "bg-accent font-medium text-on-accent" : "text-ink-2 hover:text-ink"
            }`}
          >
            {link.label}
          </Link>
        )
      })}
    </nav>
  )
}
