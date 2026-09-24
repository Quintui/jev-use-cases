/**
 * Jev scores the message; code maps the scores to an instruction for the LLM.
 * Jev isn't replacing the big model here. It's steering it.
 */
export function responseStyle(technical: number, detail: number) {
  const depth = (4 - technical + detail) / 2 // 0 = terse, 4 = in-depth

  if (depth < 1.25) {
    return {
      label: "Concise",
      instruction:
        "The user is an expert. Answer in at most 4 sentences or one short code block. No preamble, no definitions, no recap.",
    }
  }
  if (depth < 2.5) {
    return {
      label: "Balanced",
      instruction:
        "The user knows the basics. Give the answer first, then a short explanation of why it works. Keep jargon minimal and define anything unusual.",
    }
  }
  return {
    label: "In-depth",
    instruction:
      "The user is not technical. Use plain language and an everyday analogy. Explain what is going on step by step, avoid jargon (or explain it), and end with one concrete thing they can try.",
  }
}
