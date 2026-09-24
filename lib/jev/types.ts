export type ChoiceAnswer = {
  type: "choice"
  choice: string
  probabilities?: Record<string, number>
}

export type ScoreAnswer = {
  type: "score"
  score: number
  probabilities?: Record<string, number>
}

export type NoulAnswer = {
  type: "boolean"
  probability: number
}

export type JevAnswer = ChoiceAnswer | ScoreAnswer | NoulAnswer

export type JevSource = "jev" | "openrouter" | "gateway" | "fallback"

export type JevQuestionSummary = {
  id: string
  type: "choice" | "score" | "boolean"
  instructions: string
  options: number
}

export type JevResponse = {
  answers: Record<string, JevAnswer>
  /** TypeSafe's per-question confidence, when the provider reports it. */
  confidence: Record<string, number>
  /** Time spent inside the model call on the server. */
  latencyMs: number
  source: JevSource
  model: string
  questions: JevQuestionSummary[]
  /** Set when a live call failed and the fallback answered instead. */
  error?: string
}
