import { Logo } from "@/components/logo"
import { ForgotForm } from "./form"

export const metadata = { title: "Forgot password" }

export default function ForgotPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center px-6 py-12">
      <div className="flex w-full max-w-[420px] flex-col gap-6">
        <Logo size={40} />
        <h1 className="text-[44px] leading-[48px] font-medium tracking-[-0.025em]">
          Forgot your password?
        </h1>
        <ForgotForm />
      </div>
    </main>
  )
}
