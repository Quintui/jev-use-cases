import type { Experimental_EvaluationQuestion as Question } from "ai"

import {
  CLI_COMMANDS,
  COMMANDS,
  COMPOSER_MODES,
  EXPENSE_CATEGORIES,
  FOLDER_EMOJI,
  NONE,
  SETTINGS,
} from "@/lib/jev/catalog"
import {
  LEAF_TYPES,
  VOCAB,
  isLabeled,
  type PlannedElement,
} from "@/lib/jev/json-render"
import { matchesAny, overlap, softmax } from "@/lib/jev/text"
import type { JevAnswer } from "@/lib/jev/types"

type State = string | Record<string, unknown> | unknown[]
type Questions = Record<string, Question>

type UseCase<Input> = {
  /** Server-side: the questions never come from the client. */
  build: (input: Input) => { state: State; questions: Questions }
  /** Offline answers with the same shape, for no API key or API down. */
  fallback: (input: Input, questions: Questions) => Record<string, JevAnswer>
}

const SEVERITY = ["none", "mild", "moderate", "severe"]
const TECHNICAL = [
  "Not technical at all: everyday words, unsure what to call things",
  "Slightly technical: knows the app but not how it works",
  "Moderately technical: uses some correct terms",
  "Technical: precise terminology, names APIs or tools",
  "Expert: terse, exact, assumes deep background knowledge",
]
const DETAIL = [
  "Wants just the answer, one line",
  "Wants a short answer",
  "Wants a normal answer with brief reasoning",
  "Wants a thorough explanation",
  "Wants a step-by-step walkthrough from the basics",
]

// ---------- helpers ----------

function criteriaOf<T extends { key: string }>(
  items: T[],
  describe: (item: T) => string,
  none?: string
) {
  const criteria: Record<string, string> = Object.fromEntries(
    items.map((item) => [item.key, describe(item)])
  )
  if (none) criteria[NONE] = none
  return criteria
}

function fuzzyChoice(
  text: string,
  question: Question,
  { noneScore = 0.6, boost = {} as Record<string, number> } = {}
): JevAnswer {
  if (question.type !== "choice") throw new Error("not a choice question")
  const scores: Record<string, number> = {}
  for (const [key, description] of Object.entries(question.criteria)) {
    scores[key] =
      key === NONE
        ? noneScore
        : overlap(text, `${key} ${String(description ?? "")}`) +
          (boost[key] ?? 0)
  }
  const probabilities = softmax(scores)
  const choice = Object.entries(probabilities).sort((a, b) => b[1] - a[1])[0][0]
  return { type: "choice", choice, probabilities }
}

function score(levels: number, value: number): JevAnswer {
  const clamped = Math.min(levels - 1, Math.max(0, value))
  const raw = Object.fromEntries(
    Array.from({ length: levels }, (_, i) => [
      String(i),
      Math.exp(-((i - clamped) ** 2) / 0.5),
    ])
  )
  const total = Object.values(raw).reduce((a, b) => a + b, 0)
  const probabilities = Object.fromEntries(
    Object.entries(raw).map(([k, v]) => [k, v / total])
  )
  const mean = Object.entries(probabilities).reduce(
    (sum, [k, p]) => sum + Number(k) * p,
    0
  )
  return { type: "score", score: mean, probabilities }
}

function noul(probability: number): JevAnswer {
  return {
    type: "boolean",
    probability: Math.min(0.99, Math.max(0.01, probability)),
  }
}

function fromSignals(hits: number, base = 0.06, step = 0.45) {
  return noul(base + hits * step)
}

