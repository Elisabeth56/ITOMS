import type { Metadata } from "next"
import Image from "next/image"
import type { ReactNode } from "react"
import { AssetTag } from "@/components/asset-tag"
import { SiteFooter } from "@/components/site/site-footer"
import { SiteNav } from "@/components/site/site-nav"
import { ButtonLink, Kbd } from "@/components/ui/button"

export const metadata: Metadata = {
  title: { absolute: "ITOMS · Every device, every fix, on record" },
}

const ticker = [
  { tag: "IT-0118", text: "Printer offline", tint: "bg-butter" },
  { tag: "LT-0042", text: "ThinkPad T14 · Adaeze", tint: "bg-action" },
  { tag: "IT-0117", text: "Wi-Fi keeps dropping", tint: "bg-peach" },
  { tag: "MN-0019", text: "Dell P2422H · in stock", tint: "bg-sage" },
  { tag: "IT-0121", text: "Excel freezes", tint: "bg-action" },
  { tag: "PR-0007", text: "LaserJet · 2nd floor", tint: "bg-butter" },
]

const steps = [
  {
    n: "01",
    title: "Describe it",
    text: "Pick what it is about and say what is wrong in one line. Your devices are already listed, so you choose one instead of typing a serial number.",
    tint: "bg-action text-on-action",
  },
  {
    n: "02",
    title: "Try the quick fix",
    text: "For everyday problems, the assistant suggests a few safe first steps. Anything risky goes straight to IT. Skip it whenever you like.",
    tint: "bg-butter text-on-butter",
  },
  {
    n: "03",
    title: "IT picks it up",
    text: "The request lands in one queue, ordered by due time. Follow every change until it is fixed, then confirm or reopen it.",
    tint: "bg-sage text-on-sage",
  },
]

const history = [
  { date: "12 Oct", what: "Assigned to Adaeze Okafor", detail: "by Chidi Eze" },
  { date: "3 Sep", what: "Keyboard replaced", detail: "₦18,500 · IT-0087" },
  { date: "14 Aug", what: "Returned by Tunde Bello", detail: "Screen scratched on the left" },
  { date: "2 Feb", what: "Registered", detail: "Bought new" },
]

const roles = [
  {
    badge: "Get help",
    title: "For employees",
    text: "Report a problem in under a minute, see where it stands, and keep track of the devices in your name.",
    tint: "bg-butter text-on-butter",
  },
  {
    badge: "Next ticket",
    title: "For IT staff",
    text: "One queue sorted by due time, shortcuts for everything, and each device's history beside the ticket.",
    tint: "bg-action text-on-action",
  },
  {
    badge: "Needs you",
    title: "For administrators",
    text: "See what is late or escalated, approve device changes, and decide who can do what.",
    tint: "bg-sage text-on-sage",
  },
]

const shortcuts = [
  { keys: "⌘K", text: "Find any ticket, device or person" },
  { keys: "J / K", text: "Move through a list" },
  { keys: "Enter", text: "Open" },
  { keys: "E", text: "Escalate" },
  { keys: "N", text: "New request" },
  { keys: "A", text: "Assign to me" },
]

/** A rounded photo that zooms slightly on hover, with an optional caption card. */
function Media({
  src,
  alt,
  className,
  hero = false,
  children,
}: {
  src: string
  alt: string
  className: string
  hero?: boolean
  children?: ReactNode
}) {
  return (
    <div className={`zoom-media relative overflow-hidden rounded-panel bg-sunken ${className}`}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        className="object-cover"
        // the hero photo is above the fold, so it loads straight away
        loading={hero ? "eager" : "lazy"}
        fetchPriority={hero ? "high" : "auto"}
      />
      {children}
    </div>
  )
}

function Caption({ title, text }: { title: string; text: string }) {
  return (
    <span className="absolute right-5 bottom-5 left-5 max-w-[320px] rounded-card bg-surface px-4 py-3">
      <span className="block font-medium">{title}</span>
      <span className="block text-sm text-ink-2">{text}</span>
    </span>
  )
}

const sectionTitle =
  "text-[40px] leading-[42px] font-medium tracking-[-0.035em] sm:text-[52px] sm:leading-[54px]"

