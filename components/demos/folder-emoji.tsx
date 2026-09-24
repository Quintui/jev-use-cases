"use client"

import * as React from "react"

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
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  Item,
  ItemContent,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"
import { DebugOnly, JevMeta, TierBadge } from "@/components/jev/indicators"
import { useCalm } from "@/hooks/use-calm"
import { useJev } from "@/hooks/use-jev"
import { FOLDER_EMOJI, byKey } from "@/lib/jev/catalog"
import { TIERS, choiceOf, rank } from "@/lib/jev/tiers"
import { cn } from "@/lib/utils"

const emojiByKey = byKey(FOLDER_EMOJI)

const EXAMPLES = ["Q3 sales reports", "Lisbon trip", "Grandma's recipes", "Stuff"]

type Folder = { name: string; emoji: string; pickedByHand: boolean }

/** Folder name → icon from a curated set, never overwriting a hand-picked one. */
export function FolderEmoji() {
  const [name, setName] = React.useState("Q3 sales reports")
  const [manual, setManual] = React.useState<string | null>(null)
  const [folders, setFolders] = React.useState<Folder[]>([
    { name: "Taxes 2025", emoji: "💰", pickedByHand: false },
    { name: "Lisbon trip", emoji: "✈️", pickedByHand: false },
    { name: "Stuff", emoji: "🦄", pickedByHand: true },
  ])
  const trimmed = name.trim()
  const { data, isLoading } = useJev(
    "folderEmoji",
    !manual && trimmed.length >= 2 ? { name: trimmed } : null
  )
  const ranked = rank(choiceOf(data, "icon"))
  const calm = useCalm(ranked, data, { enter: TIERS.medium, exit: 0.4 })
  const shown = calm.shown

  const autoApplied = shown && shown.probability >= TIERS.high
  const emoji = manual ?? (autoApplied ? emojiByKey[shown.key].emoji : "📁")
  const ghost = !manual && shown && !autoApplied ? emojiByKey[shown.key].emoji : null

  function create(event: React.FormEvent) {
    event.preventDefault()
    if (!trimmed) return
    setFolders((prev) => [{ name: trimmed, emoji, pickedByHand: Boolean(manual) }, ...prev])
    setName("")
    setManual(null)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Folder name → icon</CardTitle>
        <CardDescription>Picks an icon as you type. Choose one yourself and Jev stops touching it.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <form onSubmit={create} className="flex gap-2">
          <InputGroup>
            <InputGroupAddon>
              <Popover>
                <PopoverTrigger
                  render={<InputGroupButton size="icon-sm" aria-label="Pick icon" />}
                >
                  <span className={cn("text-lg", ghost && "opacity-40")}>{ghost ?? emoji}</span>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-72">
                  <PopoverHeader>
                    <PopoverTitle>Pick an icon</PopoverTitle>
                  </PopoverHeader>
                  <div className="grid grid-cols-8 gap-1">
                    {FOLDER_EMOJI.map((option) => (
                      <Button
                        key={option.key}
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setManual(option.emoji)}
                        aria-label={option.description}
                      >
                        {option.emoji}
                      </Button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </InputGroupAddon>
            <InputGroupInput
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Folder name"
              aria-label="Folder name"
            />
            <InputGroupAddon align="inline-end">
              {manual ? (
                <Badge variant="outline">picked by you</Badge>
              ) : (
                shown && (
                  <DebugOnly>
                    <TierBadge probability={shown.probability} label={autoApplied ? "Applied" : "Ghost"} />
                  </DebugOnly>
                )
              )}
            </InputGroupAddon>
          </InputGroup>
          <Button type="submit">Create</Button>
        </form>
        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map((example) => (
            <Button
              key={example}
              variant="outline"
              size="xs"
              onClick={() => {
                setName(example)
                setManual(null)
              }}
            >
              {example}
            </Button>
          ))}
        </div>
        {ghost && (
          <p className="text-xs text-muted-foreground">
            Not sure enough to apply it. Showing {ghost} as a ghost preview.{" "}
            <Button variant="link" size="xs" className="h-auto p-0" onClick={() => setManual(ghost)}>
              Use it
            </Button>
          </p>
        )}
        <ItemGroup className="gap-2">
          {folders.slice(0, 4).map((folder, i) => (
            <Item key={`${folder.name}-${i}`} size="xs" variant="muted">
              <ItemMedia className="text-lg">{folder.emoji}</ItemMedia>
              <ItemContent>
                <ItemTitle>{folder.name}</ItemTitle>
              </ItemContent>
              {folder.pickedByHand && <Badge variant="outline">hand-picked</Badge>}
            </Item>
          ))}
        </ItemGroup>
      </CardContent>
      <CardFooter>
        <JevMeta result={data} isLoading={isLoading} />
      </CardFooter>
    </Card>
  )
}
