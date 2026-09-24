"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Search01Icon, Settings01Icon, SparklesIcon } from "@hugeicons/core-free-icons"

import { Badge } from "@/components/ui/badge"
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
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  InputGroup,
  InputGroupAddon,
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
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { DebugOnly, JevMeta, TierBadge } from "@/components/jev/indicators"
import { useJev } from "@/hooks/use-jev"
import { NONE, SETTINGS, byKey, type Setting } from "@/lib/jev/catalog"
import { keywordMatch } from "@/lib/jev/text"
import { TIERS, choiceOf, rank } from "@/lib/jev/tiers"
import { cn } from "@/lib/utils"

const settingsByKey = byKey(SETTINGS)
const EXAMPLES = ["remove animations", "things are too flashy", "make it easier to read", "stop the beeping"]

/** Segment 1a: settings search by intent. */
export function SettingsSearch() {
  const [query, setQuery] = React.useState("")
  const [values, setValues] = React.useState<Record<string, boolean | number>>({
    fontSize: 16,
    lineSpacing: 1.5,
    notifications: true,
    soundEffects: true,
    autoplayVideo: true,
  })
  const trimmed = query.trim()
  const { data, isLoading } = useJev(
    "settings",
    trimmed.length >= 3 ? { query: trimmed } : null
  )

  const keywordResults = keywordMatch(trimmed, SETTINGS, (s) => `${s.label} ${s.group}`)
  // The full probability distribution is the ranking. No embeddings needed.
  const ranked = trimmed.length >= 3
    ? rank(choiceOf(data, "setting"), { exclude: [NONE], min: 0.12, limit: 4 })
    : []
  const best = ranked[0]
  const jevKeys = new Set(ranked.map((r) => r.key))
  const keywordOnly = keywordResults.filter((s) => !jevKeys.has(s.key))

  const rows: { setting: Setting; probability?: number }[] = trimmed
    ? [
        ...ranked.map((r) => ({ setting: settingsByKey[r.key], probability: r.probability })),
        ...keywordOnly.map((setting) => ({ setting })),
      ]
    : SETTINGS.map((setting) => ({ setting }))

  function renderControl(setting: Setting) {
    if (setting.control === "slider") {
      const isFont = setting.key === "fontSize"
      const value = Number(values[setting.key] ?? (isFont ? 16 : 1.5))
      return (
        <div className="flex w-40 items-center gap-3">
          <Slider
            value={[value]}
            min={isFont ? 12 : 1}
            max={isFont ? 24 : 2.5}
            step={isFont ? 1 : 0.1}
            onValueChange={(v) =>
              setValues((prev) => ({ ...prev, [setting.key]: Array.isArray(v) ? v[0] : v }))
            }
            aria-label={setting.label}
          />
          <span className="w-10 text-right text-xs text-muted-foreground tabular-nums">
            {isFont ? `${value}px` : value.toFixed(1)}
          </span>
        </div>
      )
    }
    return (
      <Switch
        checked={Boolean(values[setting.key])}
        onCheckedChange={(checked) => setValues((prev) => ({ ...prev, [setting.key]: checked }))}
        aria-label={setting.label}
      />
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Settings</CardTitle>
        <CardDescription>
          Search by what you want, not by what the setting is called.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <InputGroup>
          <InputGroupAddon>
            <HugeiconsIcon icon={Search01Icon} strokeWidth={2} />
          </InputGroupAddon>
          <InputGroupInput
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search settings…"
            aria-label="Search settings"
          />
          {trimmed && (
            <InputGroupAddon align="inline-end">
              <Badge variant="outline">
                {keywordResults.length} keyword {keywordResults.length === 1 ? "match" : "matches"}
              </Badge>
            </InputGroupAddon>
          )}
        </InputGroup>
        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map((example) => (
            <Button key={example} variant="outline" size="xs" onClick={() => setQuery(example)}>
              {example}
            </Button>
          ))}
        </div>

        {rows.length > 0 ? (
          <ItemGroup className="gap-2">
            {rows.map(({ setting, probability }, i) => (
              <Item
                key={setting.key}
                size="sm"
                variant={probability != null && i === 0 && probability >= TIERS.high ? "outline" : "muted"}
                className={cn(
                  probability != null && probability < TIERS.medium && "opacity-80"
                )}
              >
                <ItemContent>
                  <ItemTitle>
                    {probability != null && (
                      <HugeiconsIcon icon={SparklesIcon} strokeWidth={2} className="size-3.5 text-muted-foreground" />
                    )}
                    {setting.label}
                    <span className="text-xs font-normal text-muted-foreground">{setting.group}</span>
                  </ItemTitle>
                  {trimmed && (
                    <ItemDescription className="line-clamp-1">{setting.description}</ItemDescription>
                  )}
                </ItemContent>
                <ItemActions>
                  {probability != null && (
                    <DebugOnly>
                      <TierBadge probability={probability} />
                    </DebugOnly>
                  )}
                  {renderControl(setting)}
                </ItemActions>
              </Item>
            ))}
          </ItemGroup>
        ) : (
          <Empty className="border">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <HugeiconsIcon icon={Settings01Icon} strokeWidth={2} />
              </EmptyMedia>
              <EmptyTitle>No settings found</EmptyTitle>
              <EmptyDescription>
                {isLoading ? "Asking Jev…" : "Low confidence, so the UI stays out of the way."}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </CardContent>
      <CardFooter className="flex-wrap justify-between gap-2">
        <JevMeta result={data} isLoading={isLoading} />
        {best && best.probability < TIERS.high && (
          <span className="text-xs text-muted-foreground">
            Not confident enough to single one out, so results are ranked.
          </span>
        )}
      </CardFooter>
    </Card>
  )
}
