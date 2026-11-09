import { Suspense, type ReactNode } from "react"
import { hasRole, type Dashboard } from "@itoms/shared"
import { CommandPalette } from "@/components/command-palette"
import { Icon } from "@/components/icons"
import { Sidebar, type SidebarLink } from "@/components/sidebar"
import { api, getMe, type Me } from "@/lib/api"
import { signOut } from "../sign-in/actions"

type Counts = Pick<Dashboard, "tickets" | "change_requests"> | null

function linksFor(me: Me, counts: Counts): SidebarLink[] {
  if (me.role === "employee") {
    return [
      { href: "/home", label: "Home", icon: <Icon name="home" /> },
      { href: "/tickets/new", label: "Get help", icon: <Icon name="plus" /> },
      { href: "/tickets", label: "My tickets", icon: <Icon name="list" /> },
      { href: "/my-devices", label: "My devices", icon: <Icon name="device" /> },
      { href: "/profile", label: "Profile", icon: <Icon name="user" /> },
    ]
  }
  const shared: SidebarLink[] = [
    { href: "/tickets", label: "Queue", icon: <Icon name="list" />, count: counts?.tickets.open },
    { href: "/devices", label: "Devices", icon: <Icon name="device" /> },
    {
      href: "/change-requests",
      label: "Change requests",
      icon: <Icon name="check" />,
      count: counts?.change_requests.pending,
    },
    { href: "/people", label: "People", icon: <Icon name="people" /> },
    { href: "/profile", label: "Profile", icon: <Icon name="user" /> },
  ]
  if (me.role === "admin") {
    return [
      { href: "/home", label: "Overview", icon: <Icon name="grid" /> },
      {
        href: "/tickets?escalated=true",
        label: "Escalated",
        icon: <Icon name="up" />,
        count: counts?.tickets.escalated,
        alert: true,
      },
      ...shared,
    ]
  }
  return [
    shared[0]!,
    {
      href: "/tickets?late=true",
      label: "Late",
      icon: <Icon name="clock" />,
      count: counts?.tickets.late,
      alert: true,
    },
    ...shared.slice(1),
  ]
}

export default async function AppLayout({ children }: { children: ReactNode }) {
  const me = await getMe()
  // the sidebar's counts are a nicety: a failed request leaves them blank, not the page
  const counts: Counts = hasRole(me.role, "it_staff")
    ? await api<Dashboard>("/dashboard").catch(() => null)
    : null
  const initials = me.full_name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")

  const footer = (
    <div className="flex items-center gap-2.5 border-t border-white/15 px-1.5 pt-3">
      <span className="flex size-9 flex-none items-center justify-center rounded-xl bg-butter text-xs font-medium text-on-butter">
        {initials}
      </span>
      <span className="min-w-0 flex-1 text-[13px] leading-tight">
        <span className="block truncate text-on-accent dark:text-ink">{me.full_name}</span>
        <form action={signOut}>
          <button className="underline-offset-4 hover:underline">Sign out</button>
        </form>
      </span>
    </div>
  )

  return (
    <div className="flex flex-col gap-4 p-3 md:flex-row md:p-4">
      <div className="md:w-[248px] md:flex-none">
        <Suspense>
          <Sidebar links={linksFor(me, counts)} footer={footer} />
        </Suspense>
      </div>
      <main className="min-w-0 flex-1 px-1 pt-4 pb-12 md:px-6">
        <div className="mx-auto flex max-w-[1080px] flex-col gap-8">
          {me.is_demo && me.role === "admin" && (
            <p className="rounded-card bg-butter px-4 py-3 text-sm text-on-butter">
              You are in the demo as an administrator. You can look at everything, but changes are
              switched off.
            </p>
          )}
          {children}
        </div>
      </main>
      <CommandPalette />
    </div>
  )
}
