"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { PlayIcon } from "@hugeicons/core-free-icons"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress, ProgressLabel } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { JevMeta } from "@/components/jev/indicators"
import { useJevAction, type JevResult } from "@/hooks/use-jev"
import { responseStyle } from "@/lib/jev/response-style"
import { scoreOf } from "@/lib/jev/tiers"
import { cn } from "@/lib/utils"

const TECHNICAL = ["None", "Slight", "Some", "Technical", "Expert"]
const DETAIL = ["One line", "Short", "Normal", "Thorough", "Step by step"]

const DEFAULTS = [
  {
    title: "Asked by a developer",
    message:
      "How do I fix a race condition between useEffect cleanup and an in-flight fetch? Want the AbortController pattern, no preamble.",
  },
  {
    title: "Asked by someone who isn't a coder",
    message:
      "my app sometimes shows old data when I click around fast, not sure why?? im not really a coder",
  },
]

type Run = {
  jev?: JevResult
  style?: ReturnType<typeof responseStyle>
  answer: string
  status: "idle" | "scoring" | "streaming" | "done" | "error"
}

function useDepthRun(initial: string) {
  const [message, setMessage] = React.useState(initial)
  const [run, setRun] = React.useState<Run>({ answer: "", status: "idle" })
  const evaluate = useJevAction()
  const controller = React.useRef<AbortController | null>(null)

  const ask = React.useCallback(async () => {
    const text = message.trim()
    if (!text) return
    controller.current?.abort()
    const abort = (controller.current = new AbortController())
    setRun({ answer: "", status: "scoring" })

    try {
      // 1. Jev scores the message (one call, two Score questions).
      const jev = await evaluate("responseDepth", { message: text }, abort.signal)
      const style = responseStyle(
        scoreOf(jev, "technical")?.score ?? 2,
        scoreOf(jev, "detail")?.score ?? 2
      )
      setRun({ jev, style, answer: "", status: "streaming" })

      // 2. Code turns the scores into an instruction. 3. The big model answers.
      const res = await fetch("/api/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, instruction: style.instruction }),
        signal: abort.signal,
      })
      if (!res.body) throw new Error("No response body")
      const reader = res.body.pipeThrough(new TextDecoderStream()).getReader()
      for (;;) {
        const { done, value } = await reader.read()
        if (done) break
        setRun((prev) => ({ ...prev, answer: prev.answer + value }))
      }
      setRun((prev) => ({ ...prev, status: "done" }))
    } catch (error) {
      if (abort.signal.aborted) return
      setRun((prev) => ({
        ...prev,
        status: "error",
        answer: error instanceof Error ? error.message : String(error),
      }))
    }
  }, [evaluate, message])

  React.useEffect(() => () => controller.current?.abort(), [])

  return { message, setMessage, run, ask }
}

/** Segment 4: the same question asked two ways gets two different answers. */
export function ResponseDepth() {
  const a = useDepthRun(DEFAULTS[0].message)
  const b = useDepthRun(DEFAULTS[1].message)
  const busy = [a, b].some((x) => x.run.status === "scoring" || x.run.status === "streaming")

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">Same bug, two people.</p>
        <Button
          onClick={() => {
            a.ask()
            b.ask()
          }}
          disabled={busy}
        >
          <HugeiconsIcon icon={PlayIcon} strokeWidth={2} data-icon="inline-start" />
          Ask both
        </Button>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <DepthColumn title={DEFAULTS[0].title} {...a} />
        <DepthColumn title={DEFAULTS[1].title} {...b} />
      </div>
    </div>
  )
}

function DepthColumn({
  title,
  message,
  setMessage,
  run,
  ask,
}: ReturnType<typeof useDepthRun> & { title: string }) {
  const technical = scoreOf(run.jev, "technical")
  const detail = scoreOf(run.jev, "detail")
  const busy = run.status === "scoring" || run.status === "streaming"

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardAction>
          <Button variant="ghost" size="xs" onClick={ask} disabled={busy}>
            Ask
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          aria-label={`${title} message`}
          rows={2}
          className="min-h-0"
        />

        <div className="grid grid-cols-2 gap-4">
          <MiniScore label="Technical" score={technical?.score} levels={TECHNICAL} />
          <MiniScore label="Detail wanted" score={detail?.score} levels={DETAIL} />
        </div>

        <div className="flex min-h-10 items-start gap-2 rounded-2xl border px-3 py-2">
          {run.style ? (
            <>
              <Badge className="shrink-0">{run.style.label}</Badge>
              <p className="line-clamp-2 font-mono text-xs text-muted-foreground">
                {run.style.instruction}
              </p>
            </>
          ) : (
            <p className="text-xs text-muted-foreground">
              {run.status === "scoring" ? (
                <span className="shimmer">Jev is scoring…</span>
              ) : (
                "Code picks a style from the two scores."
              )}
            </p>
          )}
        </div>

        <ScrollArea className="h-[max(12rem,calc(100svh-35rem))] rounded-2xl bg-muted/50">
          <p
            className={cn(
              "p-4 text-sm leading-relaxed whitespace-pre-wrap",
              run.status === "error" && "text-destructive",
              !run.answer && "text-muted-foreground"
            )}
          >
            {run.answer ||
              (run.status === "streaming" ? <span className="shimmer">Writing…</span> : "The answer streams in here.")}
          </p>
        </ScrollArea>
      </CardContent>
      <CardFooter>
        <JevMeta result={run.jev} isLoading={run.status === "scoring"} />
      </CardFooter>
    </Card>
  )
}

function MiniScore({
  label,
  score,
  levels,
}: {
  label: string
  score?: number
  levels: string[]
}) {
  return (
    <Progress size="sm" value={score == null ? 0 : (score / (levels.length - 1)) * 100}>
      <ProgressLabel>{label}</ProgressLabel>
      <span className="ml-auto text-xs text-muted-foreground tabular-nums">
        {score == null ? "–" : `${levels[Math.round(score)]} · ${score.toFixed(1)}`}
      </span>
    </Progress>
  )
}
