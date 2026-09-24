"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowUp02Icon,
  Attachment01Icon,
  Globe02Icon,
  Settings01Icon,
  SparklesIcon,
} from "@hugeicons/core-free-icons"

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
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Toggle } from "@/components/ui/toggle"
import { toast } from "@/components/ui/toast"
import {
  DebugOnly,
  JevMeta,
  ProbabilityBars,
  TierBadge,
} from "@/components/jev/indicators"
import { useJevContext } from "@/components/jev/jev-provider"
import { useCalm } from "@/hooks/use-calm"
import { useJev } from "@/hooks/use-jev"
import { COMPOSER_MODES, NONE, SETTINGS, byKey } from "@/lib/jev/catalog"
import {
  choiceOf,
  formatPercent,
  noulOf,
  rank,
  type RankedOption,
} from "@/lib/jev/tiers"
import { cn } from "@/lib/utils"

const modeByKey = byKey(COMPOSER_MODES)
const settingByKey = byKey(SETTINGS)
const MODE_ITEMS = COMPOSER_MODES.map((m) => ({ label: m.label, value: m.key }))

/** Thresholds for the three suggestion states. */
const GHOST_AT = 0.45
const COMMIT_AT = 0.7
const CLOSE_FLOOR = 0.3
const SECOND_FLOOR = 0.25
const SIGNAL_AT = 0.7

const EXAMPLES = [
  { label: "Code", text: "TypeError: Cannot read properties of undefined (reading 'map') in my React list component" },
  { label: "Ghost", text: "Research the best algorithm for scheduling and implement it" },
  { label: "Research + web", text: "What's the latest news on the EU AI Act this week? Compare sources" },
  { label: "About a file", text: "Summarize this PDF and pull out the action items" },
  { label: "Image", text: "Draw a minimal logo for my coffee shop called Ember" },
  { label: "Close call", text: "Is this proof correct? Check my Python implementation of it" },
  { label: "Settings request", text: "The animations are making me dizzy, can you turn them off?" },
  { label: "Unsure", text: "Figure out why our signups dropped last month" },
]

type Suggestion =
  | { kind: "none"; reason: string }
  | { kind: "ghost"; option: RankedOption }
  | { kind: "didYouMean"; options: [RankedOption, RankedOption] }
  | { kind: "committed"; option: RankedOption }

function suggestionFor(
  mode: string,
  ranked: RankedOption[],
  calm: { shown: RankedOption | null; pending: string | null }
): Suggestion {
  const [top, second] = ranked
  if (!top) return { kind: "none", reason: "Type a message" }
  const unsure = {
    kind: "none",
    reason: `Jev is unsure (top answer ${formatPercent(top.probability)}), so it suggests nothing`,
  } as const
  if (top.probability < CLOSE_FLOOR) return unsure
  // Neither option is convincing alone, but both are in play: offer both.
  if (second && top.probability < COMMIT_AT && second.probability >= SECOND_FLOOR) {
    return top.key === mode || second.key === mode
      ? { kind: "none", reason: "The current mode is one of the two front-runners" }
      : { kind: "didYouMean", options: [top, second] }
  }
  if (top.key === mode) return { kind: "none", reason: "Current mode already fits" }
  if (top.probability < GHOST_AT) return unsure
  if (calm.shown?.key === top.key && top.probability >= COMMIT_AT) {
    return { kind: "committed", option: top }
  }
  return { kind: "ghost", option: top }
}

/**
 * Segment 3: a Choice over modes, debounced, only ever *suggested*.
 * Extra Noul questions ride along in the same call.
 */
