import { redirect } from "next/navigation"
import { hasRole } from "@itoms/shared"
import { getMe } from "@/lib/api"

/** Home is the IT team's Today page, or an employee's own requests. */
export default async function Home() {
  const me = await getMe()
  redirect(hasRole(me.role, "it_staff") ? "/today" : "/tickets")
}
