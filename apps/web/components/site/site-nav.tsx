import Link from "next/link"
import { Logo } from "@/components/logo"
import { ButtonLink } from "@/components/ui/button"

const sections = [
  { href: "/#how", label: "How it works" },
  { href: "/#handles", label: "What it handles" },
  { href: "/#roles", label: "Who it's for" },
  { href: "/#keys", label: "Shortcuts" },
]

/** The floating pill navigation for the public pages. */
export function SiteNav() {
  return (
    <div className="sticky top-4 z-20 px-4 pt-4">
      <header className="mx-auto flex max-w-[1120px] items-center justify-between gap-3 rounded-full border border-hairline bg-surface py-2 pr-2 pl-5 shadow-[0_1px_2px_rgb(37_37_36/0.04),0_8px_24px_rgb(37_37_36/0.06)]">
        <Link href="/" aria-label="ITOMS home">
          <Logo />
        </Link>
        <nav aria-label="Site" className="hidden gap-0.5 lg:flex">
          {sections.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className="rounded-full px-3.5 py-2.5 text-sm text-ink-2 transition-colors duration-200 hover:bg-sunken hover:text-ink"
            >
              {section.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <ButtonLink href="/sign-in" variant="quiet" className="hidden sm:inline-flex">
            Sign in
          </ButtonLink>
          <ButtonLink href="/sign-in" variant="strong">
            Get help
          </ButtonLink>
        </div>
      </header>
    </div>
  )
}
