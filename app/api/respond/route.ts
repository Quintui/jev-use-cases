import { createOpenAICompatible } from "@ai-sdk/openai-compatible"
import { streamText, type LanguageModel } from "ai"

const RESPONSE_MODEL = process.env.RESPONSE_MODEL ?? "anthropic/claude-haiku-4.5"

const openRouter = createOpenAICompatible({
  name: "openrouter",
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
})

/** OpenRouter first (same key as Jev), then the AI Gateway. */
function resolveModel(): LanguageModel | null {
  if (process.env.OPENROUTER_API_KEY) return openRouter.chatModel(RESPONSE_MODEL)
  if (process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN) return RESPONSE_MODEL
  return null
}

export async function POST(request: Request) {
  const { message, instruction } = (await request.json()) as {
    message: string
    instruction: string
  }

  const model = resolveModel()
  if (!model) {
    return new Response(
      `(No OPENROUTER_API_KEY or AI_GATEWAY_API_KEY set, so no LLM is called.)\n\nThis instruction would be sent as the system prompt:\n\n"${instruction}"`,
      { headers: { "Content-Type": "text/plain; charset=utf-8" } }
    )
  }

  const result = streamText({
    model,
    instructions: `You are a helpful assistant. ${instruction}`,
    prompt: message,
    abortSignal: request.signal,
  })

  return result.toTextStreamResponse()
}
