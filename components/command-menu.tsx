"use client"

import * as React from "react"
import { usePathname, useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { HugeiconsIcon } from "@hugeicons/react"
import { SparklesIcon } from "@hugeicons/core-free-icons"

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/ui/command"
import { useSidebar } from "@/components/ui/sidebar"
import { toast } from "@/components/ui/toast"
import { DebugOnly, JevMeta, TierBadge } from "@/components/jev/indicators"
import { useJev } from "@/hooks/use-jev"
import { COMMANDS, NONE, byKey, type Command as AppCommand } from "@/lib/jev/catalog"
import { keywordMatch } from "@/lib/jev/text"
import { TIERS, choiceOf, rank } from "@/lib/jev/tiers"

const OPEN_EVENT = "open-command-menu"
const commandsByKey = byKey(COMMANDS)

export function openCommandMenu(query?: string) {
  window.dispatchEvent(
    new CustomEvent(OPEN_EVENT, {
      detail: typeof query === "string" ? query : undefined,
    })
  )
}

/** Segment 1b: command search by intent (Cmd+K). */
export function CommandMenu() {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const router = useRouter()
  const pathname = usePathname()
  const { resolvedTheme, setTheme } = useTheme()
  const { toggleSidebar } = useSidebar()

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        setOpen((value) => !value)
      }
    }
    const onOpen = (event: Event) => {
      const query = (event as CustomEvent<string | undefined>).detail
      if (query != null) setQuery(query)
      setOpen(true)
    }
    window.addEventListener("keydown", onKeyDown)
    window.addEventListener(OPEN_EVENT, onOpen)
    return () => {
      window.removeEventListener("keydown", onKeyDown)
      window.removeEventListener(OPEN_EVENT, onOpen)
    }
  }, [])

  const trimmed = query.trim()
  // Fuzzy search stays the baseline; Jev reranks by meaning.
  const keywordResults = trimmed
    ? keywordMatch(trimmed, COMMANDS, (c) => c.label)
    : COMMANDS
  const { data, isLoading } = useJev(
    "commands",
    open && trimmed.length >= 3 ? { query: trimmed, screen: pathname } : null
  )
  const suggestions = trimmed.length >= 3
    ? rank(choiceOf(data, "command"), { exclude: [NONE], min: TIERS.medium - 0.15, limit: 3 })
    : []
  const [best, ...others] = suggestions
  const confident = best && best.probability >= TIERS.high

  function run(command: AppCommand) {
    setOpen(false)
    setQuery("")
    switch (command.key) {
      case "toggleTheme":
        setTheme(resolvedTheme === "dark" ? "light" : "dark")
        break
      case "toggleSidebar":
        toggleSidebar()
        break
      case "openSettings":
        router.push("/intent-search")
        break
      default:
        toast.add({ title: command.label, description: "Command ran (demo)." })
    }
  }

  function renderItem(command: AppCommand, probability?: number) {
    return (
      <CommandItem
        key={`${probability != null ? "jev" : "kw"}-${command.key}`}
        value={`${probability != null ? "jev" : "kw"}-${command.key}`}
        onSelect={() => run(command)}
      >
        {probability != null && (
          <HugeiconsIcon icon={SparklesIcon} strokeWidth={2} />
        )}
        {command.label}
        {probability != null ? (
          <DebugOnly>
            <TierBadge probability={probability} className="ml-auto" />
          </DebugOnly>
        ) : (
          command.shortcut && <CommandShortcut>{command.shortcut}</CommandShortcut>
        )}
      </CommandItem>
    )
  }

  const jevKeys = new Set(suggestions.map((s) => s.key))
  const rest = keywordResults.filter((c) => !jevKeys.has(c.key))

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title="Command palette"
      description="Search commands by name or by what you want to do"
    >
      <Command shouldFilter={false}>
        <CommandInput
          placeholder="Type a command or what you want to do…"
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>No commands match.</CommandEmpty>
          {best && confident && (
            <CommandGroup heading="Best match by intent">
              {renderItem(commandsByKey[best.key], best.probability)}
            </CommandGroup>
          )}
          {suggestions.length > 0 && !confident && (
            <CommandGroup heading="Did you mean?">
              {suggestions.map((s) => renderItem(commandsByKey[s.key], s.probability))}
            </CommandGroup>
          )}
          {confident && others.length > 0 && (
            <CommandGroup heading="Also related">
              {others.map((s) => renderItem(commandsByKey[s.key], s.probability))}
            </CommandGroup>
          )}
          {rest.length > 0 && (
            <CommandGroup heading={trimmed ? "Name matches" : "All commands"}>
              {rest.map((command) => renderItem(command))}
            </CommandGroup>
          )}
        </CommandList>
        <JevMeta result={data} isLoading={isLoading} className="border-t px-4 py-2" />
      </Command>
    </CommandDialog>
  )
}
