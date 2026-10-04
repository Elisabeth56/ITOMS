// The only file that talks to LLM providers. Groq and Gemini both accept the OpenAI chat
// format, so a provider is just a URL, a key and a model. Order here is the fallback order.
import { env } from "../env"
import { AppError } from "../errors"

type Provider = { name: string; url: string; key: string | undefined; model: string }

const providers = (
  [
    {
      name: "groq",
      url: "https://api.groq.com/openai/v1/chat/completions",
      key: env.GROQ_API_KEY,
      model: env.GROQ_MODEL,
    },
    {
      name: "gemini",
      url: "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
      key: env.GEMINI_API_KEY,
      model: env.GEMINI_MODEL,
    },
  ] satisfies Provider[]
).filter((provider) => provider.key)

export type Generated = { data: unknown; model: string; tokens: number }

/** Asks for a JSON answer, trying each configured provider until one responds. */
export async function generateJson(system: string, user: string): Promise<Generated> {
  // why each provider was skipped, kept for the log and the eval (never shown to employees)
  const failures: string[] = providers.length ? [] : ["no provider key is set"]

  for (const provider of providers) {
    try {
      const response = await fetch(provider.url, {
        method: "POST",
        headers: { Authorization: `Bearer ${provider.key}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: provider.model,
          temperature: 0.2,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: system },
            { role: "user", content: user },
          ],
        }),
        signal: AbortSignal.timeout(15_000),
      })
      if (!response.ok) {
        // rate limited, bad key or unknown model: note it and try the next provider
        failures.push(
          `${provider.name} ${response.status}: ${(await response.text()).slice(0, 200)}`,
        )
        continue
      }

      const body = await response.json()
      return {
        data: JSON.parse(body.choices[0].message.content),
        model: `${provider.name}/${provider.model}`,
        tokens: body.usage?.total_tokens ?? 0,
      }
    } catch (error) {
      failures.push(`${provider.name}: ${String(error)}`) // timeout, network or unparseable answer
    }
  }
  throw new AppError(
    503,
    "ai_unavailable",
    "The assistant is not available right now. You can still send your request to IT.",
    { failures },
  )
}
