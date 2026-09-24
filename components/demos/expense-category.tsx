"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { PlusSignIcon, Undo02Icon } from "@hugeicons/core-free-icons"

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
import { Input } from "@/components/ui/input"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
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
import { DebugOnly, JevMeta, TierBadge } from "@/components/jev/indicators"
import { useJev } from "@/hooks/use-jev"
import { EXPENSE_CATEGORIES, byKey } from "@/lib/jev/catalog"
import { TIERS, choiceOf, formatPercent, rank } from "@/lib/jev/tiers"

const categoryByKey = byKey(EXPENSE_CATEGORIES)

const SELECT_ITEMS = [
  { label: "Needs review", value: null },
  ...EXPENSE_CATEGORIES.map((c) => ({ label: `${c.emoji} ${c.label}`, value: c.key })),
]

/** Layer 1: an exact dictionary. Free, instant, and never wrong. */
const DICTIONARY: Record<string, string> = {
  uber: "transport",
  lyft: "transport",
  bolt: "transport",
  shell: "transport",
  netflix: "entertainment",
  spotify: "entertainment",
  steam: "entertainment",
  rent: "housing",
  ikea: "housing",
  airbnb: "travel",
  ryanair: "travel",
  starbucks: "dining",
  "whole foods": "groceries",
  lidl: "groceries",
  amazon: "shopping",
}

type Layer = "dictionary" | "history" | "jev" | "you" | "review"

const LAYER_LABEL: Record<Layer, string> = {
  dictionary: "Dictionary",
  history: "Your history",
  jev: "Jev",
  you: "You",
  review: "Needs review",
}

type Expense = { id: number; title: string; category: string | null; layer: Layer }

const normalize = (text: string) => text.trim().toLowerCase().replace(/\s+/g, " ")

function fromDictionary(title: string) {
  const text = normalize(title)
  const hit = Object.keys(DICTIONARY).find((word) =>
    new RegExp(`(^|\\W)${word}(\\W|$)`).test(text)
  )
  return hit ? DICTIONARY[hit] : null
}

function fromHistory(title: string, expenses: Expense[]) {
  const text = normalize(title)
  return (
    expenses.find((e) => e.category && e.layer !== "review" && normalize(e.title) === text)
      ?.category ?? null
  )
}

/**
 * Cheapest layer first: exact match → the user's own history → Jev → review.
 * Jev only runs when the free layers have nothing to say.
 */
