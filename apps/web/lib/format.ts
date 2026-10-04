const relative = new Intl.RelativeTimeFormat("en", { numeric: "auto" })
const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
})
const naira = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
})

/** "20 minutes ago" for recent times, a date once it is more than a week old. */
export function timeAgo(iso: string) {
  const seconds = (new Date(iso).getTime() - Date.now()) / 1000
  const minutes = seconds / 60
  if (Math.abs(minutes) < 60) return relative.format(Math.round(minutes), "minute")
  const hours = minutes / 60
  if (Math.abs(hours) < 24) return relative.format(Math.round(hours), "hour")
  const days = hours / 24
  if (Math.abs(days) < 7) return relative.format(Math.round(days), "day")
  return dateFormat.format(new Date(iso))
}

export const formatDate = (iso: string) => dateFormat.format(new Date(iso))
export const formatNaira = (amount: number | string) => naira.format(Number(amount))

/** "in_progress" -> "In progress" */
export function label(value: string) {
  if (value === "it_staff") return "IT staff"
  const words = value.replaceAll("_", " ")
  return words.charAt(0).toUpperCase() + words.slice(1)
}

/** Hours as "1d 4h" or "5h", for the average time to fix. */
export function duration(hours: number | null) {
  if (hours === null) return "No data yet"
  const days = Math.floor(hours / 24)
  const rest = Math.round(hours % 24)
  return days ? `${days}d ${rest}h` : `${rest}h`
}

/** "HP LaserJet Pro M404 · 2nd floor" from the parts that are known. */
export function deviceLine(
  device: { brand: string | null; model: string | null },
  ...rest: (string | null)[]
) {
  const name = [device.brand, device.model].filter(Boolean).join(" ")
  return [name, ...rest].filter(Boolean).join(" · ")
}
