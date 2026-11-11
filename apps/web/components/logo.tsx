// The ITOMS mark is an asset tag: a punched hole on the left and a dot grid whose lit
// dots draw a tick. Tagged, then fixed. app/icon.svg is the same drawing.

const columns = [15, 20.5, 26]
const rows = [8.5, 13.5, 18.5, 23.5]
const lit = new Set(["15,18.5", "20.5,23.5", "26,13.5", "26,8.5"])

export function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden className="flex-none">
      <rect width="32" height="32" rx="9" className="fill-accent dark:fill-deep" />
      <circle cx="8" cy="16" r="3.2" className="fill-ground" />
      {columns.flatMap((x) =>
        rows.map((y) => (
          <circle
            key={`${x},${y}`}
            cx={x}
            cy={y}
            r="1.7"
            className={lit.has(`${x},${y}`) ? "fill-signal" : "fill-dim-dot"}
          />
        )),
      )}
    </svg>
  )
}

/** Mark and wordmark. `light` is for navy surfaces. */
export function Logo({ size = 28, light = false }: { size?: number; light?: boolean }) {
  return (
    <span
      className={`inline-flex items-center font-medium tracking-[-0.02em] ${light ? "text-on-accent dark:text-ink" : "text-ink"}`}
      style={{ gap: size * 0.36, fontSize: size * 0.68 }}
    >
      <LogoMark size={size} />
      itoms
    </span>
  )
}
