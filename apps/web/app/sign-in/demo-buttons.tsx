"use client"

import { useTransition } from "react"
import { signInDemo } from "./actions"

const roles = [
  ["employee", "Employee", "bg-action text-on-action"],
  ["it_staff", "IT staff", "bg-sage text-on-sage"],
  ["admin", "Admin, read-only", "bg-peach text-on-peach"],
] as const

/** Signs straight into a seeded demo account, so reviewers never need an invite. */
export function DemoButtons() {
  const [pending, start] = useTransition()
  return (
    <div className="flex flex-wrap gap-2">
      {roles.map(([role, text, tint]) => (
        <button
          key={role}
          type="button"
          disabled={pending}
          onClick={() => start(async () => void (await signInDemo(role)))}
          className={`lift min-h-11 rounded-full px-4 text-sm font-medium disabled:opacity-60 ${tint}`}
        >
          {text}
        </button>
      ))}
    </div>
  )
}
