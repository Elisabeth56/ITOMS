import type { ReactNode } from "react"

/** An empty list that says what belongs here and offers the first step. */
export function Empty({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col items-start gap-3 rounded-card border-[1.5px] border-dashed border-hairline px-6 py-8">
      <p className="text-lg font-medium">{title}</p>
      {children}
    </div>
  )
}
