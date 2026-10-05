import Link from "next/link"
import type { ReactNode } from "react"
import { hasRole } from "@itoms/shared"
import { Logo } from "@/components/logo"
import { Nav } from "@/components/nav"
import { getMe } from "@/lib/api"
import { signOut } from "../sign-in/actions"

const employeeLinks = [
  { href: "/tickets", label: "My requests" },
  { href: "/my-devices", label: "My devices" },
]
const staffLinks = [
  { href: "/today", label: "Today" },
  { href: "/tickets", label: "Tickets" },
  { href: "/devices", label: "Devices" },
  { href: "/people", label: "People" },
]

export default async function AppLayout({ children }: { children: ReactNode }) {
  const me = await getMe()
  const links = hasRole(me.role, "it_staff") ? staffLinks : employeeLinks

  return (
    <div className="px-5 pt-5 pb-12 sm:px-8">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <Link href="/" aria-label="ITOMS home">
            <Logo />
          </Link>
          <Nav links={links} />
          <form action={signOut} className="flex items-center gap-3">
            <span className="text-ink-2">{me.full_name}</span>
            <button className="min-h-11 rounded-full px-3 text-ink-3 underline-offset-4 hover:underline">
              Sign out
            </button>
          </form>
        </header>
        <main className="flex flex-col gap-8">{children}</main>
      </div>
    </div>
  )
}
