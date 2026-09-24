/**
 * Tiny deterministic text helpers.
 * Used for the keyword baseline in the UI and by the offline fallback
 * ("keyword or fuzzy matching runs first or when the API is down").
 */

const STOPWORDS = new Set(
  "a an and are as at be but by can do for from get how i im i'm in is it its it's make me my of on or please so some that the them things thing this to too too want way what when with would you your".split(
    " "
  )
)

function stem(word: string) {
  return word
    .replace(/(ing|ed|ly|es|s)$/u, "")
    .replace(/(.)\1$/u, "$1")
}

export function tokenize(text: string) {
  return text
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter((word) => word.length > 1 && !STOPWORDS.has(word))
    .map(stem)
}

/** How many query tokens appear in the document (prefix matches count half). */
export function overlap(query: string, document: string) {
  const docTokens = tokenize(document)
  let score = 0
  for (const token of tokenize(query)) {
    if (docTokens.includes(token)) score += 1
    else if (
      token.length >= 4 &&
      docTokens.some((d) => d.startsWith(token) || token.startsWith(d))
    )
      score += 0.5
  }
  return score
}

/** Literal keyword search, the baseline every intent search starts from. */
export function keywordMatch<T>(
  query: string,
  items: T[],
  text: (item: T) => string
) {
  const q = query.trim().toLowerCase()
  if (!q) return []
  return items.filter((item) => {
    const haystack = text(item).toLowerCase()
    return q.split(/\s+/).every((word) => haystack.includes(word))
  })
}

/** Turns raw scores into a probability distribution. */
export function softmax(scores: Record<string, number>, temperature = 0.3) {
  const entries = Object.entries(scores)
  const max = Math.max(...entries.map(([, s]) => s))
  const exps = entries.map(
    ([key, s]) => [key, Math.exp((s - max) / temperature)] as const
  )
  const total = exps.reduce((sum, [, e]) => sum + e, 0)
  return Object.fromEntries(exps.map(([key, e]) => [key, e / total]))
}

export function matchesAny(text: string, patterns: RegExp[]) {
  return patterns.filter((pattern) => pattern.test(text)).length
}
