"use client"

import { useActionState, useState, useTransition } from "react"
import type { Asset } from "@itoms/shared"
import { FormError } from "@/components/form-error"
import { Button } from "@/components/ui/button"
import { Field, TextArea } from "@/components/ui/field"
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

export function NewTicketForm({ devices }: { devices: Asset[] }) {
  const [state, action, sending] = useActionState(createTicket, {})
  const [category, setCategory] = useState("")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [quickFix, setQuickFix] = useState<QuickFix>({})
  const [asking, startAsking] = useTransition()

  const canAsk = category !== "" && title.trim().length >= 3
  const ask = () =>
    startAsking(async () => setQuickFix(await suggestFix({ title, description, category })))
  const suggestion = quickFix.suggestion

  return (
    <form action={action} className="mx-auto flex w-full max-w-[680px] flex-col gap-7">
      <h1 className="text-[44px] leading-[48px] font-medium tracking-[-0.025em]">
        What do you need help with?
      </h1>

      <fieldset className="flex flex-col gap-2.5">
        <legend className="mb-2.5 font-medium">It is about</legend>
        <div className="flex flex-wrap gap-2">
          {categories.map(([value, text]) => (
            <label
              key={value}
              className={`flex min-h-11 cursor-pointer items-center gap-2 rounded-full px-4 transition-colors duration-200 ${
                category === value ? "bg-accent text-on-accent" : "bg-surface"
              }`}
            >
              <input
                type="radio"
                name="category"
                value={value}
                required
                checked={category === value}
                onChange={() => setCategory(value)}
                className="accent-action"
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
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        errors={state.fields?.title}
        style={{ background: "var(--color-surface)" }}
      />
      <TextArea
        label="Anything IT should know"
        name="description"
        hint="When it started, what you already tried, how urgent it is for you."
        required
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        errors={state.fields?.description}
        style={{ background: "var(--color-surface)" }}
      />

      <section
        aria-label="Quick fix"
        aria-live="polite"
        className="flex flex-col gap-4 rounded-card bg-sunken p-6"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 className="text-[19px] leading-[26px] font-medium tracking-[-0.01em]">
            {suggestion?.can_help ? "A quick fix to try first" : "Want a quick fix to try first?"}
          </h2>
          <span className="text-sm text-ink-2">Optional · suggested by AI, so it can be wrong</span>
        </div>

        {!suggestion && (
          <>
            <p className="text-ink-2">
              Some problems have a simple first step. Your description is sent to an AI assistant,
              so leave out passwords.
            </p>
            <Button
              type="button"
              variant="quiet"
              onClick={ask}
              disabled={!canAsk || asking}
              className="self-start"
            >
              {asking ? "Thinking" : "Suggest a quick fix"}
            </Button>
          </>
        )}
        {quickFix.error && <p className="text-ink-2">{quickFix.error}</p>}

        {suggestion && (
          <>
            <p>{suggestion.summary}</p>
            {suggestion.can_help ? (
              <>
                <ol className="flex list-decimal flex-col gap-2 pl-6">
                  {suggestion.steps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
                <div className="flex flex-wrap items-center gap-3">
                  <Button type="button" onClick={() => markSolved(suggestion.id)}>
                    That fixed it
                  </Button>
                  <span className="text-ink-2">
                    Still stuck? Carry on and send it to IT. They will see you tried this.
                  </span>
                </div>
              </>
            ) : (
              <p className="text-ink-2">
                Send the request below and the IT team will take it from here.
              </p>
            )}
            <input type="hidden" name="suggestion_id" value={suggestion.id} />
          </>
        )}
      </section>

      {devices.length > 0 && (
        <fieldset className="flex flex-col">
          <legend className="mb-2.5 font-medium">Which device?</legend>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3">
            {devices.map((device) => (
              <label
                key={device.id}
                className="flex cursor-pointer items-center gap-3 rounded-tag border-[1.5px] border-dashed border-hairline bg-surface px-4 py-3.5 has-checked:border-solid has-checked:border-accent"
              >
                <input
                  type="radio"
                  name="asset_id"
                  value={device.id}
                  className="size-[18px] accent-accent"
                />
                <span>
                  <span className="block font-mono font-medium tracking-wide">
                    {device.asset_tag}
                  </span>
                  <span className="block text-sm text-ink-3">
                    {[device.brand, device.model].filter(Boolean).join(" ")}
                  </span>
                </span>
              </label>
            ))}
            <label className="flex cursor-pointer items-center gap-3 rounded-tag border-[1.5px] border-dashed border-hairline bg-surface px-4 py-3.5 has-checked:border-solid has-checked:border-accent">
              <input
                type="radio"
                name="asset_id"
                value=""
                defaultChecked
                className="size-[18px] accent-accent"
              />
              <span>
                <span className="block font-medium">Not sure, or another device</span>
                <span className="block text-sm text-ink-3">IT will work it out</span>
              </span>
            </label>
          </div>
        </fieldset>
      )}

      <FormError message={state.error} />
      <Button variant="strong" disabled={sending} className="min-h-12 self-start px-7">
        {sending ? "Sending" : "Send to IT"}
      </Button>
    </form>
  )
}
