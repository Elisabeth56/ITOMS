"use client"

import { useRouter } from "next/navigation"
import { useEffect, useRef, useState, useTransition } from "react"
import type { SearchResults } from "@itoms/shared"
import { search } from "@/lib/search"
import { label } from "@/lib/format"
import { Icon } from "./icons"

type Hit = { href: string; code: string; text: string; kind: string }

function toHits(results: SearchResults): Hit[] {
  return [
    ...results.tickets.map((t) => ({
      href: `/tickets/${t.id}`,
      code: t.ref,
      text: t.title,
      kind: "Ticket",
    })),
    ...results.devices.map((d) => ({
      href: `/devices/${d.id}`,
      code: d.asset_tag,
      text: [d.name, d.holder_name].filter(Boolean).join(" · "),
      kind: "Device",
    })),
    ...results.people.map((p) => ({
      href: "/people",
      code: "",
      text: `${p.full_name} · ${p.email}`,
      kind: label(p.role),
    })),
  ]
}

/** True when a key press belongs to a text field. */
function typing(target: EventTarget | null) {
  return !!(target as HTMLElement | null)?.closest("input, textarea, select, [contenteditable]")
}

/**
 * Cmd/Ctrl+K (or the sidebar's Search) opens a search over tickets, devices and people.
 * Arrow keys move, Enter opens, Esc closes. N anywhere starts a new request.
 */
export function CommandPalette() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [hits, setHits] = useState<Hit[]>([])
  const [active, setActive] = useState(0)
  const [, startSearch] = useTransition()
  const input = useRef<HTMLInputElement>(null)

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault()
        setOpen((value) => !value)
      } else if (
        event.key.toLowerCase() === "n" &&
        !typing(event.target) &&
        !event.metaKey &&
        !event.ctrlKey
      ) {
        event.preventDefault()
        router.push("/tickets/new")
      }
    }
    const show = () => setOpen(true)
    window.addEventListener("keydown", onKey)
    window.addEventListener("itoms:search", show)
    return () => {
      window.removeEventListener("keydown", onKey)
      window.removeEventListener("itoms:search", show)
    }
  }, [router])

  useEffect(() => {
    if (open) input.current?.focus()
  }, [open])

  const change = (value: string) => {
    setQuery(value)
    setActive(0)
    if (value.trim().length < 2) return setHits([])
    startSearch(async () => setHits(toHits(await search(value.trim()))))
  }
  const go = (hit: Hit | undefined) => {
    if (!hit) return
    setOpen(false)
    setQuery("")
    setHits([])
    router.push(hit.href)
  }

  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-deep/40 px-4 pt-[14vh]"
      onClick={() => setOpen(false)}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Find anything"
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-[560px] rounded-card bg-surface p-2 shadow-[0_8px_32px_rgb(0_0_0/0.25)]"
      >
        <div className="flex items-center gap-2.5 px-3 py-2 text-ink-3">
          <Icon name="search" />
          <input
            ref={input}
            value={query}
            onChange={(event) => change(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape") setOpen(false)
              if (event.key === "ArrowDown") setActive((i) => Math.min(i + 1, hits.length - 1))
              if (event.key === "ArrowUp") setActive((i) => Math.max(i - 1, 0))
              if (event.key === "Enter") go(hits[active])
            }}
            aria-label="Find a ticket, device or person"
            placeholder="Find a ticket, device or person"
            className="min-h-10 flex-1 bg-transparent text-ink outline-none placeholder:text-ink-3"
          />
          <span className="rounded-md border border-hairline px-1.5 py-0.5 font-mono text-[11px]">
            Esc
          </span>
        </div>
        {hits.length > 0 && (
          <ul role="listbox" className="flex flex-col gap-0.5 border-t border-hairline pt-1.5">
            {hits.map((hit, i) => (
              <li
                key={hit.href + hit.text}
                role="option"
                aria-selected={i === active}
                onMouseEnter={() => setActive(i)}
                onClick={() => go(hit)}
                className={`flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 ${i === active ? "bg-action text-on-action" : ""}`}
              >
                <span className="w-20 flex-none font-dot font-bold">{hit.code}</span>
                <span className="min-w-0 flex-1 truncate text-sm">{hit.text}</span>
                <span className="text-xs opacity-80">{hit.kind}</span>
              </li>
            ))}
          </ul>
        )}
        {query.trim().length >= 2 && hits.length === 0 && (
          <p className="border-t border-hairline px-3 pt-3 pb-2 text-sm text-ink-3">
            Nothing matches that yet.
          </p>
        )}
      </div>
    </div>
  )
}
