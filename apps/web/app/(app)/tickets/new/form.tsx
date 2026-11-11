"use client"

import { useActionState, useEffect, useState, useTransition } from "react"
import type { Asset } from "@itoms/shared"
import { DotField } from "@/components/dot-field"
import { FormError } from "@/components/form-error"
import { Button, Kbd } from "@/components/ui/button"
import { Field, TextArea } from "@/components/ui/field"
import { deviceLine } from "@/lib/format"
import { createTicket, markSolved, suggestFix, type QuickFix } from "../actions"

// what an employee calls each category
const categories = [
  ["new_setup", "A new computer or setup"],
  ["hardware", "Computer or hardware"],
  ["printer", "Printer"],
  ["network", "Wi-Fi or internet"],
  ["software", "Software"],
  ["account", "Password or account"],
  ["other", "Something else"],
] as const

const plates: Record<string, string> = {
  printer: "bg-butter",
  monitor: "bg-sage",
  network_device: "bg-peach",
}
const draftKey = "itoms:new-ticket-draft"

type Draft = { category: string; title: string; description: string }

/** Remembers what was typed, so leaving the page by accident loses nothing. */
function useDraft() {
  const [draft, setDraft] = useState<Draft>({ category: "", title: "", description: "" })
  useEffect(() => {
    try {
      const saved = localStorage.getItem(draftKey)
      if (saved) setDraft(JSON.parse(saved))
    } catch {
      // storage can be unavailable (private mode); the form still works
    }
  }, [])
  const update = (change: Partial<Draft>) =>
    setDraft((current) => {
      const next = { ...current, ...change }
      try {
        localStorage.setItem(draftKey, JSON.stringify(next))
      } catch {
        // storage can be unavailable; nothing else depends on it
      }
      return next
    })
  return [draft, update] as const
}

