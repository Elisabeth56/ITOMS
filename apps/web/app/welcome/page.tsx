import { Logo } from "@/components/logo"
import { SetPasswordForm } from "./form"

export const metadata = { title: "Set your password" }

export default function WelcomePage() {
  return (
    <main className="flex min-h-dvh items-center justify-center px-6 py-12">
      <div className="flex w-full max-w-[420px] flex-col gap-6">
        <Logo size={40} />
        <h1 className="text-[44px] leading-[48px] font-medium tracking-[-0.025em]">
          Choose a password.
        </h1>
        <SetPasswordForm />
      </div>
    </main>
  )
}
