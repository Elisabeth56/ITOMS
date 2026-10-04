/** Shown while a page loads: the shape of a headline and a few cards. */
export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Loading" className="flex animate-pulse flex-col gap-8">
      <div className="h-24 max-w-[420px] rounded-card bg-sunken" />
      <div className="flex flex-col gap-3">
        <div className="h-24 rounded-card bg-surface" />
        <div className="h-24 rounded-card bg-surface" />
        <div className="h-24 rounded-card bg-surface" />
      </div>
    </div>
  )
}
