"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Cancel01Icon,
  PauseIcon,
  PlayIcon,
  PlusSignIcon,
  SentIcon,
  Tick02Icon,
  ViewOffSlashIcon,
} from "@hugeicons/core-free-icons"

import { Badge } from "@/components/ui/badge"
import { Bubble, BubbleContent } from "@/components/ui/bubble"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"
import { Field, FieldContent, FieldDescription, FieldLabel } from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@/components/ui/item"
import { Marker, MarkerContent, MarkerIcon } from "@/components/ui/marker"
import {
  Message,
  MessageContent,
  MessageHeader,
} from "@/components/ui/message"
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller"
import { Progress, ProgressLabel } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { DebugOnly, JevMeta, TierBadge } from "@/components/jev/indicators"
import { useJevAction, type JevResult } from "@/hooks/use-jev"
import { TIERS, formatPercent, noulOf, scoreOf } from "@/lib/jev/tiers"

const GAME = "Elden Ring"
const STREAMER = "mira_plays"
const WINDOW_MS = 1500
const MAX_BATCH = 8
const RATE_LIMIT = 1200
const SEVERITY = ["none", "mild", "moderate", "severe"]

const SCRIPT: [string, string][] = [
  ["tarnished_tom", "LETS GOOO first try Margit 🔥"],
  ["kaiju_kat", "what level are you rn?"],
  ["rollmaster", "just roll through his attacks bro"],
  ["pixelpaula", "gg chat"],
  ["lore_goblin", "wait till you see what happens to Ranni at the ending 👀"],
  ["salty_sam", "you're actually trash at this game, uninstall"],
  ["polite_pete", "wow another death, very entertaining 🙂"],
  ["bardcore", "the music in this area is insane"],
  ["mapguy", "go left, the item is right there"],
  ["runefarm_tv", "free runes on my channel!! check out twitch.tv/runefarm"],
  ["cozy_cleric", "bro is cooked 💀"],
  ["kaiju_kat", "that boss is so dumb lol"],
  ["lore_goblin", "Malenia turns out to be the hardest fight in the game, the final boss is"],
  ["salty_sam", "nobody likes you, just quit streaming"],
  ["hydro_homie", "hydrate check 💧"],
  ["rollmaster", "why don't you use the torrent"],
  ["polite_pete", "must be nice to get carried by summons i guess"],
  ["kaiju_kat", "that dodge was clean"],
  ["pixelpaula", "Pog"],
]

type Rule = { id: string; label: string; text: string; enabled: boolean }

const DEFAULT_RULES: Rule[] = [
  {
    id: "spoilers",
    label: "No spoilers",
    text: "No spoilers about story, endings, characters or boss reveals. The streamer is on a blind first playthrough.",
    enabled: true,
  },
  {
    id: "backseat",
    label: "No backseat gaming",
    text: "No backseat gaming: don't tell the streamer how to play unless they ask.",
    enabled: true,
  },
  {
    id: "passiveAggressive",
    label: "No passive-aggressive digs",
    text: "No passive-aggressive or sarcastic digs at the streamer or other chatters.",
    enabled: true,
  },
]

type Status = "pending" | "ok" | "held" | "hidden" | "approved" | "removed"

type ChatMessage = {
  id: string
  user: string
  text: string
  status: Status
  reason?: string
  probability?: number
  severity?: number
}

type Verdict = Pick<ChatMessage, "status" | "reason" | "probability" | "severity">

/** Code turns probabilities into graduated actions. */
function decide(result: JevResult, batch: ChatMessage[], rules: Rule[]) {
  const verdicts: Record<string, Verdict> = {}
  for (const message of batch) {
    const checks = [
      { label: "Hostile", p: noulOf(result, `${message.id}__hostile`) ?? 0 },
      ...rules.map((rule) => ({
        label: rule.label,
        p: noulOf(result, `${message.id}__rule_${rule.id}`) ?? 0,
      })),
    ]
    const top = checks.reduce((a, b) => (b.p > a.p ? b : a))
    const severity = scoreOf(result, `${message.id}__severity`)?.score ?? 0
    const status: Status =
      top.p >= TIERS.high || severity >= 2.5 ? "hidden" : top.p >= TIERS.medium ? "held" : "ok"
    verdicts[message.id] = { status, reason: top.label, probability: top.p, severity }
  }
  return verdicts
}

/**
 * Segment 6: one Jev call per window of chat, several questions per message.
 * High → hide. Medium → hold for a human. Low → let it through.
 */
