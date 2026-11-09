import Link from "next/link"
import { Logo } from "@/components/logo"
import { ButtonLink } from "@/components/ui/button"

const repo = "https://github.com/Elisabeth56/ITOMS"
const columns = [
  {
    title: "Product",
    links: [
      { label: "How it works", href: "/#how" },
      { label: "What it handles", href: "/#handles" },
      { label: "Shortcuts", href: "/#keys" },
      { label: "Sign in", href: "/sign-in" },
    ],
  },
  {
    title: "Project",
    links: [
      { label: "Source code", href: repo },
      { label: "Architecture", href: `${repo}/blob/main/docs/architecture.md` },
      { label: "Decision records", href: `${repo}/tree/main/docs/decisions` },
    ],
  },
  {
    title: "Contact",
    links: [
      { label: "hello@elisabethnnamani.dev", href: "mailto:hello@elisabethnnamani.dev" },
      { label: "LinkedIn", href: "https://linkedin.com/in/elisabethnnamani" },
      { label: "X", href: "https://x.com/elisynthdev" },
    ],
  },
]

/** A link whose text rolls up to a copy of itself on hover. */
function RollLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="roll text-[15px] text-on-accent dark:text-ink">
      <span>
        <span>{label}</span>
        <span aria-hidden>{label}</span>
      </span>
    </Link>
  )
}

/**
 * The signature footer: a floating navy card with rolling links and a giant wordmark
 * whose letters turn dot-matrix under the cursor.
 */
export function SiteFooter() {
  return (
    <footer className="px-4 pb-4">
      <div className="mx-auto max-w-[1408px] overflow-hidden rounded-hero bg-deep px-6 pt-12 text-on-deep sm:px-12">
        <div className="flex flex-wrap justify-between gap-10">
          <div className="flex max-w-[360px] flex-[1_1_280px] flex-col gap-4">
            <Logo light />
            <p>The IT desk for a small office. Every device, every fix, on record.</p>
            <div>
              <ButtonLink href="/sign-in" variant="signal">
                Get help
              </ButtonLink>
            </div>
          </div>
          <div className="flex flex-[2_1_520px] flex-wrap gap-8">
            {columns.map((column) => (
              <div key={column.title} className="flex flex-[1_1_160px] flex-col gap-2">
                <span className="mb-1.5 font-mono text-xs">{column.title}</span>
                {column.links.map((link) => (
                  <RollLink key={link.label} {...link} />
                ))}
              </div>
            ))}
          </div>
        </div>
        <p
          aria-label="ITOMS"
          className="wordmark mt-14 flex justify-between text-[clamp(96px,22vw,320px)] leading-[0.8] font-medium tracking-[-0.05em] whitespace-nowrap text-on-accent select-none dark:text-ink"
        >
          {"ITOMS".split("").map((letter, i) => (
            <span key={i} aria-hidden>
              {letter}
            </span>
          ))}
        </p>
        <div className="flex flex-wrap justify-between gap-3 border-t border-white/15 pt-5 pb-6 text-[13px]">
          <span>Made in Lagos by Elisabeth Nnamani</span>
          <span className="hidden sm:inline">Hover the letters</span>
        </div>
      </div>
    </footer>
  )
}