export function Composer() {
  const [draft, setDraft] = React.useState(EXAMPLES[0].text)
  const [mode, setMode] = React.useState("chat")
  const [web, setWeb] = React.useState(false)
  const [reduceMotion, setReduceMotion] = React.useState(false)
  const { showProbabilities } = useJevContext()
  const trimmed = draft.trim()

  const { data, isLoading } = useJev(
    "composer",
    trimmed.length >= 6 ? { draft: trimmed, currentMode: mode } : null,
    { debounceMs: 300 }
  )
  const ranked = rank(choiceOf(data, "mode"))
  const calm = useCalm(ranked, data, { enter: GHOST_AT, exit: 0.35 })
  const suggestion = suggestionFor(mode, ranked, calm)

  const needsWeb = noulOf(data, "needsWeb") ?? 0
  const aboutFile = noulOf(data, "aboutFile") ?? 0
  const settingsRequest = noulOf(data, "settingsRequest") ?? 0
  const [setting] = rank(choiceOf(data, "setting"), { exclude: [NONE], limit: 1 })
  const settingShortcut =
    settingsRequest >= SIGNAL_AT && setting ? settingByKey[setting.key] : null

  function switchTo(key: string) {
    setMode(key)
    toast.add({ title: `Switched to ${modeByKey[key].label}`, description: "You chose this. Jev only suggested it." })
  }

  function send() {
    if (!trimmed) return
    toast.add({
      title: `Sent with ${modeByKey[mode].label}`,
      description: web ? "Web search on." : undefined,
    })
    setDraft("")
  }

  return (
    <div className={cn("grid items-start gap-6", showProbabilities && "lg:grid-cols-[1fr_20rem]")}>
      <Card>
        <CardHeader>
          <CardTitle>Composer with a mode picker</CardTitle>
          <CardDescription>The mode never changes on its own. At most you get a chip.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              send()
            }}
          >
            <InputGroup>
              <InputGroupTextarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    send()
                  }
                }}
                placeholder="Ask anything…"
                aria-label="Message"
                rows={3}
              />
              <InputGroupAddon align="block-end" className="flex-wrap gap-2">
                <Select items={MODE_ITEMS} value={mode} onValueChange={(value) => value && setMode(value as string)}>
                  <SelectTrigger size="sm" aria-label="Mode">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {MODE_ITEMS.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>

                <ModeSuggestion suggestion={suggestion} onPick={switchTo} />

                <Toggle
                  size="sm"
                  variant="outline"
                  pressed={web}
                  onPressedChange={setWeb}
                  aria-label="Web search"
                  className={cn(!web && needsWeb >= SIGNAL_AT && "border-primary text-primary")}
                >
                  <HugeiconsIcon icon={Globe02Icon} strokeWidth={2} data-icon="inline-start" />
                  Web
                </Toggle>
                <InputGroupButton
                  size="icon-sm"
                  variant="ghost"
                  aria-label="Attach a file"
                  className={cn(aboutFile >= SIGNAL_AT && "bg-muted text-foreground")}
                  onClick={() => toast.add({ title: "File picker (demo)" })}
                >
                  <HugeiconsIcon icon={Attachment01Icon} strokeWidth={2} />
                </InputGroupButton>
                <InputGroupButton
                  type="submit"
                  size="icon-sm"
                  variant="default"
                  className="ml-auto"
                  disabled={!trimmed}
                  aria-label="Send"
                >
                  <HugeiconsIcon icon={ArrowUp02Icon} strokeWidth={2} />
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
          </form>

          {(needsWeb >= SIGNAL_AT && !web) || aboutFile >= SIGNAL_AT ? (
            <div className="flex flex-wrap gap-2">
              {needsWeb >= SIGNAL_AT && !web && (
                <Button variant="outline" size="xs" onClick={() => setWeb(true)}>
                  <HugeiconsIcon icon={Globe02Icon} strokeWidth={2} data-icon="inline-start" />
                  This needs current info. Turn on web search?
                </Button>
              )}
              {aboutFile >= SIGNAL_AT && (
                <Button
                  variant="outline"
                  size="xs"
                  onClick={() => toast.add({ title: "File picker (demo)" })}
                >
                  <HugeiconsIcon icon={Attachment01Icon} strokeWidth={2} data-icon="inline-start" />
                  Asking about a file? Attach it
                </Button>
              )}
            </div>
          ) : null}

          {settingShortcut && (
            <Item variant="outline" size="sm">
              <ItemMedia variant="icon">
                <HugeiconsIcon icon={Settings01Icon} strokeWidth={2} />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>This looks like a settings change</ItemTitle>
                <ItemDescription>
                  {settingShortcut.label}: flip it here instead of asking the assistant.
                </ItemDescription>
              </ItemContent>
              <ItemActions>
                {settingShortcut.key === "reduceMotion" ? (
                  <Switch
                    checked={reduceMotion}
                    onCheckedChange={setReduceMotion}
                    aria-label="Reduce motion"
                  />
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toast.add({ title: `Opened ${settingShortcut.label}` })}
                  >
                    Open
                  </Button>
                )}
              </ItemActions>
            </Item>
          )}

          <div className="flex flex-wrap gap-2">
            {EXAMPLES.map((example) => (
              <Button key={example.label} variant="outline" size="xs" onClick={() => setDraft(example.text)}>
                {example.label}
              </Button>
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <JevMeta result={data} isLoading={isLoading} />
        </CardFooter>
      </Card>

      <DebugOnly>
        <Card size="sm">
          <CardHeader>
            <CardTitle>What Jev returned</CardTitle>
            <CardDescription>
              {suggestion.kind === "none"
                ? suggestion.reason
                : {
                    ghost: "Ghost preview: waiting for a second win or higher confidence",
                    didYouMean: "Two modes are close, so both are offered",
                    committed: "Won twice and is confident: suggestion shown",
                  }[suggestion.kind]}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <ProbabilityBars
              options={ranked.map((option) => ({
                key: option.key,
                label: modeByKey[option.key]?.label ?? option.key,
                probability: option.probability,
              }))}
              highlight={ranked[0]?.key}
            />
            <div className="flex flex-col gap-2 text-sm">
              <SignalRow label="Needs web search" p={needsWeb} />
              <SignalRow label="About a file" p={aboutFile} />
              <SignalRow label="Settings request" p={settingsRequest} />
            </div>
            <p className="text-xs text-muted-foreground tabular-nums">
              Calm UI: shown {calm.shown ? modeByKey[calm.shown.key]?.label : "nothing"}
              {calm.pending && ` · challenger ${modeByKey[calm.pending]?.label} (${calm.streak}/2 wins)`}
            </p>
          </CardContent>
        </Card>
      </DebugOnly>
    </div>
  )
}

function SignalRow({ label, p }: { label: string; p: number }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-muted-foreground">{label}</span>
      <TierBadge probability={p} label="P(yes)" />
    </div>
  )
}

