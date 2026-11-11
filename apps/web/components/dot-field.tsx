// A dot-matrix graphic: a grid of dim dots with some lit, echoing the logo's tick.
// Used on banners and panels; purely decorative.

/** The tick from the logo, drawn across a wide grid. */
const tick = ["2,4", "3,5", "4,4", "5,3", "6,2", "7,1", "8,0", "11,2", "12,3"]

export function DotField({
  cols = 14,
  rows = 6,
  pitch = 20,
  lit = tick,
  on = "fill-signal",
  off = "fill-white/15",
}: {
  cols?: number
  rows?: number
  pitch?: number
  lit?: string[]
  on?: string
  off?: string
}) {
  const litSet = new Set(lit)
  return (
    <svg
      aria-hidden
      width={cols * pitch}
      height={rows * pitch}
      viewBox={`0 0 ${cols * pitch} ${rows * pitch}`}
    >
      {Array.from({ length: cols }, (_, c) =>
        Array.from({ length: rows }, (_, r) => (
          <circle
            key={`${c},${r}`}
            cx={c * pitch + pitch / 2}
            cy={r * pitch + pitch / 2}
            r={pitch * 0.17}
            className={litSet.has(`${c},${r}`) ? on : off}
          />
        )),
      )}
    </svg>
  )
}

/** The navy greeting banner at the top of each role's home. */
export function Banner({
  date,
  title,
  subtitle,
  action,
}: {
  date: string
  title: string
  subtitle: string
  action?: React.ReactNode
}) {
  return (
    <div className="relative flex flex-wrap items-end justify-between gap-6 overflow-hidden rounded-panel bg-deep p-7 text-on-deep sm:p-9">
      <div className="absolute -top-5 -right-5 hidden sm:block">
        <DotField />
      </div>
      <div className="relative">
        <span className="font-mono text-xs">{date}</span>
        <h1 className="rise mt-2 text-[34px] leading-[38px] font-medium tracking-[-0.03em] text-on-accent sm:text-[40px] sm:leading-[44px] dark:text-ink">
          {title}
        </h1>
        <p className="rise mt-1.5" style={{ animationDelay: "100ms" }}>
          {subtitle}
        </p>
      </div>
      {action && <div className="relative">{action}</div>}
    </div>
  )
}
