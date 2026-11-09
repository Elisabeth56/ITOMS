import { redirect } from "next/navigation"
import { getMe } from "@/lib/api"

/** Each role lands on its own home. */
export default async function Home() {
  const me = await getMe()
  if (me.role === "it_staff") redirect("/tickets")
  redirect(me.role === "admin" ? "/today" : "/tickets")
}
