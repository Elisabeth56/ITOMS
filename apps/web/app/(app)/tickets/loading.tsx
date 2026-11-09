/** Rows shaped like the real list, shimmering while it loads. */
export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Loading" className="flex flex-col gap-8">
      <div className="shimmer h-10 w-48 rounded-xl" />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="shimmer h-24 rounded-card" />
        ))}
      </div>
      <div className="overflow-hidden rounded-card bg-surface">
        {[260, 200, 300, 180, 240].map((width) => (
          <div
            key={width}
            className="flex items-center gap-4 border-t border-hairline p-4 first:border-0"
          >
            <span className="shimmer h-3 w-14 rounded-md" />
            <span className="shimmer h-3 flex-1 rounded-md" style={{ maxWidth: width }} />
            <span className="shimmer h-5 w-18 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  )
}
