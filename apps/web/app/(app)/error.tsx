"use client"

import { Button } from "@/components/ui/button"

export default function AppError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-col items-start gap-5">
      <h1 className="text-[28px] leading-[34px] font-medium tracking-[-0.02em]">
        Something went wrong on our side.
      </h1>
      <p className="text-ink-3">
        Nothing you entered was lost. Try again, and tell IT if it keeps happening.
      </p>
      <Button onClick={reset}>Try again</Button>
    </div>
  )
}
