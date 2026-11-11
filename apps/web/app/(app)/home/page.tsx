import { redirect } from "next/navigation"
import { getMe } from "@/lib/api"
import { AdminOverview } from "./admin-overview"
import { EmployeeHome } from "./employee-home"

/** Each role lands on its own home: IT staff on the queue. */
export default async function Home() {
  const me = await getMe()
  if (me.role === "it_staff") redirect("/tickets")
  return me.role === "admin" ? (
    <AdminOverview name={me.full_name} />
  ) : (
    <EmployeeHome name={me.full_name} />
  )
}
