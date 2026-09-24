import { createTypeSafeAi, typeSafeAi } from "@ai-sdk/typesafe-ai"
import {
  experimental_evaluate,
  type Experimental_EvaluationModel as EvaluationModel,
  type Experimental_EvaluationQuestion as Question,
} from "ai"

import type { JevResponse, JevSource } from "@/lib/jev/types"
import { useCases, type JevInput, type UseCaseId } from "@/lib/jev/use-cases"

const JEV_MODEL = process.env.JEV_MODEL
const TIMEOUT_MS = 4000

/**
 * OpenRouter serves Jev behind TypeSafe's own wire format
 * (POST /api/v1/systemone), so the TypeSafe provider works as-is with a
 * different base URL and an OpenRouter key.
 */
const openRouterJev = createTypeSafeAi({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
})

/**
 * The API key stays on the server; this module is the "small proxy".
 * Prefers a direct TypeSafe key, then OpenRouter, then the AI Gateway,
 * then the offline fallback.
 */
function resolveModel(): { model: EvaluationModel; source: JevSource } | null {
  if (process.env.TYPESAFE_AI_API_KEY) {
    return { model: typeSafeAi.evaluationModel(JEV_MODEL ?? "jev-latest"), source: "jev" }
  }
  if (process.env.OPENROUTER_API_KEY) {
    return {
      model: openRouterJev.evaluationModel(JEV_MODEL ?? "typesafe/jev-1.13"),
      source: "openrouter",
    }
  }
  if (process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN) {
    return { model: `typesafe-ai/${JEV_MODEL ?? "jev-latest"}`, source: "gateway" }
  }
  return null
}

export function jevMode(): JevSource {
  return resolveModel()?.source ?? "fallback"
}

function summarize(questions: Record<string, Question>) {
  return Object.entries(questions).map(([id, q]) => ({
    id,
    type: q.type,
    instructions: String(q.instructions),
    options:
      q.type === "choice"
        ? Object.keys(q.criteria).length
        : q.type === "score"
          ? q.criteria.length
          : 2,
  }))
}

export async function evaluateUseCase<K extends UseCaseId>(
  id: K,
  input: JevInput<K>,
  signal?: AbortSignal
): Promise<JevResponse> {
  // Each use case's input type is checked at the call site.
  const useCase = useCases[id] as unknown as {
    build: (input: JevInput<K>) => ReturnType<(typeof useCases)[K]["build"]>
    fallback: (
      input: JevInput<K>,
      questions: Record<string, Question>
    ) => JevResponse["answers"]
  }
  const { state, questions } = useCase.build(input)
  const resolved = resolveModel()
  const start = performance.now()

  const fallback = (error?: string): JevResponse => ({
    answers: useCase.fallback(input, questions),
    confidence: {},
    latencyMs: performance.now() - start,
    source: "fallback",
    model: "keyword fallback",
    questions: summarize(questions),
    error,
  })

  if (!resolved) return fallback()

  try {
    const result = await experimental_evaluate({
      model: resolved.model,
      state: state as Parameters<typeof experimental_evaluate>[0]["state"],
      questions,
      maxRetries: 0,
      abortSignal: AbortSignal.any(
        [AbortSignal.timeout(TIMEOUT_MS), signal].filter(
          (s): s is AbortSignal => s != null
        )
      ),
    })
    const confidence =
      (result.providerMetadata?.typesafe?.confidence as
        | Record<string, number>
        | undefined) ?? {}
    return {
      answers: result.answers as JevResponse["answers"],
      confidence,
      latencyMs: performance.now() - start,
      source: resolved.source,
      model: result.response.modelId,
      questions: summarize(questions),
    }
  } catch (error) {
    if (signal?.aborted) throw error
    // Always have a fallback: the UI shouldn't know the difference.
    return fallback(error instanceof Error ? error.message : String(error))
  }
}
