import Image from "next/image"
import Link from "next/link"
import { AssetTag } from "@/components/asset-tag"
import { Logo } from "@/components/logo"
import { Pill } from "@/components/ui/pill"
import { DemoButtons } from "./demo-buttons"
import { SignInForm } from "./form"

export const metadata = { title: "Sign in" }

export default function SignInPage() {
  return (
    <div className="flex min-h-dvh flex-col gap-4 p-3 lg:flex-row lg:p-4">
      <main className="flex flex-1 flex-col px-4 py-6 sm:px-8">
        <Link href="/" aria-label="ITOMS home" className="self-start">
          <Logo />
        </Link>
        <div className="my-auto flex w-full max-w-[420px] flex-col gap-6 py-12">
          <div>
            <span className="tick font-dot text-[28px] font-bold text-signal">HELLO</span>
            <h1 className="rise mt-2 text-[40px] leading-[44px] font-medium tracking-[-0.03em]">
              Sign in to ITOMS
            </h1>
            <p className="mt-1.5 text-ink-2">Use the email your IT admin invited.</p>
          </div>
          <SignInForm />
          <p className="text-[13px] text-ink-3">
            No account? Accounts are created by your IT admin.
          </p>
          <div className="flex flex-col gap-3 rounded-card bg-butter px-4 py-4 text-sm text-on-butter">
            <span className="font-medium text-ink">Try the demo</span>
            <span>
              Sign in as one of the seeded people. The administrator can look around but not change
              anything.
            </span>
            <DemoButtons />
          </div>
        </div>
      </main>
      <aside className="relative hidden min-h-[640px] flex-1 overflow-hidden rounded-panel bg-sunken lg:block">
        <Image
          src="/images/shelf.webp"
          alt="A shelf of labelled laptops and monitors"
          fill
          sizes="50vw"
          loading="eager"
          className="object-cover"
        />
        <div className="absolute top-14 left-10 -rotate-3">
          <div className="bob">
            <AssetTag tag="LT-0058" detail="New ThinkPad" type="laptop" status="in_stock" big />
          </div>
        </div>
        <div className="absolute right-10 bottom-12 max-w-[320px] rounded-panel bg-deep p-6 text-on-deep">
          <Pill value="tag" tone="active" text="Every device is tagged" />
          <p className="mt-3 text-xl leading-[26px] tracking-[-0.01em] text-on-accent dark:text-ink">
            Its holders, repairs and tickets stay with the tag.
          </p>
        </div>
      </aside>
    </div>
  )
}
