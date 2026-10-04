// Optional AI quick fix. An employee describes a problem and gets safe steps to try,
// or is told to send it to IT. Every suggestion is stored so IT can see what was tried
// and the project can report how many requests were solved without a ticket.
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { suggestionSchema, type SuggestFixInput, type Suggestion } from "@itoms/shared"
import { generateJson } from "../../ai/llm"
import type { User } from "../../auth"
import { pool } from "../../db"
import { AppError } from "../../errors"

const prompt = readFileSync(join(import.meta.dirname, "../../ai/prompts/suggest-fix.md"), "utf8")
const HOURLY_LIMIT = 10

/** Asks the model and returns an answer that passed validation. No database access. */
export async function generateSuggestion(input: SuggestFixInput) {
  const request = `<request>\nCategory: ${input.category}\nProblem: ${input.title}\nDetails: ${input.description || "none given"}\n</request>`

  // one retry, telling the model what was wrong with its first answer
  let message = request
  let rejection = ""
  for (let attempt = 0; attempt < 2; attempt++) {
    const { data, model, tokens } = await generateJson(prompt, message)
    const parsed = suggestionSchema.safeParse(data)
    if (parsed.success) {
      const suggestion: Suggestion = parsed.data.can_help
        ? parsed.data
        : { ...parsed.data, steps: [] }
      return { suggestion, model, tokens }
    }
    rejection = parsed.error.message
    message = `${request}\n\nYour last answer was rejected: ${parsed.error.message}. Reply again with valid JSON.`
  }
  throw new AppError(
    502,
    "ai_bad_answer",
    "The assistant could not come up with an answer. You can still send your request to IT.",
    { rejection },
  )
}

export async function suggestFix(user: User, input: SuggestFixInput) {
  const recent = await pool.query<{ count: number }>(
    "select count(*)::int as count from ai_suggestions where user_id = $1 and created_at > now() - interval '1 hour'",
    [user.id],
  )
  if (recent.rows[0]!.count >= HOURLY_LIMIT) {
    throw new AppError(
      429,
      "ai_limit_reached",
      "You have used the assistant a lot this hour. Send your request to IT instead.",
    )
  }

  const { suggestion, model, tokens } = await generateSuggestion(input)
  const { rows } = await pool.query<{ id: string }>(
    `insert into ai_suggestions (user_id, category, title, description, can_help, summary, steps, model)
     values ($1, $2, $3, $4, $5, $6, $7, $8) returning id`,
    [
      user.id,
      input.category,
      input.title,
      input.description,
      suggestion.can_help,
      suggestion.summary,
      JSON.stringify(suggestion.steps),
      model,
    ],
  )
  return { id: rows[0]!.id, ...suggestion, model, tokens }
}

/** The employee says the suggestion fixed it, so no ticket is needed. */
export async function markSolved(user: User, id: string) {
  const { rowCount } = await pool.query(
    "update ai_suggestions set outcome = 'solved' where id = $1 and user_id = $2 and outcome is null",
    [id, user.id],
  )
  if (!rowCount) throw new AppError(404, "suggestion_not_found", "That suggestion does not exist.")
}
