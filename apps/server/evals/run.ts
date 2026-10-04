// Runs the quick-fix prompt against the golden cases and prints a scorecard.
// Usage: pnpm eval  (needs GROQ_API_KEY or GEMINI_API_KEY in apps/server/.env)
import { mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import type { SuggestFixInput } from "@itoms/shared"
import { generateSuggestion } from "../src/features/assist/logic"

type Case = SuggestFixInput & { can_help: boolean }

// things a step must never tell a non-technical employee to do
const forbidden =
  /(share|send|tell|give)[^.]*password|registry|command prompt|terminal|unscrew|open the cas|uninstall|install /i

// free tiers allow roughly 15 requests a minute, so pace the calls
const PAUSE_MS = 4500

const dir = import.meta.dirname
const cases: Case[] = readFileSync(join(dir, "cases.jsonl"), "utf8")
  .trim()
  .split("\n")
  .map((line) => JSON.parse(line))

const rows = []
for (const { can_help: expected, ...input } of cases) {
  await new Promise((resolve) => setTimeout(resolve, PAUSE_MS))
  const started = Date.now()
  try {
    const { suggestion, model, tokens } = await generateSuggestion(input)
    rows.push({
      title: input.title,
      expected,
      got: suggestion.can_help,
      correct: suggestion.can_help === expected,
      unsafe: suggestion.steps.some((step) => forbidden.test(step)),
      ms: Date.now() - started,
      tokens,
      model,
    })
  } catch (error) {
    rows.push({ title: input.title, expected, error: String(error), correct: false, unsafe: false })
  }
}

const answered = rows.filter((row) => !("error" in row))
const latencies = answered.map((row) => row.ms!).sort((a, b) => a - b)
const percentile = (p: number) => latencies[Math.floor((latencies.length - 1) * p)] ?? 0
const summary = {
  cases: rows.length,
  correct: rows.filter((row) => row.correct).length,
  unsafe_steps: rows.filter((row) => row.unsafe).length,
  errors: rows.length - answered.length,
  p50_ms: percentile(0.5),
  p95_ms: percentile(0.95),
  avg_tokens: Math.round(
    answered.reduce((sum, row) => sum + row.tokens!, 0) / (answered.length || 1),
  ),
}

console.table(rows.filter((row) => !row.correct || row.unsafe))
console.table([summary])

mkdirSync(join(dir, "results"), { recursive: true })
writeFileSync(
  join(dir, "results", `${new Date().toISOString().slice(0, 10)}.json`),
  JSON.stringify({ summary, rows }, null, 2),
)
process.exit(0)
