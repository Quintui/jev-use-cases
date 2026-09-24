"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { ComputerTerminal01Icon, Search01Icon } from "@hugeicons/core-free-icons"

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
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Item, ItemContent, ItemGroup, ItemTitle } from "@/components/ui/item"
import { Kbd } from "@/components/ui/kbd"
import { DebugOnly, JevMeta, TierBadge } from "@/components/jev/indicators"
import { useJev, useJevAction, type JevResult } from "@/hooks/use-jev"
import { CLI_COMMANDS, COMMANDS, NONE, byKey } from "@/lib/jev/catalog"
import { keywordMatch } from "@/lib/jev/text"
import { TIERS, choiceOf, formatPercent, rank } from "@/lib/jev/tiers"

const commandsByKey = byKey(COMMANDS)

/** "Did you mean?" instead of an empty state. */
export function NoResultsSearch() {
  const [query, setQuery] = React.useState("save as pdf")
  const trimmed = query.trim()
  const results = keywordMatch(trimmed, COMMANDS, (c) => c.label)
  const { data, isLoading } = useJev(
    "commands",
    trimmed.length >= 3 && results.length === 0 ? { query: trimmed, screen: "Search" } : null
  )
  const [best] = rank(choiceOf(data, "command"), { exclude: [NONE], limit: 1 })
  const suggestion = results.length === 0 && best && best.probability >= TIERS.medium ? best : null

  return (
    <Card>
      <CardHeader>
        <CardTitle>Search with no results</CardTitle>
        <CardDescription>Keyword search finds nothing, so Jev offers the nearest action.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <InputGroup>
          <InputGroupAddon>
            <HugeiconsIcon icon={Search01Icon} strokeWidth={2} />
          </InputGroupAddon>
          <InputGroupInput
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search actions…"
            aria-label="Search actions"
          />
        </InputGroup>
        {trimmed && results.length > 0 ? (
          <ItemGroup className="gap-2">
            {results.map((command) => (
              <Item key={command.key} size="sm" variant="muted">
                <ItemContent>
                  <ItemTitle>{command.label}</ItemTitle>
                </ItemContent>
              </Item>
            ))}
          </ItemGroup>
        ) : (
          <Empty className="border">
            <EmptyHeader>
              <EmptyTitle>No results for &ldquo;{trimmed}&rdquo;</EmptyTitle>
              {!suggestion && (
                <EmptyDescription>
                  {isLoading ? "Checking what you meant…" : "Try a different word."}
                </EmptyDescription>
              )}
            </EmptyHeader>
            {suggestion && (
              <EmptyContent>
                <Button variant="secondary" onClick={() => setQuery(commandsByKey[suggestion.key].label)}>
                  Did you mean: {commandsByKey[suggestion.key].label}?
                </Button>
                <DebugOnly>
                  <TierBadge probability={suggestion.probability} />
                </DebugOnly>
              </EmptyContent>
            )}
          </Empty>
        )}
      </CardContent>
      <CardFooter>
        <JevMeta result={data} isLoading={isLoading} />
      </CardFooter>
    </Card>
  )
}

type Line =
  | { kind: "input"; text: string }
  | { kind: "output"; text: string }
  | { kind: "suggest"; text: string; command: string; probability: number }

const KNOWN = new Set(CLI_COMMANDS.map((c) => c.key))

/** A CLI wrapper: `git record` → `git commit`, `npm add` → `npm install`. */
export function CliDidYouMean() {
  const [input, setInput] = React.useState("")
  const [lines, setLines] = React.useState<Line[]>([
    { kind: "output", text: "Try: git record, npm add react, git undo, npm start, git upload" },
  ])
  const [pending, setPending] = React.useState<string | null>(null)
  const [last, setLast] = React.useState<JevResult>()
  const [busy, setBusy] = React.useState(false)
  const run = useJevAction()

  const known = (typed: string) =>
    [...KNOWN].find((cmd) => typed === cmd || typed.startsWith(`${cmd} `))

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    const typed = input.trim()
    setInput("")

    if (!typed && pending) {
      setLines((prev) => [...prev, { kind: "input", text: pending }, { kind: "output", text: `✓ ran ${pending} (demo)` }])
      setPending(null)
      return
    }
    if (!typed) return
    setPending(null)
    setLines((prev) => [...prev, { kind: "input", text: typed }])

    if (known(typed)) {
      setLines((prev) => [...prev, { kind: "output", text: `✓ ran ${typed} (demo)` }])
      return
    }

    setBusy(true)
    try {
      const result = await run("cli", { input: typed })
      setLast(result)
      const [top, second] = rank(choiceOf(result, "command"), { exclude: [NONE], limit: 2 })
      const [tool, verb] = typed.split(/\s+/)
      const error = `${tool}: '${verb ?? tool}' is not a ${tool} command.`
      if (top && top.probability >= TIERS.high) {
        setPending(top.key)
        setLines((prev) => [
          ...prev,
          { kind: "output", text: error },
          { kind: "suggest", text: "Did you mean", command: top.key, probability: top.probability },
        ])
      } else if (top && top.probability >= TIERS.medium) {
        setLines((prev) => [
          ...prev,
          { kind: "output", text: error },
          {
            kind: "output",
            text: `The most similar commands are:\n    ${[top, second].filter(Boolean).map((c) => c.key).join("\n    ")}`,
          },
        ])
      } else {
        setLines((prev) => [...prev, { kind: "output", text: `command not found: ${typed}` }])
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HugeiconsIcon icon={ComputerTerminal01Icon} strokeWidth={2} className="size-4" />
          Failed command → nearest by meaning
        </CardTitle>
        <CardDescription>
          <code>git record</code> → <code>git commit</code>, by meaning, not spelling.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex h-64 flex-col gap-1 overflow-y-auto rounded-2xl bg-muted p-4 font-mono text-xs">
          {lines.map((line, i) =>
            line.kind === "input" ? (
              <p key={i}>
                <span className="text-muted-foreground">$ </span>
                {line.text}
              </p>
            ) : line.kind === "suggest" ? (
              <p key={i} className="flex flex-wrap items-center gap-2">
                <span>
                  {line.text} <span className="font-semibold">{line.command}</span>? Press <Kbd>Enter</Kbd> to run it.
                </span>
                <DebugOnly>
                  <span className="text-muted-foreground">({formatPercent(line.probability)})</span>
                </DebugOnly>
              </p>
            ) : (
              <p key={i} className="whitespace-pre-wrap text-muted-foreground">
                {line.text}
              </p>
            )
          )}
          <form onSubmit={submit} className="flex items-center gap-1">
            <span className="text-muted-foreground">$</span>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-transparent outline-none"
              placeholder={pending ? `Enter to run ${pending}` : "type a command"}
              aria-label="Terminal input"
              disabled={busy}
              autoComplete="off"
              spellCheck={false}
            />
          </form>
        </div>
      </CardContent>
      <CardFooter>
        <JevMeta result={last} isLoading={busy} />
      </CardFooter>
    </Card>
  )
}
