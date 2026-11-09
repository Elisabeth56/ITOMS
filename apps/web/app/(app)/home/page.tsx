import { redirect } from "next/navigation"
import { getMe } from "@/lib/api"
import { EmployeeHome } from "./employee-home"

/** Each role lands on its own home: IT staff on the queue, admins on the overview. */
export default async function Home() {
  const me = await getMe()
  if (me.role === "it_staff") redirect("/tickets")
  if (me.role === "admin") redirect("/today")
  return <EmployeeHome name={me.full_name} />
}