function ModeSuggestion({
  suggestion,
  onPick,
}: {
  suggestion: Suggestion
  onPick: (key: string) => void
}) {
  if (suggestion.kind === "none") return null

  if (suggestion.kind === "ghost") {
    const mode = modeByKey[suggestion.option.key]
    return (
      <InputGroupButton
        size="sm"
        variant="ghost"
        className="border border-dashed opacity-50 hover:opacity-100"
        onClick={() => onPick(mode.key)}
      >
        {mode.label}?
      </InputGroupButton>
    )
  }

  if (suggestion.kind === "didYouMean") {
    return (
      <div className="flex items-center gap-1">
        <span className="text-xs text-muted-foreground">Did you mean</span>
        {suggestion.options.map((option) => (
          <InputGroupButton key={option.key} size="sm" variant="outline" onClick={() => onPick(option.key)}>
            {modeByKey[option.key].label}
            <DebugOnly>
              <span className="text-muted-foreground tabular-nums">{formatPercent(option.probability)}</span>
            </DebugOnly>
          </InputGroupButton>
        ))}
      </div>
    )
  }

  const mode = modeByKey[suggestion.option.key]
  return (
    <InputGroupButton size="sm" variant="secondary" onClick={() => onPick(mode.key)}>
      <HugeiconsIcon icon={SparklesIcon} strokeWidth={2} data-icon="inline-start" />
      Switch to {mode.label}?
      <DebugOnly>
        <Badge variant="outline" className="tabular-nums">
          {formatPercent(suggestion.option.probability)}
        </Badge>
      </DebugOnly>
    </InputGroupButton>
  )
}
