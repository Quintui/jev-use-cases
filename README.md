# Jev use cases

Demo app for a video about [Jev](https://typesafe.ai/blog/introducing-system-one-models-and-jev), TypeSafe's "System One" decision model. Each page is one segment of the script in [`idea.md`](idea.md): intent search, small typing interactions, a model picker, response depth, json-render, and Twitch chat moderation.

**Jev decides, code does.** Jev answers Choice, Score and Noul (yes/no) questions through the AI SDK's [`experimental_evaluate`](https://ai-sdk.dev/docs/ai-sdk-core/evaluation). App code decides what the UI does with the probabilities: apply when confident, suggest when unsure, do nothing when low.

## Run it

```bash
bun install
cp .env.example .env.local   # add a key, or skip to use the offline keyword fallback
bun run dev                  # http://localhost:3000
```

Keys (any one works, checked in this order):

- `TYPESAFE_AI_API_KEY`: direct TypeSafe API
- `OPENROUTER_API_KEY`: Jev via OpenRouter (`typesafe/jev-1.13`); also streams the LLM answer in the response-depth demo
- `AI_GATEWAY_API_KEY`: Jev via the Vercel AI Gateway

With no key, every demo runs on a keyword fallback so the app still works offline. The header shows which source answered and the real round-trip time. The **Probabilities** switch shows or hides the numbers.

## Where things live

- `lib/jev/use-cases.ts`: the questions for each demo, built on the server, plus the offline fallback
- `lib/jev/server.ts`: picks the model and calls `experimental_evaluate` (the API key never leaves the server)
- `lib/jev/tiers.ts`, `hooks/use-calm.ts`: confidence tiers and the "calm UI" hysteresis
- `components/demos/*`: one component per demo, built with [shadcn/ui](https://ui.shadcn.com)
