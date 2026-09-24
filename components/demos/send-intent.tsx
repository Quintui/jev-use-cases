"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Clock01Icon, SentIcon } from "@hugeicons/core-free-icons"

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
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group"
import { Marker, MarkerContent, MarkerIcon } from "@/components/ui/marker"
import {
  Message,
  MessageContent,
  MessageFooter,
} from "@/components/ui/message"
import {
  MessageScroller,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller"
import { DebugOnly, JevMeta, TierBadge } from "@/components/jev/indicators"
import { useJev } from "@/hooks/use-jev"
import { noulOf } from "@/lib/jev/tiers"
import { formatWhen, parseTime } from "@/lib/parse-time"

/** Above this, the button becomes Schedule. Between the two, it's only offered. */
const SCHEDULE_AT = 0.7
const OFFER_AT = 0.4

const EXAMPLES = [
  "Happy birthday Sam!! 🎉 hope you have the best day. Send tomorrow at 9",
  "Good morning team 👋 standup in 5 min, link is pinned. Send tomorrow at 8:55",
  "See you tomorrow at 9!",
  "Can we move our call to tomorrow at 9? Something came up",
]

type Sent = { id: number; text: string; at: Date | null }

/**
 * Code finds the time (dates have a right answer). Jev answers the fuzzy
 * part: does the sender want this *delivered* then, or just mention it?
 */
export function SendIntent() {
  const [draft, setDraft] = React.useState(EXAMPLES[0])
  const [sent, setSent] = React.useState<Sent[]>([
    { id: 1, text: "Morning! Slides are in the shared drive.", at: null },
  ])
  const trimmed = draft.trim()
  const when = React.useMemo(() => (trimmed ? parseTime(trimmed) : null), [trimmed])

  // No time in the text → no call. The cheap check gates the model.
  const { data, isLoading, isFresh } = useJev(
    "sendIntent",
    when ? { message: trimmed } : null,
    { debounceMs: 250 }
  )
  const p = when && isFresh ? (noulOf(data, "sendLater") ?? 0) : 0
  const schedule = when && p >= SCHEDULE_AT ? when : null
  const offer = when && !schedule && p >= OFFER_AT ? when : null

  function send(at: Date | null) {
    if (!trimmed) return
    setSent((prev) => [...prev, { id: Date.now(), text: trimmed, at }])
    setDraft("")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Send → Schedule</CardTitle>
        <CardDescription>
          If a message names a time, code parses the time. Jev then answers
          one yes/no question: does the sender want it delivered at that time?
          Only a confident yes changes the button.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <MessageScrollerProvider autoScroll>
          <MessageScroller className="h-48 rounded-2xl bg-muted/50">
            <MessageScrollerViewport>
              <MessageScrollerContent className="gap-3 p-4">
                {sent.map((message) => (
                  <MessageScrollerItem key={message.id} messageId={String(message.id)}>
                    <Message align="end">
                      <MessageContent>
                        <Bubble variant={message.at ? "outline" : "default"} align="end">
                          <BubbleContent>{message.text}</BubbleContent>
                        </Bubble>
                        <MessageFooter>
                          {message.at ? (
                            <Marker className="w-fit text-xs">
                              <MarkerIcon>
                                <HugeiconsIcon icon={Clock01Icon} strokeWidth={2} />
                              </MarkerIcon>
                              <MarkerContent>Scheduled · {formatWhen(message.at)}</MarkerContent>
                            </Marker>
                          ) : (
                            "Sent"
                          )}
                        </MessageFooter>
                      </MessageContent>
                    </Message>
                  </MessageScrollerItem>
                ))}
              </MessageScrollerContent>
            </MessageScrollerViewport>
          </MessageScroller>
        </MessageScrollerProvider>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            send(schedule)
          }}
        >
          <InputGroup>
            <InputGroupTextarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  send(schedule)
                }
              }}
              placeholder="Write a message…"
              aria-label="Message"
              rows={2}
            />
            <InputGroupAddon align="block-end" className="flex-wrap">
              {offer && (
                <InputGroupButton variant="outline" size="sm" onClick={() => send(offer)}>
                  <HugeiconsIcon icon={Clock01Icon} strokeWidth={2} data-icon="inline-start" />
                  Schedule for {formatWhen(offer)}?
                </InputGroupButton>
              )}
              <div className="ml-auto flex items-center gap-2">
                {schedule && (
                  <InputGroupButton variant="ghost" size="sm" onClick={() => send(null)}>
                    Send now
                  </InputGroupButton>
                )}
                <InputGroupButton type="submit" variant="default" size="sm" disabled={!trimmed}>
                  <HugeiconsIcon
                    icon={schedule ? Clock01Icon : SentIcon}
                    strokeWidth={2}
                    data-icon="inline-start"
                  />
                  {schedule ? `Schedule · ${formatWhen(schedule)}` : "Send"}
                </InputGroupButton>
              </div>
            </InputGroupAddon>
          </InputGroup>
        </form>

        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map((example) => (
            <Button key={example} variant="outline" size="xs" onClick={() => setDraft(example)}>
              {example}
            </Button>
          ))}
        </div>

        <div className="flex min-h-6 flex-wrap items-center gap-2 text-sm">
          {when ? (
            <>
              <Badge variant="outline">Time parsed by code: {formatWhen(when)}</Badge>
              {isFresh && data && (
                <DebugOnly>
                  <TierBadge probability={p} label="Jev: send later?" />
                </DebugOnly>
              )}
            </>
          ) : (
            trimmed && (
              <span className="text-muted-foreground">
                No time found, so Jev isn&apos;t called.
              </span>
            )
          )}
        </div>
      </CardContent>
      <CardFooter>
        <JevMeta result={when ? data : undefined} isLoading={isLoading} />
      </CardFooter>
    </Card>
  )
}
