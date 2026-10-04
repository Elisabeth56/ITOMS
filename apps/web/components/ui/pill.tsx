import { label } from "@/lib/format"

const tones = {
  neutral: "bg-sunken text-ink",
  active: "bg-action text-on-action",
  urgent: "bg-urgent-tint text-urgent font-medium",
}

// which values stand out; everything else is neutral, and the word always carries the meaning
const toneFor: Record<string, keyof typeof tones> = {
  urgent: "urgent",
  under_repair: "urgent",
  in_progress: "active",
  assigned: "active",
}

/** A status, priority or device state, written out in words. */
export function Pill({ value, surface = false }: { value: string; surface?: boolean }) {
  const tone = toneFor[value] ?? "neutral"
  const neutral = surface ? "bg-surface text-ink" : tones.neutral
  return (
    <span
      className={`rounded-full px-3 py-1.5 text-sm whitespace-nowrap ${tone === "neutral" ? neutral : tones[tone]}`}
    >
      {label(value)}
    </span>
  )
}
