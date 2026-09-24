"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { PlayIcon } from "@hugeicons/core-free-icons"

import { Badge } from "@/components/ui/badge"
import { Bubble, BubbleContent } from "@/components/ui/bubble"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { JevMeta, ScoreMeter } from "@/components/jev/indicators"
import { useJevAction, type JevResult } from "@/hooks/use-jev"
import { responseStyle } from "@/lib/jev/response-style"
import { scoreOf } from "@/lib/jev/tiers"

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
        <p className="text-sm text-muted-foreground">
          Same bug, two people. Run both and compare the answers.
        </p>
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
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          Two Score questions: how technical is the writer, and how much detail
          do they want?
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          aria-label={`${title} message`}
          rows={3}
        />
        <Button variant="outline" onClick={ask} disabled={busy} className="self-start">
          Ask
        </Button>

        {run.status === "scoring" && <p className="shimmer text-sm">Jev is scoring…</p>}

        {technical && detail && run.style && (
          <>
            <ScoreMeter score={technical.score} levels={TECHNICAL} label="Technical" />
            <ScoreMeter score={detail.score} levels={DETAIL} label="Detail wanted" />
            <div className="flex flex-col gap-2 rounded-2xl border p-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                Code picked the style
                <Badge>{run.style.label}</Badge>
              </div>
              <p className="font-mono text-xs">{run.style.instruction}</p>
            </div>
          </>
        )}

        {(run.answer || run.status === "streaming") && (
          <Bubble variant={run.status === "error" ? "destructive" : "muted"} className="max-w-full">
            <BubbleContent className="whitespace-pre-wrap">
              {run.answer || <span className="shimmer">Writing…</span>}
            </BubbleContent>
          </Bubble>
        )}
      </CardContent>
      <CardFooter>
        <JevMeta result={run.jev} isLoading={run.status === "scoring"} />
      </CardFooter>
    </Card>
  )
}
