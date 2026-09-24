import type { ChoiceAnswer, JevResponse } from "@/lib/jev/types"

/**
 * The core UI pattern of the whole demo.
 * High: apply automatically (with undo). Medium: suggest. Low: do nothing.
 */
export const TIERS = {
  high: 0.85,
  medium: 0.55,
} as const

export type Tier = "high" | "medium" | "low"

export function tierOf(probability: number): Tier {
  if (probability >= TIERS.high) return "high"
  if (probability >= TIERS.medium) return "medium"
  return "low"
}

export const TIER_LABEL: Record<Tier, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
}

export type RankedOption = { key: string; probability: number }

/** The full distribution *is* the ranking. */
export function rank(
  answer: ChoiceAnswer | undefined,
  { min = 0, limit = Infinity, exclude = [] as string[] } = {}
): RankedOption[] {
  if (!answer) return []
  const probabilities = answer.probabilities ?? { [answer.choice]: 1 }
  return Object.entries(probabilities)
    .filter(([key, p]) => p >= min && !exclude.includes(key))
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([key, probability]) => ({ key, probability }))
}

export function choiceOf(response: JevResponse | undefined, id: string) {
  const answer = response?.answers[id]
  return answer?.type === "choice" ? answer : undefined
}

export function scoreOf(response: JevResponse | undefined, id: string) {
  const answer = response?.answers[id]
  return answer?.type === "score" ? answer : undefined
}

export function noulOf(response: JevResponse | undefined, id: string) {
  const answer = response?.answers[id]
  return answer?.type === "boolean" ? answer.probability : undefined
}

/** Confidence in the winning choice: TypeSafe's value when present, else its probability. */
export function confidenceOf(response: JevResponse | undefined, id: string) {
  const answer = choiceOf(response, id)
  if (!answer) return 0
  return (
    response?.confidence[id] ?? answer.probabilities?.[answer.choice] ?? 1
  )
}

export function formatPercent(probability: number) {
  return `${Math.round(probability * 100)}%`
}