export function ExpenseCategory() {
  const [title, setTitle] = React.useState("Team offsite lunch")
  const [override, setOverride] = React.useState<{ category: string | null } | null>(null)
  const [expenses, setExpenses] = React.useState<Expense[]>([
    { id: 3, title: "Figma", category: "work", layer: "you" },
    { id: 2, title: "Uber to airport", category: "transport", layer: "dictionary" },
    { id: 1, title: "Mom's birthday flowers", category: "gifts", layer: "jev" },
  ])

  const trimmed = title.trim()
  const dictionary = trimmed ? fromDictionary(trimmed) : null
  const history = trimmed && !dictionary ? fromHistory(trimmed, expenses) : null
  const needsJev = trimmed.length >= 3 && !dictionary && !history

  const { data, isLoading, isFresh } = useJev(
    "expenseCategory",
    needsJev
      ? {
          title: trimmed,
          history: expenses
            .filter((e) => e.category && e.layer !== "review")
            .slice(0, 20)
            .map((e) => ({ title: e.title, category: e.category as string })),
        }
      : null,
    { debounceMs: 250 }
  )
  const ranked = needsJev && isFresh ? rank(choiceOf(data, "category")) : []
  const [top] = ranked
  const suggestions = top && top.probability < TIERS.high ? ranked.slice(0, 2) : []

  const auto: { category: string | null; layer: Layer } = dictionary
    ? { category: dictionary, layer: "dictionary" }
    : history
      ? { category: history, layer: "history" }
      : top && top.probability >= TIERS.high
        ? { category: top.key, layer: "jev" }
        : { category: null, layer: "review" }

  const decided = override
    ? { category: override.category, layer: override.category ? ("you" as Layer) : ("review" as Layer) }
    : auto

  function changeTitle(value: string) {
    setTitle(value)
    setOverride(null)
  }

  function add(event: React.FormEvent) {
    event.preventDefault()
    if (!trimmed) return
    setExpenses((prev) => [{ id: Date.now(), title: trimmed, ...decided }, ...prev])
    setTitle("")
    setOverride(null)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Expense → category</CardTitle>
        <CardDescription>
          The cheap layers run first: an exact match, then your own history.
          Jev only runs when both miss. If it isn&apos;t sure, the expense goes
          to review instead of getting a guess.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <form onSubmit={add} className="flex flex-col gap-3 sm:flex-row">
          <Input
            value={title}
            onChange={(e) => changeTitle(e.target.value)}
            placeholder="What did you pay for?"
            aria-label="Expense title"
          />
          <Select
            items={SELECT_ITEMS}
            value={decided.category}
            onValueChange={(value) => setOverride({ category: value as string | null })}
          >
            <SelectTrigger className="w-full sm:w-48" aria-label="Category">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {SELECT_ITEMS.map((item) => (
                  <SelectItem key={item.value ?? "none"} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Button type="submit">
            <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} data-icon="inline-start" />
            Add
          </Button>
        </form>

        <div className="flex min-h-8 flex-wrap items-center gap-2 text-sm">
          {trimmed && (
            <>
              <span className="text-muted-foreground">Decided by</span>
              <Badge variant={decided.layer === "review" ? "outline" : "secondary"}>
                {LAYER_LABEL[decided.layer]}
                {decided.layer === "jev" && top && ` ${formatPercent(top.probability)}`}
              </Badge>
              {decided.layer === "jev" && (
                <Button variant="ghost" size="xs" onClick={() => setOverride({ category: null })}>
                  <HugeiconsIcon icon={Undo02Icon} strokeWidth={2} data-icon="inline-start" />
                  Undo
                </Button>
              )}
              {!override && decided.layer === "review" && suggestions.length > 0 && (
                <>
                  <span className="text-muted-foreground">Maybe:</span>
                  {suggestions.map((option) => (
                    <Button
                      key={option.key}
                      variant="outline"
                      size="xs"
                      onClick={() => setOverride({ category: option.key })}
                    >
                      {categoryByKey[option.key].emoji} {categoryByKey[option.key].label}
                      <DebugOnly>
                        <span className="text-muted-foreground tabular-nums">
                          {formatPercent(option.probability)}
                        </span>
                      </DebugOnly>
                    </Button>
                  ))}
                </>
              )}
            </>
          )}
        </div>

        <ItemGroup className="gap-2">
          {expenses.map((expense) => {
            const category = expense.category ? categoryByKey[expense.category] : null
            return (
              <Item key={expense.id} size="xs" variant="muted">
                <ItemMedia className="text-lg">{category?.emoji ?? "❔"}</ItemMedia>
                <ItemContent>
                  <ItemTitle>{expense.title}</ItemTitle>
                  <ItemDescription>{category?.label ?? "Uncategorized"}</ItemDescription>
                </ItemContent>
                <ItemActions>
                  <Badge variant={expense.layer === "review" ? "destructive" : "outline"}>
                    {LAYER_LABEL[expense.layer]}
                  </Badge>
                </ItemActions>
              </Item>
            )
          })}
        </ItemGroup>
        <p className="text-xs text-muted-foreground">
          Add a new title, fix its category, then type it again. This time the
          history layer answers, and Jev isn&apos;t called at all.
        </p>
      </CardContent>
      <CardFooter className="flex-wrap gap-2">
        {needsJev && top && (
          <DebugOnly>
            <TierBadge probability={top.probability} label={categoryByKey[top.key]?.label} />
          </DebugOnly>
        )}
        <JevMeta result={needsJev ? data : undefined} isLoading={isLoading} />
      </CardFooter>
    </Card>
  )
}
