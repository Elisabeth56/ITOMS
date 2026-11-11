"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { queueFilters, type QueueFilter } from "@/lib/queue"

const storageKey = "itoms:queue-filter"

/** The queue's filter pills. The last one used is remembered and restored next visit. */
export function QueueFilters({ current, chosen }: { current: QueueFilter; chosen: boolean }) {
  const router = useRouter()

  useEffect(() => {
    try {
      if (chosen) localStorage.setItem(storageKey, current)
      else {
        const saved = localStorage.getItem(storageKey)
        if (saved && saved !== "all" && queueFilters.some((filter) => filter.key === saved)) {
          router.replace(`/tickets?filter=${saved}`)
        }
      }
    } catch {
      // storage can be unavailable; the default filter still works
    }
  }, [current, chosen, router])

  return (
    <div
      role="group"
      aria-label="Filter"
      className="inline-flex flex-wrap gap-0.5 rounded-full bg-surface p-1"
    >
      {queueFilters.map((filter) => (
        <Link
          key={filter.key}
          href={`/tickets?filter=${filter.key}`}
          aria-current={current === filter.key ? "true" : undefined}
          className={`flex min-h-9 items-center rounded-full px-3.5 text-sm no-underline transition-colors duration-200 ${
            current === filter.key ? "bg-ink text-surface" : "text-ink-2 hover:bg-sunken"
          }`}
        >
          {filter.label}
        </Link>
      ))}
    </div>
  )
}
