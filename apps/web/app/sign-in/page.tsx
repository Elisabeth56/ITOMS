import { AssetTag } from "@/components/asset-tag"
import { SignInForm } from "./form"

export const metadata = { title: "Sign in" }

export default function SignInPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center px-6 py-12">
      <div className="flex w-full max-w-[420px] flex-col gap-6">
        <div className="self-start">
          <AssetTag tag="ITOMS" />
        </div>
        <h1 className="text-[44px] leading-[48px] font-medium tracking-[-0.025em]">
          Sign in to get help from IT.
        </h1>
        <SignInForm />
        <p className="text-ink-3">
          Accounts are created by the IT team. If you do not have one yet, ask them to invite you.
        </p>
      </div>
    </main>
  )
}
