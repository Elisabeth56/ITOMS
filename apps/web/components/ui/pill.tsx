import { label } from "@/lib/format"

const tones = {
  neutral: "bg-sunken text-ink-2",
  active: "bg-action text-on-action",
  urgent: "bg-urgent-tint text-urgent font-medium",
  ok: "bg-sage text-on-sage",
  butter: "bg-butter text-on-butter",
  peach: "bg-peach text-on-peach",
  light: "bg-surface text-ink",
}
export type Tone = keyof typeof tones

// which values stand out; everything else is neutral, and the word always carries the meaning
const toneFor: Record<string, Tone> = {
  urgent: "urgent",
  under_repair: "peach",
  in_progress: "active",
  assigned: "active",
  waiting: "butter",
  resolved: "ok",
  in_stock: "ok",
  pending: "butter",
  approved: "ok",
  rejected: "urgent",
  printer: "butter",
  software: "active",
  network: "peach",
  hardware: "peach",
  account: "ok",
}

/** A status, priority, category or device state, written out in words. */
export function Pill({ value, tone, text }: { value: string; tone?: Tone; text?: string }) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-[13px] leading-5 whitespace-nowrap ${tones[tone ?? toneFor[value] ?? "neutral"]}`}
    >
      {text ?? label(value)}
    </span>
  )
}
