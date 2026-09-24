"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { AiMagicIcon, Alert02Icon } from "@hugeicons/core-free-icons"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@/components/ui/item"
import { Progress, ProgressLabel, ProgressValue } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Spinner } from "@/components/ui/spinner"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { JevMeta } from "@/components/jev/indicators"
import { useJevAction, type JevResult } from "@/hooks/use-jev"
import {
  LEAF_TYPES,
  MAX_ELEMENTS,
  buildTree,
  expandPlan,
  type LayoutAnswer,
  type PlannedElement,
  type UINode,
} from "@/lib/jev/json-render"
import { choiceOf, scoreOf } from "@/lib/jev/tiers"

const EXAMPLES = [
  "Sales dashboard with revenue, orders and a table of recent orders",
  "Sign up form for a SaaS app",
  "Team member profile with status badges and recent activity",
  "Notification settings page",
  "Onboarding checklist with progress and a list of tasks",
]

type Result = {
  plan: JevResult
  layout: JevResult
  sections: string[]
  elements: PlannedElement[]
  dropped: number
  tree: UINode
  issues: string[]
}

/**
 * Two batches of questions, then code:
 * 1. Which components, and how many? 2. Where does each one go?
 * 3. Code builds the JSON tree and validates it.
 */
export function JsonRender() {
  const [request, setRequest] = React.useState(EXAMPLES[0])
  const [result, setResult] = React.useState<Result>()
  const [step, setStep] = React.useState<"idle" | "plan" | "layout">("idle")
  const [error, setError] = React.useState<string>()
  const evaluate = useJevAction()

  async function generate(event?: React.FormEvent) {
    event?.preventDefault()
    const text = request.trim()
    if (!text) return
    setError(undefined)
    try {
      setStep("plan")
      const plan = await evaluate("jsonRenderPlan", { request: text })
      const counts = Object.fromEntries(
        LEAF_TYPES.map(({ type }) => [type, scoreOf(plan, `count_${type}`)?.score ?? 0])
      )
      // Section levels start at "1 section", so level 0 means one.
      counts.section = (scoreOf(plan, "count_section")?.score ?? 0) + 1
      const { sections, elements, dropped } = expandPlan(counts)

      setStep("layout")
      const layout = await evaluate("jsonRenderLayout", { request: text, sections, elements })
      const answers: Record<string, LayoutAnswer> = Object.fromEntries(
        elements.map((element) => [
          element.id,
          {
            parent: choiceOf(layout, `parent_${element.id}`)?.choice ?? sections[0],
            order: scoreOf(layout, `order_${element.id}`)?.score ?? 2,
            label: choiceOf(layout, `label_${element.id}`)?.choice,
          },
        ])
      )
      const { tree, issues } = buildTree(sections, elements, answers)
      setResult({ plan, layout, sections, elements, dropped, tree, issues })
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setStep("idle")
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={generate} className="flex flex-col gap-3">
        <InputGroup>
          <InputGroupInput
            value={request}
            onChange={(e) => setRequest(e.target.value)}
            placeholder="Describe a screen…"
            aria-label="Screen description"
          />
          <InputGroupAddon align="inline-end">
            <InputGroupButton type="submit" variant="default" size="sm" disabled={step !== "idle"}>
              {step === "idle" ? (
                <HugeiconsIcon icon={AiMagicIcon} strokeWidth={2} data-icon="inline-start" />
              ) : (
                <Spinner data-icon="inline-start" />
              )}
              {step === "plan" ? "Batch 1…" : step === "layout" ? "Batch 2…" : "Generate"}
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map((example) => (
            <Button key={example} variant="outline" size="xs" onClick={() => setRequest(example)}>
              {example}
            </Button>
          ))}
        </div>
      </form>

      {error && (
        <Alert variant="destructive">
          <HugeiconsIcon icon={Alert02Icon} strokeWidth={2} />
          <AlertTitle>Generation failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {result && (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <StepCard
              step="Batch 1 · Jev"
              title="Which components, and how many?"
              result={result.plan}
            >
              {result.sections.length} {result.sections.length === 1 ? "section" : "sections"},{" "}
              {result.elements.length} elements
              {result.dropped > 0 && `, ${result.dropped} dropped (over ${MAX_ELEMENTS})`}
            </StepCard>
            <StepCard
              step="Batch 2 · Jev"
              title="Which section, and in what order?"
              result={result.layout}
            >
              Each element gets a parent, a position and a label from a fixed vocabulary.
            </StepCard>
            <StepCard step="Code" title="Build and validate the JSON">
              {result.issues.length === 0
                ? "Valid tree. No issues."
                : `${result.issues.length} fixed: ${result.issues.join("; ")}`}
            </StepCard>
          </div>

          <Tabs defaultValue="preview" className="gap-4">
            <TabsList>
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="json">JSON</TabsTrigger>
            </TabsList>
            <TabsContent value="preview" className="rounded-4xl bg-muted/50 p-4 md:p-6">
              <RenderNode node={result.tree} />
            </TabsContent>
            <TabsContent value="json">
              <ScrollArea className="h-[32rem] rounded-2xl border">
                <pre className="p-4 font-mono text-xs">{JSON.stringify(result.tree, null, 2)}</pre>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}

function StepCard({
  step,
  title,
  result,
  children,
}: {
  step: string
  title: string
  result?: JevResult
  children: React.ReactNode
}) {
  return (
    <Card size="sm">
      <CardHeader>
        <CardDescription>{step}</CardDescription>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-muted-foreground">{children}</CardContent>
      {result && (
        <CardFooter>
          <JevMeta result={result} />
        </CardFooter>
      )}
    </Card>
  )
}

// ---------- renderer: app-owned components only ----------

/** Stable fake numbers so the preview looks real but never changes on re-render. */
function seeded(id: string, min: number, max: number) {
  let hash = 2166136261 // FNV-1a, so similar ids still get far-apart numbers
  for (const char of id) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619) >>> 0
  hash = Math.imul(hash ^ (hash >>> 15), 2246822507) >>> 0
  return min + (hash % (max - min))
}

function RenderNode({ node }: { node: UINode }) {
  if (node.type === "root") {
    return (
      <div className="mx-auto flex max-w-2xl flex-col gap-4">
        {node.children.map((child) => (
          <RenderNode key={"id" in child ? child.id : "root"} node={child} />
        ))}
      </div>
    )
  }

  if (node.type === "section") {
    // Group consecutive stats into one row, like a real dashboard would.
    const groups: UINode[][] = []
    for (const child of node.children) {
      const last = groups.at(-1)
      if (child.type === "stat" && last?.[0].type === "stat") last.push(child)
      else groups.push([child])
    }
    return (
      <Card>
        <CardContent className="flex flex-col gap-4">
          {groups.map((group) =>
            group[0].type === "stat" ? (
              <div key={"id" in group[0] ? group[0].id : ""} className="grid gap-3 sm:grid-cols-3">
                {group.map((stat) => (
                  <RenderNode key={"id" in stat ? stat.id : ""} node={stat} />
                ))}
              </div>
            ) : (
              <RenderNode key={"id" in group[0] ? group[0].id : ""} node={group[0]} />
            )
          )}
        </CardContent>
      </Card>
    )
  }

  const label = "label" in node ? node.label : undefined
  switch (node.type) {
    case "heading":
      return <h3 className="font-heading text-xl font-semibold">{label ?? "Overview"}</h3>
    case "text":
      return (
        <p className="text-muted-foreground">
          A short line of supporting copy explaining what this section is for.
        </p>
      )
    case "stat":
      return (
        <div className="flex flex-col gap-1 rounded-2xl border p-4">
          <span className="text-xs text-muted-foreground">{label ?? "Metric"}</span>
          <span className="text-2xl font-semibold tabular-nums">
            {seeded(node.id, 120, 9800).toLocaleString()}
          </span>
        </div>
      )
    case "input":
      return (
        <Field>
          <FieldLabel htmlFor={node.id}>{label ?? "Field"}</FieldLabel>
          <Input id={node.id} placeholder={label ?? ""} />
        </Field>
      )
    case "switch":
      return (
        <Field orientation="horizontal">
          <Switch id={node.id} defaultChecked={seeded(node.id, 0, 2) === 1} />
          <FieldLabel htmlFor={node.id}>{label ?? "Preference"}</FieldLabel>
        </Field>
      )
    case "button":
      return <Button className="self-start">{label ?? "Continue"}</Button>
    case "badge":
      return (
        <Badge variant="secondary" className="self-start">
          {["Active", "Admin", "Pro", "On track"][seeded(node.id, 0, 4)]}
        </Badge>
      )
    case "avatar":
      return (
        <Avatar size="lg">
          <AvatarFallback>AK</AvatarFallback>
        </Avatar>
      )
    case "alert":
      return (
        <Alert>
          <HugeiconsIcon icon={Alert02Icon} strokeWidth={2} />
          <AlertTitle>Heads up</AlertTitle>
          <AlertDescription>Something here needs your attention.</AlertDescription>
        </Alert>
      )
    case "progress":
      return (
        <Progress value={seeded(node.id, 20, 90)}>
          <ProgressLabel>Progress</ProgressLabel>
          <ProgressValue />
        </Progress>
      )
    case "table":
      return (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {["Ada Lovelace", "Alan Turing", "Grace Hopper"].map((name, i) => (
              <TableRow key={name}>
                <TableCell>{name}</TableCell>
                <TableCell>{["Paid", "Pending", "Paid"][i]}</TableCell>
                <TableCell className="text-right tabular-nums">
                  ${seeded(`${node.id}${i}`, 40, 900)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )
    case "list":
      return (
        <ItemGroup className="gap-2">
          {["Updated the billing plan", "Invited a teammate", "Exported a report"].map((title, i) => (
            <Item key={title} size="xs" variant="muted">
              <ItemContent>
                <ItemTitle>{title}</ItemTitle>
                <ItemDescription>{i + 1}h ago</ItemDescription>
              </ItemContent>
            </Item>
          ))}
        </ItemGroup>
      )
    case "separator":
      return <Separator />
  }
}
