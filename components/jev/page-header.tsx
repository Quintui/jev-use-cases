import { HugeiconsIcon } from "@hugeicons/react"
import { InformationCircleIcon } from "@hugeicons/core-free-icons"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

export type Primitive = "Choice" | "Score" | "Noul"

/**
 * One compact row so the demo gets the screen. Longer explanations live
 * behind "How it works" instead of pushing the demo below the fold.
 */
export function PageHeader({
  title,
  description,
  primitives = [],
  notes,
}: {
  title: string
  description: React.ReactNode
  primitives?: Primitive[]
  notes?: React.ReactNode
}) {
  return (
    <header className="flex items-start justify-between gap-4">
      <div className="flex min-w-0 flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="font-heading text-xl font-semibold tracking-tight">{title}</h1>
          {primitives.map((primitive) => (
            <Badge key={primitive} variant="secondary">
              {primitive}
            </Badge>
          ))}
        </div>
        <p className="text-sm text-pretty text-muted-foreground">{description}</p>
      </div>
      {notes && (
        <Sheet>
          <SheetTrigger render={<Button variant="outline" size="sm" className="shrink-0" />}>
            <HugeiconsIcon icon={InformationCircleIcon} strokeWidth={2} data-icon="inline-start" />
            How it works
          </SheetTrigger>
          <SheetContent className="data-[side=right]:sm:max-w-lg">
            <SheetHeader>
              <SheetTitle>How it works</SheetTitle>
              <SheetDescription>{title}</SheetDescription>
            </SheetHeader>
            <div className="flex flex-col gap-4 overflow-y-auto px-6 pb-6 text-sm">{notes}</div>
          </SheetContent>
        </Sheet>
      )}
    </header>
  )
}

/** A titled block inside the "How it works" sheet. */
export function NoteSection({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="flex flex-col gap-2 text-muted-foreground [&_code]:text-foreground [&_strong]:text-foreground">
      <h3 className="font-medium text-foreground">{title}</h3>
      {children}
    </section>
  )
}
