/**
 * The ITOMS logo: an asset-sticker mark (rounded tag with its punched hole) and the
 * wordmark set in Unbounded. `size` is the mark's height in pixels.
 */
export function Logo({ size = 28 }: { size?: number }) {
  return (
    <span className="inline-flex items-center" style={{ gap: size * 0.36 }}>
      <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden className="flex-none">
        <rect width="32" height="32" rx="9" className="fill-accent" />
        <circle cx="10" cy="16" r="3" className="fill-ground" />
        <rect x="16" y="14.5" width="9" height="3" rx="1.5" className="fill-action" />
      </svg>
      <span
        className="font-logo leading-none font-semibold tracking-[-0.04em]"
        style={{ fontSize: size * 0.68 }}
      >
        ITOMS
      </span>
    </span>
  )
}
