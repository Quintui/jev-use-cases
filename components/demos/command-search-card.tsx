"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import { CommandIcon } from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Kbd, KbdGroup } from "@/components/ui/kbd"
import { openCommandMenu } from "@/components/command-menu"

const EXAMPLES = [
  "make it darker",
  "hide the left thing",
  "send this to a colleague",
  "cacher la barre latérale",
  "hazlo más oscuro",
]

/** Segment 1b: the palette is global; this card launches it with examples. */
export function CommandSearchCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Command search by intent</CardTitle>
        <CardDescription>
          Press ⌘K anywhere. Jev adds commands that match what you meant, and they really run.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map((example) => (
            <Button key={example} variant="outline" size="sm" onClick={() => openCommandMenu(example)}>
              {example}
            </Button>
          ))}
        </div>
        <p className="text-sm text-muted-foreground">
          The last two are French and Spanish. They need live Jev; the keyword fallback only knows English.
        </p>
      </CardContent>
      <CardFooter>
        <Button onClick={() => openCommandMenu("")}>
          <HugeiconsIcon icon={CommandIcon} strokeWidth={2} data-icon="inline-start" />
          Open palette
          <KbdGroup>
            <Kbd>⌘</Kbd>
            <Kbd>K</Kbd>
          </KbdGroup>
        </Button>
      </CardFooter>
    </Card>
  )
}
