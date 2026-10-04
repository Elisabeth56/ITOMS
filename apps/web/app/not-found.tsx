import { ButtonLink } from "@/components/ui/button"

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-start justify-center gap-5 px-6 mx-auto max-w-[560px]">
      <h1 className="text-[44px] leading-[48px] font-medium tracking-[-0.025em]">
        That page is not here.
      </h1>
      <p className="text-ink-3">It may have been moved, or you may not have access to it.</p>
      <ButtonLink href="/">Go to the start</ButtonLink>
    </main>
  )
}