export function NewTicketForm({ devices }: { devices: Asset[] }) {
  const [state, action, sending] = useActionState(
    async (...args: Parameters<typeof createTicket>) => {
      // a sent request no longer needs its draft
      try {
        localStorage.removeItem(draftKey)
      } catch {
        // storage can be unavailable; nothing else depends on it
      }
      return createTicket(...args)
    },
    {},
  )
  const [draft, update] = useDraft()
  const [quickFix, setQuickFix] = useState<QuickFix>({})
  const [asking, startAsking] = useTransition()

  const canAsk = draft.category !== "" && draft.title.trim().length >= 3
  const ask = () => startAsking(async () => setQuickFix(await suggestFix(draft)))
  const suggestion = quickFix.suggestion

  return (
    <form action={action} className="flex w-full max-w-[760px] flex-col gap-7">
      <div>
        <h1 className="rise text-[36px] leading-10 font-medium tracking-[-0.025em]">
          What do you need help with?
        </h1>
        <p className="mt-1.5 text-ink-2">Takes under a minute. What you type is saved as you go.</p>
      </div>

      <fieldset className="flex flex-col gap-2.5">
        <legend className="mb-2.5 font-medium">It is about</legend>
        <div className="flex flex-wrap gap-2">
          {categories.map(([value, text]) => (
            <label
              key={value}
              className={`lift flex min-h-11 cursor-pointer items-center gap-2 rounded-full px-4 text-sm transition-colors duration-200 ${
                draft.category === value ? "bg-accent text-on-accent" : "bg-surface"
              }`}
            >
              <input
                type="radio"
                name="category"
                value={value}
                required
                checked={draft.category === value}
                onChange={() => update({ category: value })}
                className="accent-signal"
              />
              {text}
            </label>
          ))}
        </div>
        {state.fields?.category && <p className="text-sm text-urgent">Choose what it is about.</p>}
      </fieldset>

      <Field
        label="In one line, what is wrong?"
        name="title"
        required
        maxLength={150}
        value={draft.title}
        onChange={(event) => update({ title: event.target.value })}
        errors={state.fields?.title}
      />
      <TextArea
        label="Anything IT should know"
        name="description"
        hint="When it started, what you already tried, how urgent it is for you."
        required
        value={draft.description}
        onChange={(event) => update({ description: event.target.value })}
        onKeyDown={(event) => {
          if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
            event.currentTarget.form?.requestSubmit()
          }
        }}
        errors={state.fields?.description}
      />

      <section
        aria-label="Quick fix"
        aria-live="polite"
        className="relative flex flex-col gap-3.5 overflow-hidden rounded-panel bg-action p-7 text-on-action"
      >
        <div className="absolute top-5 right-5 hidden sm:block">
          <DotField
            cols={6}
            rows={3}
            pitch={14}
            lit={["0,1", "1,2", "2,1", "3,0"]}
            on="fill-accent"
            off="fill-on-action/15"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full border border-current px-2.5 py-0.5 font-mono text-xs">
            Quick fix · AI
          </span>
          <span className="text-[13px]">Optional, and it can be wrong</span>
        </div>

        {!suggestion && (
          <>
            <h2 className="text-2xl font-medium tracking-[-0.02em] text-ink">
              Want a quick fix to try first?
            </h2>
            <p className="max-w-[56ch]">
              Some problems have a safe first step. Your description goes to an AI assistant, so
              leave out passwords.
            </p>
            <Button
              type="button"
              variant="light"
              onClick={ask}
              disabled={!canAsk || asking}
              className="self-start"
            >
              {asking ? "Thinking" : "Suggest a quick fix"}
            </Button>
          </>
        )}
        {quickFix.error && <p>{quickFix.error}</p>}

        {suggestion && (
          <>
            <h2 className="text-2xl font-medium tracking-[-0.02em] text-ink">
              {suggestion.can_help ? "Try this first." : "This one is for IT."}
            </h2>
            <p className="max-w-[56ch]">{suggestion.summary}</p>
            {suggestion.can_help ? (
              <>
                <ol className="flex list-decimal flex-col gap-2 pl-6 text-ink">
                  {suggestion.steps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
                <div className="flex flex-wrap items-center gap-3">
                  <Button type="button" variant="strong" onClick={() => markSolved(suggestion.id)}>
                    That fixed it
                  </Button>
                  <span className="text-sm">
                    Still stuck? Send it to IT below. They will see you tried this.
                  </span>
                </div>
              </>
            ) : (
              <p>Send the request below and the IT team will take it from here.</p>
            )}
            <input type="hidden" name="suggestion_id" value={suggestion.id} />
          </>
        )}
      </section>

      {devices.length > 0 && (
        <fieldset>
          <legend className="mb-2.5 font-medium">Which device?</legend>
          <div className="flex flex-wrap gap-2.5">
            {devices.map((device) => (
              <label
                key={device.id}
                className={`lift relative flex min-h-14 cursor-pointer items-center gap-3 rounded-tag py-3 pr-4 pl-8 outline-offset-2 has-checked:outline-2 has-checked:outline-accent ${plates[device.type] ?? "bg-action"}`}
              >
                <span
                  aria-hidden
                  className="absolute top-1/2 left-2.5 -mt-[5px] size-2.5 rounded-full bg-ground"
                />
                <input type="radio" name="asset_id" value={device.id} className="accent-accent" />
                <span>
                  <span className="block font-dot text-lg font-bold">{device.asset_tag}</span>
                  <span className="block font-mono text-xs text-ink-2">{deviceLine(device)}</span>
                </span>
              </label>
            ))}
            <label className="flex min-h-14 cursor-pointer items-center gap-3 rounded-tag border-[1.5px] border-dashed border-hairline px-4 text-sm text-ink-2">
              <input
                type="radio"
                name="asset_id"
                value=""
                defaultChecked
                className="accent-accent"
              />
              Not sure, or another device
            </label>
          </div>
        </fieldset>
      )}

      <FormError message={state.error} />
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="strong" disabled={sending} className="min-h-12 px-7">
          {sending ? "Sending" : "Send to IT"} <Kbd>⌘↵</Kbd>
        </Button>
      </div>
    </form>
  )
}