export default function Landing() {
  return (
    <>
      <SiteNav />

      <section className="mx-auto flex max-w-[1200px] flex-wrap items-center gap-12 px-6 pt-16 pb-16 sm:px-8 sm:pt-20">
        <div className="flex flex-[1_1_420px] flex-col gap-6">
          <span className="rise inline-flex items-center gap-2 self-start rounded-full bg-butter px-3.5 py-1.5 text-[13px] text-on-butter">
            <span aria-hidden className="pulse-dot size-[7px] rounded-full bg-signal-strong" />
            Quick fix suggestions, by AI
          </span>
          <h1
            className="rise max-w-[11ch] text-[52px] leading-[52px] font-medium tracking-[-0.04em] sm:text-[76px] sm:leading-[72px]"
            style={{ animationDelay: "100ms" }}
          >
            Every device, every fix, <span className="text-accent">on record.</span>
          </h1>
          <p
            className="rise max-w-[44ch] text-[19px] leading-[29px] text-ink-2"
            style={{ animationDelay: "200ms" }}
          >
            ITOMS is the IT desk for a small office. People report a problem in under a minute, IT
            works one calm queue, and every laptop and printer keeps its own history.
          </p>
          <div className="rise flex flex-wrap gap-3" style={{ animationDelay: "300ms" }}>
            <ButtonLink href="/sign-in" variant="ink">
              Get help <Kbd>N</Kbd>
            </ButtonLink>
            <ButtonLink href="/sign-in" variant="quiet">
              See the IT view
            </ButtonLink>
          </div>
        </div>

        <div className="relative min-h-[420px] flex-[1_1_440px] sm:min-h-[540px]">
          <div className="absolute inset-0">
            <Media
              src="/images/laptop.webp"
              alt="A closed laptop with an asset tag sticker on a desk in soft light"
              className="h-full"
              hero
            />
          </div>
          <div className="absolute top-10 -left-2 -rotate-[4deg] sm:-left-7">
            <div className="bob">
              <AssetTag tag="LT-0042" detail="ThinkPad T14" type="laptop" status="assigned" big />
            </div>
          </div>
          <div className="absolute right-2 bottom-28 rotate-[3deg] sm:-right-4">
            <div className="bob-slow">
              <AssetTag tag="PR-0007" detail="LaserJet M404" type="printer" status="under_repair" />
            </div>
          </div>
          <div className="absolute bottom-6 left-6 flex items-center gap-3.5 rounded-card bg-deep px-4.5 py-3.5 text-on-deep">
            <span className="tick font-dot text-[26px] font-bold text-on-accent dark:text-ink">
              IT-0118
            </span>
            <span className="text-[13px] leading-tight">
              Printer offline
              <br />
              Chidi is on it
            </span>
          </div>
        </div>
      </section>

      <div aria-hidden className="overflow-hidden bg-deep py-4">
        <div className="marquee flex w-max">
          {[...ticker, ...ticker].map((item, i) => (
            <span
              key={i}
              className={`mr-3 inline-flex items-center gap-2.5 rounded-full px-4 py-2 whitespace-nowrap text-ink ${item.tint}`}
            >
              <span className="font-dot text-lg font-bold">{item.tag}</span>
              <span className="text-[13px]">{item.text}</span>
            </span>
          ))}
        </div>
      </div>

      <section
        id="how"
        className="mx-auto flex max-w-[1200px] flex-col gap-12 px-6 pt-28 pb-24 sm:px-8"
      >
        <h2 className={`${sectionTitle} max-w-[16ch]`}>
          From "it's broken" to fixed, in three steps.
        </h2>
        <div className="flex flex-wrap gap-4">
          {steps.map((step) => (
            <div
              key={step.n}
              className={`lift flex min-h-[300px] flex-[1_1_300px] flex-col gap-3.5 rounded-panel p-8 ${step.tint}`}
            >
              <span className="font-dot text-[64px] leading-[64px] font-bold text-ink">
                {step.n}
              </span>
              <h3 className="mt-auto text-2xl font-medium tracking-[-0.02em] text-ink">
                {step.title}
              </h3>
              <p className="max-w-[34ch]">{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section
        id="handles"
        className="mx-auto flex max-w-[1200px] flex-col gap-10 px-6 py-12 sm:px-8"
      >
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h2 className={`${sectionTitle} max-w-[14ch]`}>What lands on the IT desk.</h2>
          <p className="max-w-[40ch] text-ink-2">
            The requests a 50-person office actually sends: printers, Wi-Fi, software, accounts and
            new starters.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Media
            src="/images/printer.webp"
            alt="An office printer on a cabinet by a window"
            className="h-[420px] md:col-span-2"
          >
            <Caption
              title="Printers and paper jams"
              text="The most common request. Most start with a safe quick fix."
            />
          </Media>
          <Media
            src="/images/switch.webp"
            alt="A network switch with blue cables and status lights"
            className="h-[420px]"
          >
            <Caption title="Wi-Fi and network" text="Office-wide outages skip the quick fix." />
          </Media>
          <Media
            src="/images/repair.webp"
            alt="Hands opening the back of a laptop with a screwdriver"
            className="h-[420px]"
          >
            <Caption title="Repairs, with costs" text="Logged in naira against the device." />
          </Media>
          <div className="lift flex min-h-[356px] flex-col justify-between gap-6 rounded-panel bg-peach p-8 text-on-peach">
            <DotTick />
            <div>
              <h3 className="text-2xl font-medium tracking-[-0.02em] text-ink">
                Accounts and access
              </h3>
              <p className="mt-1.5">
                Locked out, new starter, shared drive. Always handled by a person, never the
                assistant.
              </p>
            </div>
          </div>
          <div className="lift flex min-h-[356px] flex-col justify-between gap-6 rounded-panel bg-action p-8 text-on-action">
            <AssetTag
              tag="LT-0058"
              detail="For Kemi, starts Monday"
              type="desktop"
              status="in_stock"
            />
            <div>
              <h3 className="text-2xl font-medium tracking-[-0.02em] text-ink">New setups</h3>
              <p className="mt-1.5">
                Assign a device, note its condition, and its history starts there.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1200px] px-6 py-12 sm:px-8">
        <div className="flex flex-wrap items-center gap-12 rounded-hero bg-sage p-8 sm:p-14">
          <div className="flex flex-[1_1_380px] flex-col gap-4">
            <h2 className={`${sectionTitle} max-w-[13ch]`}>Each device remembers everything.</h2>
            <p className="max-w-[42ch] text-on-sage">
              Who held it, what broke, what the repair cost and which ticket it came from. When
              someone reports a problem with LT-0042, IT sees the whole story beside the request.
            </p>
          </div>
          <div className="flex flex-[1_1_440px] flex-col gap-4 rounded-panel bg-surface p-7">
            <AssetTag
              tag="LT-0042"
              detail="ThinkPad T14 · Adaeze Okafor"
              type="laptop"
              status="assigned"
            />
            <ul>
              {history.map((entry) => (
                <li key={entry.date} className="flex gap-4 border-t border-hairline py-3.5">
                  <span className="w-14 flex-none pt-0.5 font-mono text-xs text-ink-3">
                    {entry.date}
                  </span>
                  <span>
                    {entry.what}
                    <span className="block text-sm text-ink-3">{entry.detail}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1200px] px-6 py-12 sm:px-8">
        <Media
          src="/images/office.webp"
          alt="Colleagues working at desks in a bright Lagos office"
          className="h-[560px]"
        >
          <div className="absolute right-6 bottom-6 left-6 max-w-[520px] rounded-panel bg-surface p-7 sm:right-auto sm:bottom-8 sm:left-8">
            <h2 className="text-[32px] leading-9 font-medium tracking-[-0.025em]">
              Designed from a real IT desk.
            </h2>
            <p className="mt-2.5 text-ink-2">
              Built from what I saw doing IT support for a 50-person office in Lagos: the same
              printers, the same Wi-Fi, the same &ldquo;can you come and look?&rdquo;
            </p>
          </div>
        </Media>
      </section>

      <section
        id="roles"
        className="mx-auto flex max-w-[1200px] flex-col gap-10 px-6 py-12 sm:px-8"
      >
        <h2 className={sectionTitle}>One desk, three views.</h2>
        <div className="flex flex-wrap gap-4">
          {roles.map((role) => (
            <div
              key={role.title}
              className={`lift flex min-h-[240px] flex-[1_1_300px] flex-col gap-2.5 rounded-panel p-8 ${role.tint}`}
            >
              <span className="self-start rounded-full border border-current px-2.5 py-0.5 font-mono text-xs">
                {role.badge}
              </span>
              <h3 className="mt-auto text-2xl font-medium tracking-[-0.02em] text-ink">
                {role.title}
              </h3>
              <p>{role.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="keys" className="mx-auto max-w-[1200px] px-6 pt-12 pb-28 sm:px-8">
        <div className="flex flex-wrap items-center gap-10 rounded-hero bg-accent p-8 sm:p-14 dark:bg-deep">
          <div className="flex-[1_1_320px]">
            <h2 className={`${sectionTitle} max-w-[10ch] text-on-accent dark:text-ink`}>
              Built for the keyboard.
            </h2>
            <p className="mt-3 max-w-[34ch] text-on-deep">
              IT staff can work the whole queue without touching the mouse.
            </p>
          </div>
          <div className="flex flex-[2_1_520px] flex-wrap gap-x-8 gap-y-4">
            {shortcuts.map((shortcut) => (
              <div key={shortcut.keys} className="flex min-w-[260px] items-center gap-3.5">
                <span className="rounded-[10px] bg-white/10 px-2.5 py-1 font-dot text-[22px] font-bold text-on-accent dark:text-ink">
                  {shortcut.keys}
                </span>
                <span className="text-[15px] text-on-deep">{shortcut.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </>
  )
}

/** The logo's dot-matrix tick, drawn large. */
function DotTick() {
  const lit = new Set(["0,4", "1,3", "2,2", "3,3", "4,4", "5,3", "6,2", "7,1", "8,0"])
  return (
    <svg aria-hidden width="198" height="110" viewBox="0 0 198 110">
      {Array.from({ length: 9 }, (_, c) =>
        Array.from({ length: 5 }, (_, r) => (
          <circle
            key={`${c},${r}`}
            cx={c * 22 + 11}
            cy={r * 22 + 11}
            r="5"
            className={lit.has(`${c},${r}`) ? "fill-signal" : "fill-on-peach/15"}
          />
        )),
      )}
    </svg>
  )
}
