# 005: Optional AI quick fix before a ticket is filed

**Date:** 2026-10-04

## Context

Many requests seen during the internship had a first step the employee could do themselves: restart the printer, rejoin the Wi-Fi, close a frozen program. An optional suggestion before filing can save the employee a wait and the IT team a visit. It must never get in the way of filing a ticket, and it must never give advice that could damage a device or expose a password.

## Decision

- One prompt with a validated JSON answer (`can_help`, `summary`, up to 5 `steps`). No retrieval, tools or agent loop; the problem does not need them yet.
- The model either gives safe steps or says the request needs IT. The rules for which is which live in `apps/server/src/ai/prompts/suggest-fix.md`.
- Free providers: Groq first, Gemini as fallback, both through one small module (`src/ai/llm.ts`). With no key configured the feature answers "not available" and the rest of the system is unaffected.
- No LangChain or LlamaIndex. The whole feature is one HTTP call and a zod schema, under 100 lines; a framework would add dependencies and nothing else.
- Every suggestion is stored with its outcome (solved, ticket filed, or abandoned). IT sees what the employee already tried, and the report can state how many requests were solved without a ticket.
- Limited to 10 suggestions per person per hour.

## Consequences

- The employee's problem text is sent to a third-party model provider. The prompt and UI should say so, and the text should not contain passwords.
- Quality is measured by `pnpm eval` (32 cases: should it help or hand over, and are the steps safe). Run it on any change to the prompt or model.
- The answer is not streamed. It is a short JSON object; revisit if it feels slow.

## Revisit if

The eval shows the model missing fixes that past tickets already document. The next step would be retrieval over resolved tickets.