function technicalLevel(text: string) {
  const jargon = matchesAny(text, [
    /\b(api|sdk|async|await|useeffect|abortcontroller|race condition|mutex|thread|regex|stack trace|null|undefined|typescript|endpoint|latency|cache|schema|kubernetes|docker|sql|index|deploy|dns|http|cors|oauth|jwt|webhook|hook|closure|promise|fetch)\b/i,
    /[`(){}[\];=<>]/,
    /\b[a-z]+[A-Z][a-zA-Z]+\b/,
  ])
  const casual = matchesAny(text, [
    /\b(not sure|idk|dunno|i think|kinda|somehow|thingy|stuff|weird|help|not really a coder|no idea|confused)\b/i,
    /\?\?|!!/,
    /\b(im|dont|cant|whats)\b/,
  ])
  return Math.max(0, Math.min(4, 1.5 + jargon * 1.2 - casual * 0.9))
}

// ---------- hostile / rule signals for the offline moderator ----------

const HOSTILE = [
  /\b(trash|garbage|idiot|stupid|loser|dumb|clown|pathetic|worst streamer|uninstall|shut up|nobody likes you|hate (you|this streamer)|kys)\b/i,
]
const SEVERE = [/\b(kys|kill yourself|nobody likes you)\b/i]
const RULE_SIGNALS: Record<string, RegExp[]> = {
  spoilers: [
    /\b(ending|dies|final boss|turns out|spoiler|wait till you|wait until you|secret boss|plot twist)\b/i,
    /\b(ranni|malenia|radagon|marika)\b/i,
  ],
  backseat: [
    /\b(just (roll|dodge|go|use|jump)|you should|why (don't|dont|aren't|arent) you|go (left|right|back)|use the|wrong way|you missed|bro just)\b/i,
  ],
  passiveAggressive: [
    /🙂|🙃/u,
    /\b(very entertaining|great content|wow another|sure buddy|i guess|must be nice|totally not boring)\b/i,
  ],
}

// ---------- use cases ----------

function define<Input>(useCase: UseCase<Input>) {
  return useCase
}

export const useCases = {
  /** Intro: all three primitives in one call. */
  primitives: define({
    build: ({ text }: { text: string }) => ({
      state: { message: text },
      questions: {
        setting: {
          type: "choice",
          instructions: "Which setting does the user want to change?",
          criteria: criteriaOf(
            SETTINGS,
            (s) => `${s.label}: ${s.description}`,
            "Not about a setting"
          ),
        },
        technical: {
          type: "score",
          instructions: "How technical is this message?",
          criteria: TECHNICAL,
        },
        toxic: {
          type: "boolean",
          instructions: "Is this chat message toxic?",
        },
      },
    }),
    fallback: ({ text }, q) => ({
      setting: fuzzyChoice(text, q.setting),
      technical: score(5, technicalLevel(text)),
      toxic: fromSignals(matchesAny(text, [...HOSTILE, ...SEVERE])),
    }),
  }),

  settings: define({
    build: ({ query }: { query: string }) => ({
      state: { query, screen: "Settings" },
      questions: {
        setting: {
          type: "choice",
          instructions: "Which setting does the user want?",
          criteria: criteriaOf(
            SETTINGS,
            (s) => `${s.label}: ${s.description}`,
            "None of these settings"
          ),
        },
      },
    }),
    fallback: ({ query }, q) => ({ setting: fuzzyChoice(query, q.setting) }),
  }),

  commands: define({
    build: ({ query, screen }: { query: string; screen: string }) => ({
      state: { query, screen },
      questions: {
        command: {
          type: "choice",
          instructions: "Which command is the user trying to run?",
          criteria: criteriaOf(
            COMMANDS,
            (c) => `${c.label}: ${c.description}`,
            "None of these commands"
          ),
        },
      },
    }),
    fallback: ({ query }, q) => ({ command: fuzzyChoice(query, q.command) }),
  }),

  cli: define({
    build: ({ input }: { input: string }) => ({
      state: { typed: input },
      questions: {
        command: {
          type: "choice",
          instructions:
            "The user typed a command that doesn't exist. Which real command did they mean, by meaning rather than spelling?",
          criteria: criteriaOf(
            CLI_COMMANDS,
            (c) => c.description,
            "Not related to any of these commands"
          ),
        },
      },
    }),
    fallback: ({ input }, q) => {
      const tool = input.trim().split(/\s+/)[0]
      const boost = Object.fromEntries(
        CLI_COMMANDS.map((c) => [c.key, c.key.startsWith(`${tool} `) ? 0.6 : 0])
      )
      return { command: fuzzyChoice(input, q.command, { boost, noneScore: 0.4 }) }
    },
  }),

  folderEmoji: define({
    build: ({ name }: { name: string }) => ({
      state: { folderName: name },
      questions: {
        icon: {
          type: "choice",
          instructions: "Which icon best represents a folder with this name?",
          criteria: criteriaOf(FOLDER_EMOJI, (e) => e.description),
        },
      },
    }),
    fallback: ({ name }, q) => ({
      icon: fuzzyChoice(name, q.icon, { boost: { folder: 0.5 } }),
    }),
  }),

  expenseCategory: define({
    build: ({
      title,
      history,
    }: {
      title: string
      history: { title: string; category: string }[]
    }) => ({
      state: { expense: title, previousExpensesByThisUser: history },
      questions: {
        category: {
          type: "choice",
          instructions: "Which category does this expense belong to?",
          criteria: criteriaOf(EXPENSE_CATEGORIES, (c) => `${c.label}: ${c.description}`),
        },
      },
    }),
    fallback: ({ title }, q) => ({ category: fuzzyChoice(title, q.category) }),
  }),

  sendIntent: define({
    build: ({ message }: { message: string }) => ({
      state: { draftMessage: message },
      questions: {
        sendLater: {
          type: "boolean",
          instructions:
            "Is this message written to be read at the future time it mentions, so it should be scheduled rather than sent now?",
          criteria: {
            true: "Written for that moment: a greeting (good morning, happy birthday), a reminder meant to arrive then, or the sender says to send it then",
            false: "Meant to be read now: making or changing plans, asking a question, or announcing something ahead of time",
          },
        },
      },
    }),
    fallback: ({ message }) => ({
      sendLater: fromSignals(
        matchesAny(message, [
          /\b(happy birthday|good morning|good night|send (it |this )?(tomorrow|tonight|on|at))\b/i,
          /\b(tomorrow|tonight|monday|tuesday|wednesday|thursday|friday|at \d)/i,
        ]) -
          matchesAny(message, [/\b(see you|meet|can we|move|i'll be|reminder|heads up)\b/i]),
        0.08,
        0.4
      ),
    }),
  }),

  composer: define({
    build: ({ draft, currentMode }: { draft: string; currentMode: string }) => ({
      state: { draft, currentMode },
      questions: {
        mode: {
          type: "choice",
          instructions: "Which mode is the best fit for this message?",
          criteria: criteriaOf(COMPOSER_MODES, (m) => `${m.label}: ${m.description}`),
        },
        needsWeb: {
          type: "boolean",
          instructions: "Does answering this need a web search for current information?",
        },
        aboutFile: {
          type: "boolean",
          instructions: "Is the user asking about a file, document or attachment?",
        },
        settingsRequest: {
          type: "boolean",
          instructions:
            "Is this actually a request to change an app setting rather than a question for the assistant?",
        },
        setting: {
          type: "choice",
          instructions: "If it is a settings request, which setting?",
          criteria: criteriaOf(
            SETTINGS,
            (s) => `${s.label}: ${s.description}`,
            "Not a settings request"
          ),
        },
      },
    }),
    fallback: ({ draft }, q) => {
      const setting = fuzzyChoice(draft, q.setting, { noneScore: 1.2 })
      const signals: Record<string, RegExp[]> = {
        chat: [/\b(rewrite|rephrase|translate|quick|what is|define|polite)\b/i],
        code: [/[`{}();]|=>/, /\b(error|bug|function|typescript|python|react|component|stack trace|exception|implement)\b/i],
        research: [/\b(research|latest|sources|report|news|market|citations?)\b/i, /\b(compare|comparison|versus|vs)\b/i],
        image: [/\b(draw|picture|logo|image|illustration|photo)\b/i],
        reasoning: [/\b(proof|prove|puzzle|solve|step by step|probability|plan|work out)\b/i],
      }
      // No signal → a flat distribution: Jev being unsure is a real answer.
      const probabilities = softmax(
        Object.fromEntries(
          Object.entries(signals).map(([mode, res]) => [mode, matchesAny(draft, res)])
        ),
        0.45
      )
      const choice = Object.entries(probabilities).sort((a, b) => b[1] - a[1])[0][0]
      return {
        mode: { type: "choice", choice, probabilities },
        needsWeb: fromSignals(
          matchesAny(draft, [
            /\b(latest|today|current|right now|this week|2026)\b/i,
            /\b(news|price|weather|score|election|release|act)\b/i,
          ])
        ),
        aboutFile: fromSignals(
          matchesAny(draft, [
            /\b(file|pdf|docx?|attachment|spreadsheet|csv)\b/i,
            /\b(this|the|attached) (pdf|doc|document|file|spreadsheet)\b/i,
          ])
        ),
        settingsRequest: noul(
          setting.type === "choice" && setting.choice !== NONE
            ? (setting.probabilities?.[setting.choice] ?? 0.5)
            : 0.05
        ),
        setting,
      }
    },
  }),

  responseDepth: define({
    build: ({ message }: { message: string }) => ({
      state: { userMessage: message },
      questions: {
        technical: {
          type: "score",
          instructions: "How technical is the person who wrote this message?",
          criteria: TECHNICAL,
        },
        detail: {
          type: "score",
          instructions: "How much detail does the user seem to want?",
          criteria: DETAIL,
        },
      },
    }),
    fallback: ({ message }) => {
      const tech = technicalLevel(message)
      return {
        technical: score(5, tech),
        detail: score(
          5,
          4 - tech +
            matchesAny(message, [/\b(explain|walk me through|step by step|why)\b/i]) -
            matchesAny(message, [/\b(no preamble|just|tl;?dr|briefly|short)\b/i]) * 1.5
        ),
      }
    },
  }),

  jsonRenderPlan: define({
    build: ({ request }: { request: string }) => ({
      state: { uiRequest: request },
      questions: {
        count_section: {
          type: "score",
          instructions: "How many separate card sections should this screen have?",
          criteria: ["1 section", "2 sections", "3 sections"],
        },
        ...Object.fromEntries(
          LEAF_TYPES.map(({ type, description }) => [
            `count_${type}`,
            {
              type: "score",
              instructions: `How many "${type}" components (${description}) does this screen need?`,
              criteria: ["none", "one", "two", "three"],
            } satisfies Question,
          ])
        ),
      },
    }),
    fallback: ({ request }) => {
      const has = (re: RegExp) => re.test(request)
      const dashboard = has(/dashboard|analytics|sales|metrics|kpi|admin/i)
      const form = has(/sign ?up|login|log in|register|form|contact|onboarding/i)
      const profile = has(/profile|account|team|member|user/i)
      const settings = has(/setting|preference/i)
      const counts: Record<string, number> = {
        section: dashboard || settings ? 1 : 0, // level index: 0 = "1 section"
        heading: 1,
        text: form || profile ? 1 : 0,
        stat: dashboard ? 3 : 0,
        input: form ? (has(/sign ?up|register/i) ? 3 : 2) : 0,
        switch: settings ? 3 : 0,
        button: form || settings || profile ? 1 : 0,
        badge: profile ? 2 : 0,
        avatar: profile ? 1 : 0,
        alert: has(/warn|error|alert|billing/i) ? 1 : 0,
        progress: has(/goal|progress|onboarding|course/i) ? 1 : 0,
        table: dashboard ? 1 : 0,
        list: has(/activity|feed|tasks|todo|recent/i) ? 1 : 0,
        separator: settings ? 1 : 0,
      }
      return Object.fromEntries(
        Object.entries(counts).map(([type, n]) => [
          `count_${type}`,
          score(type === "section" ? 3 : 4, n),
        ])
      )
    },
  }),

  jsonRenderLayout: define({
    build: ({
      request,
      sections,
      elements,
    }: {
      request: string
      sections: string[]
      elements: PlannedElement[]
    }) => {
      const questions: Questions = {}
      for (const element of elements) {
        questions[`parent_${element.id}`] = {
          type: "choice",
          instructions: `Which section should ${element.id} (a ${element.type}) go in?`,
          criteria: Object.fromEntries(
            sections.map((s, i) => [s, `Card ${i + 1} of ${sections.length}, top to bottom`])
          ),
        }
        questions[`order_${element.id}`] = {
          type: "score",
          instructions: `Where inside its section should ${element.id} appear?`,
          criteria: ["very top", "near the top", "middle", "near the bottom", "very bottom"],
        }
        if (isLabeled(element.type)) {
          questions[`label_${element.id}`] = {
            type: "choice",
            instructions: `Which label fits ${element.id}? Avoid repeating a label another ${element.type} would use.`,
            criteria: Object.fromEntries(VOCAB[element.type].map((w) => [w, null])),
          }
        }
      }
      return { state: { uiRequest: request, sections, elements }, questions }
    },
    fallback: ({ request, sections, elements }) => {
      const answers: Record<string, JevAnswer> = {}
      const ORDER: Record<string, number> = {
        heading: 0, avatar: 0.5, text: 1, alert: 1, badge: 1.5, stat: 1.5, progress: 2,
        input: 2, switch: 2, table: 2.5, list: 2.5, separator: 3, button: 4,
      }
      const seen: Record<string, number> = {}
      for (const element of elements) {
        const n = (seen[element.type] = (seen[element.type] ?? 0) + 1)
        const sectionIndex =
          sections.length === 1
            ? 0
            : ["table", "list"].includes(element.type)
              ? sections.length - 1
              : element.type === "heading" && n > 1
                ? Math.min(n - 1, sections.length - 1)
                : 0
        answers[`parent_${element.id}`] = {
          type: "choice",
          choice: sections[sectionIndex],
          probabilities: Object.fromEntries(
            sections.map((s, i) => [s, i === sectionIndex ? 0.9 : 0.1 / (sections.length - 1 || 1)])
          ),
        }
        answers[`order_${element.id}`] = score(5, ORDER[element.type] ?? 2)
        if (isLabeled(element.type)) {
          const words = VOCAB[element.type]
          const ranked = [...words].sort((a, b) => overlap(request, b) - overlap(request, a))
          const pick = ranked[(n - 1) % ranked.length]
          answers[`label_${element.id}`] = {
            type: "choice",
            choice: pick,
            probabilities: Object.fromEntries(words.map((w) => [w, w === pick ? 0.8 : 0.2 / (words.length - 1)])),
          }
        }
      }
      return answers
    },
  }),

  moderation: define({
    build: ({
      game,
      streamer,
      rules,
      messages,
    }: {
      game: string
      streamer: string
      rules: { id: string; text: string }[]
      messages: { id: string; user: string; text: string }[]
    }) => {
      const questions: Questions = {}
      for (const m of messages) {
        questions[`${m.id}__hostile`] = {
          type: "boolean",
          instructions: `Is message ${m.id} a genuine insult or attack on a person? Friendly Twitch banter and slang ("cooked", "bro", "lol", 💀) is not hostile.`,
        }
        questions[`${m.id}__severity`] = {
          type: "score",
          instructions: `How severe is any harm in message ${m.id}?`,
          criteria: SEVERITY,
        }
        for (const rule of rules) {
          questions[`${m.id}__rule_${rule.id}`] = {
            type: "boolean",
            instructions: `Does message ${m.id} break this channel rule: "${rule.text}"?`,
          }
        }
      }
      return {
        state: { stream: { game, streamer }, chatWindow: messages },
        questions,
      }
    },
    fallback: ({ rules, messages }) => {
      const answers: Record<string, JevAnswer> = {}
      for (const m of messages) {
        const hostile = matchesAny(m.text, HOSTILE)
        const severe = matchesAny(m.text, SEVERE)
        answers[`${m.id}__hostile`] = fromSignals(hostile + severe, 0.04, 0.85)
        answers[`${m.id}__severity`] = score(4, hostile * 1.6 + severe * 1.4)
        for (const rule of rules) {
          const signals = RULE_SIGNALS[rule.id]
          const aboutLinks = /\b(link|promo|self-promotion|advertis|channel)/i.test(rule.text)
          const hits = signals
            ? matchesAny(m.text, signals)
            : (overlap(m.text, rule.text) >= 1.5 ? 1 : 0) +
              (aboutLinks ? matchesAny(m.text, [/https?:\/\/|\w\.(tv|com|gg)\/|my (channel|stream)/i]) : 0)
          // One signal → hold for review, two → hide.
          answers[`${m.id}__rule_${rule.id}`] = fromSignals(hits, 0.05, 0.62)
        }
      }
      return answers
    },
  }),
}

export type UseCaseId = keyof typeof useCases
export type JevInput<K extends UseCaseId> = Parameters<
  (typeof useCases)[K]["build"]
>[0]
