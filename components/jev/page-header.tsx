import { Badge } from "@/components/ui/badge"

export type Primitive = "Choice" | "Score" | "Noul"

export function PageHeader({
  eyebrow,
  title,
  description,
  primitives = [],
}: {
  eyebrow: string
  title: string
  description: React.ReactNode
  primitives?: Primitive[]
}) {
  return (
    <header className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-muted-foreground">{eyebrow}</span>
        {primitives.map((primitive) => (
          <Badge key={primitive} variant="secondary">
            {primitive}
          </Badge>
        ))}
      </div>
      <h1 className="font-heading text-3xl font-semibold tracking-tight text-balance">
        {title}
      </h1>
      <p className="max-w-2xl text-base text-pretty text-muted-foreground">
        {description}
      </p>
    </header>
  )
}
