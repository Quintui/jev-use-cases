"use client"

import { usePathname } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { Search01Icon } from "@hugeicons/core-free-icons"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Field, FieldLabel } from "@/components/ui/field"
import { Kbd } from "@/components/ui/kbd"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Switch } from "@/components/ui/switch"
import { openCommandMenu } from "@/components/command-menu"
import { SOURCE_LABEL } from "@/components/jev/indicators"
import { useJevContext } from "@/components/jev/jev-provider"
import { NAV } from "@/lib/nav"

export function AppHeader() {
  const pathname = usePathname()
  const { showProbabilities, setShowProbabilities, mode, calls } = useJevContext()
  const page = NAV.find((item) => item.href === pathname)
  const last = calls[0]

  return (
    <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur">
      <SidebarTrigger />
      <Separator orientation="vertical" className="h-4" />
      <div className="flex min-w-0 items-center gap-2 text-sm">
        <span className="text-muted-foreground">{page?.segment}</span>
        <span className="truncate font-medium">{page?.label}</span>
      </div>
      <div className="ml-auto flex items-center gap-3">
        {last && (
          <span className="hidden text-xs text-muted-foreground tabular-nums md:inline">
            last call {Math.round(last.latencyMs)} ms · {calls.length} calls
          </span>
        )}
        {mode && (
          <Badge variant={mode === "fallback" ? "outline" : "secondary"}>
            {SOURCE_LABEL[mode]}
          </Badge>
        )}
        <Field orientation="horizontal" className="w-auto">
          <Switch
            id="show-probabilities"
            checked={showProbabilities}
            onCheckedChange={setShowProbabilities}
          />
          <FieldLabel htmlFor="show-probabilities" className="hidden text-xs sm:flex">
            Probabilities
          </FieldLabel>
        </Field>
        <Button variant="outline" size="sm" onClick={() => openCommandMenu()}>
          <HugeiconsIcon icon={Search01Icon} strokeWidth={2} data-icon="inline-start" />
          Commands
          <Kbd>⌘K</Kbd>
        </Button>
      </div>
    </header>
  )
}
