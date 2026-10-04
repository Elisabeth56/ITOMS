import type { Person } from "@itoms/shared"
import { Pill } from "@/components/ui/pill"
import { api, requireStaff } from "@/lib/api"
import { InviteForm, PersonControls } from "./forms"

export const metadata = { title: "People" }

export default async function PeoplePage() {
  const me = await requireStaff()
  const people = await api<Person[]>("/users")
  const isAdmin = me.role === "admin"

  return (
    <>
      <h1 className="max-w-[18ch] text-[44px] leading-[48px] font-medium tracking-[-0.025em]">
        {people.length} people can sign in.
      </h1>
      <div className="flex flex-wrap items-start gap-6">
        <ul className="flex min-w-0 flex-[999_1_480px] flex-col gap-3">
          {people.map((person) => (
            <li
              key={person.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-card bg-surface px-6 py-5"
            >
              <div className="min-w-0">
                <p className="text-[19px] leading-[26px] font-medium tracking-[-0.01em]">
                  {person.full_name}
                </p>
                <p className="text-sm break-all text-ink-3">
                  {[person.department, person.email].filter(Boolean).join(" · ")}
                  {!person.is_active && " · access turned off"}
                </p>
              </div>
              {isAdmin ? <PersonControls person={person} /> : <Pill value={person.role} />}
            </li>
          ))}
        </ul>
        {isAdmin && (
          <aside className="min-w-0 flex-[1_1_320px]">
            <InviteForm />
          </aside>
        )}
      </div>
    </>
  )
}
