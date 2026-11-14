// The IT queue's filters. A plain module so both the server page and the client filter
// pills can import it: a list exported from a "use client" file reaches server code only
// as a client reference, not as the array.
export const queueFilters = [
  { key: "all", label: "All open" },
  { key: "unassigned", label: "Unassigned" },
  { key: "mine", label: "Mine" },
  { key: "late", label: "Late" },
] as const
export type QueueFilter = (typeof queueFilters)[number]["key"]