export function Moderation() {
  const [messages, setMessages] = React.useState<ChatMessage[]>([])
  const [rules, setRules] = React.useState(DEFAULT_RULES)
  const [playing, setPlaying] = React.useState(false)
  const [draft, setDraft] = React.useState("")
  const [newRule, setNewRule] = React.useState("")
  const [calls, setCalls] = React.useState<{ at: number; size: number }[]>([])
  const [last, setLast] = React.useState<JevResult>()
  const [now, setNow] = React.useState(0)

  const run = useJevAction()
  const queue = React.useRef<ChatMessage[]>([])
  const seq = React.useRef(0)
  const scriptIndex = React.useRef(0)
  const activeRules = React.useRef(rules)

  React.useEffect(() => {
    activeRules.current = rules.filter((rule) => rule.enabled)
  }, [rules])

  const post = React.useCallback((user: string, text: string) => {
    const message: ChatMessage = { id: `m${++seq.current}`, user, text, status: "pending" }
    queue.current.push(message)
    setMessages((prev) => [...prev, message].slice(-60))
  }, [])

  // Scripted chat.
  React.useEffect(() => {
    if (!playing) return
    const timer = setInterval(() => {
      const [user, text] = SCRIPT[scriptIndex.current++ % SCRIPT.length]
      post(user, text)
    }, 800)
    return () => clearInterval(timer)
  }, [playing, post])

  // The batch window: everything that arrived in the last 1.5 s goes in one call.
  React.useEffect(() => {
    const timer = setInterval(async () => {
      setNow(Date.now())
      const batch = queue.current.splice(0, MAX_BATCH)
      if (batch.length === 0) return
      const rulesForBatch = activeRules.current
      try {
        const result = await run("moderation", {
          game: GAME,
          streamer: STREAMER,
          rules: rulesForBatch.map(({ id, text }) => ({ id, text })),
          messages: batch.map(({ id, user, text }) => ({ id, user, text })),
        })
        const verdicts = decide(result, batch, rulesForBatch)
        setLast(result)
        setCalls((prev) => [...prev.filter((c) => c.at > Date.now() - 60_000), { at: Date.now(), size: batch.length }])
        setMessages((prev) => prev.map((m) => (verdicts[m.id] ? { ...m, ...verdicts[m.id] } : m)))
      } catch {
        // Fail open for chat: let the batch through rather than freeze it.
        const ids = new Set(batch.map((m) => m.id))
        setMessages((prev) => prev.map((m) => (ids.has(m.id) ? { ...m, status: "ok" } : m)))
      }
    }, WINDOW_MS)
    return () => clearInterval(timer)
  }, [run])

  const held = messages.filter((m) => m.status === "held")
  const recentCalls = calls.filter((c) => c.at > now - 60_000)
  const perMinute = recentCalls.length
  const avgBatch = recentCalls.length
    ? recentCalls.reduce((sum, c) => sum + c.size, 0) / recentCalls.length
    : 0
  const questionsPerMessage = 2 + rules.filter((r) => r.enabled).length

  function setStatus(id: string, status: Status) {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, status } : m)))
  }

  function addRule(event: React.FormEvent) {
    event.preventDefault()
    const text = newRule.trim()
    if (!text) return
    const id = `custom${rules.length + 1}`
    setRules((prev) => [...prev, { id, label: text.length > 32 ? `${text.slice(0, 30)}…` : text, text, enabled: true }])
    setNewRule("")
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_22rem]">
      <Card className="min-w-0">
        <CardHeader>
          <CardTitle>
            {STREAMER} · {GAME}
          </CardTitle>
          <CardDescription>
            Messages are grouped into {WINDOW_MS / 1000} s windows, and each
            window is one Jev call. That&apos;s {questionsPerMessage} questions
            per message.
          </CardDescription>
          <CardAction>
            <Button variant={playing ? "secondary" : "default"} onClick={() => setPlaying((p) => !p)}>
              <HugeiconsIcon icon={playing ? PauseIcon : PlayIcon} strokeWidth={2} data-icon="inline-start" />
              {playing ? "Pause chat" : "Start chat"}
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <MessageScrollerProvider autoScroll>
            <MessageScroller className="h-[28rem] rounded-2xl bg-muted/50">
              <MessageScrollerViewport>
                <MessageScrollerContent className="gap-3 p-4">
                  {messages.length === 0 && (
                    <MessageScrollerItem messageId="empty">
                      <Marker variant="separator">
                        <MarkerContent>Press Start chat, or type a message below</MarkerContent>
                      </Marker>
                    </MessageScrollerItem>
                  )}
                  {messages.map((message) => (
                    <MessageScrollerItem key={message.id} messageId={message.id}>
                      <ChatRow message={message} />
                    </MessageScrollerItem>
                  ))}
                </MessageScrollerContent>
              </MessageScrollerViewport>
              <MessageScrollerButton />
            </MessageScroller>
          </MessageScrollerProvider>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (!draft.trim()) return
              post("you", draft.trim())
              setDraft("")
            }}
          >
            <InputGroup>
              <InputGroupInput
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Send a chat message to test the rules…"
                aria-label="Chat message"
              />
              <InputGroupAddon align="inline-end">
                <InputGroupButton type="submit" size="icon-xs" aria-label="Send">
                  <HugeiconsIcon icon={SentIcon} strokeWidth={2} />
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
          </form>
        </CardContent>
        <CardFooter>
          <JevMeta result={last} />
        </CardFooter>
      </Card>

      <div className="flex min-w-0 flex-col gap-6">
        <Card size="sm">
          <CardHeader>
            <CardTitle>Held for mod review</CardTitle>
            <CardDescription>Medium confidence goes to a human.</CardDescription>
          </CardHeader>
          <CardContent>
            {held.length === 0 ? (
              <Empty className="py-6">
                <EmptyHeader>
                  <EmptyTitle>Queue is empty</EmptyTitle>
                  <EmptyDescription>Nothing uncertain right now.</EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <ItemGroup className="gap-2">
                {held.map((message) => (
                  <Item key={message.id} size="xs" variant="outline">
                    <ItemContent>
                      <ItemTitle>{message.user}</ItemTitle>
                      <ItemDescription className="line-clamp-2">{message.text}</ItemDescription>
                      <DebugOnly>
                        <span className="text-xs text-muted-foreground tabular-nums">
                          {message.reason} {formatPercent(message.probability ?? 0)}
                        </span>
                      </DebugOnly>
                    </ItemContent>
                    <ItemActions>
                      <Button size="icon-xs" variant="outline" aria-label="Approve" onClick={() => setStatus(message.id, "approved")}>
                        <HugeiconsIcon icon={Tick02Icon} strokeWidth={2} />
                      </Button>
                      <Button size="icon-xs" variant="destructive" aria-label="Remove" onClick={() => setStatus(message.id, "removed")}>
                        <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} />
                      </Button>
                    </ItemActions>
                  </Item>
                ))}
              </ItemGroup>
            )}
          </CardContent>
        </Card>

        <Card size="sm">
          <CardHeader>
            <CardTitle>Channel rules</CardTitle>
            <CardDescription>Written in plain English. Each one is a yes/no question.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {rules.map((rule) => (
              <Field key={rule.id} orientation="horizontal">
                <FieldContent>
                  <FieldLabel htmlFor={`rule-${rule.id}`}>{rule.label}</FieldLabel>
                  <FieldDescription className="line-clamp-2">{rule.text}</FieldDescription>
                </FieldContent>
                <Switch
                  id={`rule-${rule.id}`}
                  checked={rule.enabled}
                  onCheckedChange={(enabled) =>
                    setRules((prev) => prev.map((r) => (r.id === rule.id ? { ...r, enabled } : r)))
                  }
                />
              </Field>
            ))}
            <form onSubmit={addRule}>
              <InputGroup>
                <InputGroupInput
                  value={newRule}
                  onChange={(e) => setNewRule(e.target.value)}
                  placeholder="e.g. No self-promotion or links to other channels"
                  aria-label="New rule"
                />
                <InputGroupAddon align="inline-end">
                  <InputGroupButton type="submit" size="icon-xs" aria-label="Add rule">
                    <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} />
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
            </form>
          </CardContent>
        </Card>

        <Card size="sm">
          <CardHeader>
            <CardTitle>Throughput</CardTitle>
            <CardDescription>Batching keeps you under the early-access rate limit.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 tabular-nums">
            <Progress size="sm" value={(perMinute / RATE_LIMIT) * 100}>
              <ProgressLabel>
                {perMinute} / {RATE_LIMIT.toLocaleString()} calls per minute
              </ProgressLabel>
            </Progress>
            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
              <span>{avgBatch.toFixed(1)} messages per call</span>
              <span>{last ? `${Math.round(last.latencyMs)} ms last call` : "no calls yet"}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              One call every {WINDOW_MS / 1000} s is {60 / (WINDOW_MS / 1000)} calls a
              minute per channel, so one key covers about{" "}
              {Math.floor(RATE_LIMIT / (60 / (WINDOW_MS / 1000)))} busy channels.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function ChatRow({ message }: { message: ChatMessage }) {
  if (message.status === "hidden" || message.status === "removed") {
    return (
      <Marker className="text-xs">
        <MarkerIcon>
          <HugeiconsIcon icon={ViewOffSlashIcon} strokeWidth={2} />
        </MarkerIcon>
        <MarkerContent>
          Message from {message.user} {message.status === "removed" ? "removed by a mod" : "hidden"}
          {message.status === "hidden" && ` · ${message.reason}`}
          {message.status === "hidden" && message.severity !== undefined && (
            <DebugOnly>
              {` · severity ${SEVERITY[Math.round(message.severity)]} · ${formatPercent(message.probability ?? 0)}`}
            </DebugOnly>
          )}
        </MarkerContent>
      </Marker>
    )
  }

  return (
    <Message>
      <MessageContent className="gap-1">
        <MessageHeader className="gap-2">
          {message.user}
          {message.status === "held" && <Badge variant="secondary">Held for mod review</Badge>}
          {message.status === "approved" && <Badge variant="outline">Approved by mod</Badge>}
        </MessageHeader>
        <Bubble
          variant={message.status === "held" ? "outline" : message.user === "you" ? "tinted" : "muted"}
          className={message.status === "pending" ? "opacity-60" : undefined}
        >
          <BubbleContent className="py-1.5">{message.text}</BubbleContent>
        </Bubble>
        {message.status === "held" && message.probability !== undefined && (
          <DebugOnly>
            <TierBadge probability={message.probability} label={message.reason} className="self-start" />
          </DebugOnly>
        )}
      </MessageContent>
    </Message>
  )
}
