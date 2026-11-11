"use client"

import { Button } from "@/components/ui/button"

export default function AppError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div
      role="alert"
      className="flex flex-col items-start gap-3 rounded-panel bg-peach p-10 text-on-peach"
    >
      <span className="font-dot text-[40px] leading-[44px] font-bold">ERR</span>
      <h1 className="text-2xl font-medium tracking-[-0.02em] text-ink">
        This page didn&apos;t load
      </h1>
      <p>Nothing you entered was lost. Try again, and tell IT if it keeps happening.</p>
      <Button variant="ink" onClick={reset}>
        Try again
      </Button>
    </div>
  )
}
