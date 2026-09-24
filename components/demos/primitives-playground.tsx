"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { InputGroup, InputGroupTextarea } from "@/components/ui/input-group"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  JevMeta,
  ProbabilityBars,
  ScoreMeter,
  TierBadge,
} from "@/components/jev/indicators"
import { useJev } from "@/hooks/use-jev"
import { NONE, SETTINGS, byKey } from "@/lib/jev/catalog"
import { choiceOf, noulOf, rank, scoreOf } from "@/lib/jev/tiers"

const settingsByKey = byKey(SETTINGS)
const EXAMPLES = [
  "remove animations",
  "why does useEffect cleanup race my fetch()",
  "you're so trash, uninstall",
  "make it easier to read",
]

export function PrimitivesPlayground() {
  const [text, setText] = React.useState(EXAMPLES[0])
  const trimmed = text.trim()
  const { data, isLoading } = useJev("primitives", trimmed ? { text: trimmed } : null)

  const choice = rank(choiceOf(data, "setting"), { limit: 3 })
  const technical = scoreOf(data, "technical")
  const toxic = noulOf(data, "toxic")

  return (
    <Card>
      <CardHeader>
        <CardTitle>One state, three questions, one call</CardTitle>
        <CardDescription>
          Type anything. Jev answers a Choice, a Score and a Noul together,
          each with a probability.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <InputGroup>
            <InputGroupTextarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type a message…"
              rows={2}
              aria-label="Message"
            />
          </InputGroup>
          <div className="flex flex-wrap gap-2">
            {EXAMPLES.map((example) => (
              <Button key={example} variant="outline" size="xs" onClick={() => setText(example)}>
                {example}
              </Button>
            ))}
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Card size="sm" className="shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Badge variant="secondary">Choice</Badge>
              </CardTitle>
              <CardDescription>Which setting does the user want?</CardDescription>
            </CardHeader>
            <CardContent>
              {data ? (
                <ProbabilityBars
                  highlight={choice[0]?.key}
                  options={choice.map((o) => ({
                    key: o.key,
                    probability: o.probability,
                    label: o.key === NONE ? "None of these" : settingsByKey[o.key]?.label,
                  }))}
                />
              ) : (
                <Skeleton className="h-20" />
              )}
            </CardContent>
          </Card>
          <Card size="sm" className="shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Badge variant="secondary">Score</Badge>
              </CardTitle>
              <CardDescription>How technical is this message?</CardDescription>
            </CardHeader>
            <CardContent>
              {technical ? (
                <ScoreMeter
                  label="Technical"
                  score={technical.score}
                  levels={["none", "slight", "some", "high", "expert"]}
                />
              ) : (
                <Skeleton className="h-20" />
              )}
            </CardContent>
          </Card>
          <Card size="sm" className="shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Badge variant="secondary">Noul</Badge>
              </CardTitle>
              <CardDescription>Is this chat message toxic?</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {toxic != null ? (
                <>
                  <p className="font-heading text-3xl font-semibold tabular-nums">
                    P(yes) = {toxic.toFixed(2)}
                  </p>
                  <TierBadge
                    probability={Math.max(toxic, 1 - toxic)}
                    label={toxic >= 0.5 ? "Yes" : "No"}
                  />
                </>
              ) : (
                <Skeleton className="h-20" />
              )}
            </CardContent>
          </Card>
        </div>
      </CardContent>
      <CardFooter>
        <JevMeta result={data} isLoading={isLoading} />
      </CardFooter>
    </Card>
  )
}
