import { HugeiconsIcon } from "@hugeicons/react"
import {
  Coins01Icon,
  FlashIcon,
  LayoutGridIcon,
  Target01Icon,
} from "@hugeicons/core-free-icons"

import { Badge } from "@/components/ui/badge"
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { NoteSection, PageHeader } from "@/components/jev/page-header"
import { PrimitivesPlayground } from "@/components/demos/primitives-playground"
import { TIERS } from "@/lib/jev/tiers"

const WHY = [
  {
    icon: FlashIcon,
    title: "Fast enough to run as you type",
    description: "Vendor figures: ~70–500 ms. Measure your own; the header shows every round trip.",
  },
  {
    icon: Coins01Icon,
    title: "Cheap enough for every keystroke",
    description: "Input tokens only; output is too cheap to meter.",
  },
  {
    icon: LayoutGridIcon,
    title: "Several questions, one call",
    description: "Asking five questions costs about the same time as asking one.",
  },
  {
    icon: Target01Icon,
    title: "Every answer has a confidence value",
    description: "That number is the key to good UI.",
  },
]

const TIER_ROWS = [
  { badge: <Badge>High ≥ {TIERS.high}</Badge>, action: "Apply automatically, with undo" },
  { badge: <Badge variant="secondary">Medium ≥ {TIERS.medium}</Badge>, action: "Suggest: a chip or “Did you mean”" },
  { badge: <Badge variant="outline">Low</Badge>, action: "Do nothing, keep the normal UI" },
]

export default function Page() {
  return (
    <>
      <PageHeader
        title="Jev doesn't write text. It makes decisions."
        description="State and questions in, typed answers with probabilities out. Jev decides, code does."
        primitives={["Choice", "Score", "Noul"]}
        notes={
          <>
            <NoteSection title="The three primitives">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Primitive</TableHead>
                    <TableHead>What it does</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell><Badge variant="secondary">Choice</Badge></TableCell>
                    <TableCell className="whitespace-normal">Picks one option from a set you define (up to 255)</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><Badge variant="secondary">Score</Badge></TableCell>
                    <TableCell className="whitespace-normal">Places the input on an ordered scale (2–10 levels)</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><Badge variant="secondary">Noul</Badge></TableCell>
                    <TableCell className="whitespace-normal">Yes/no question, returns P(yes)</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              <p>
                In the AI SDK these are <code>choice</code>, <code>score</code> and{" "}
                <code>boolean</code> questions in <code>experimental_evaluate</code>.
              </p>
            </NoteSection>
            <NoteSection title="Why it fits micro-interactions">
              <ItemGroup className="gap-2">
                {WHY.map((item) => (
                  <Item key={item.title} variant="muted" size="sm">
                    <ItemMedia variant="icon">
                      <HugeiconsIcon icon={item.icon} strokeWidth={2} />
                    </ItemMedia>
                    <ItemContent>
                      <ItemTitle>{item.title}</ItemTitle>
                      <ItemDescription>{item.description}</ItemDescription>
                    </ItemContent>
                  </Item>
                ))}
              </ItemGroup>
            </NoteSection>
            <NoteSection title="Jev decides, code does">
              <p>
                The model makes judgment calls. Deterministic code handles
                anything with a correct answer: dates, math, rendering. Keyword
                matching runs when the API is down, and the UI can&apos;t tell
                the difference.
              </p>
            </NoteSection>
          </>
        }
      />

      <PrimitivesPlayground />

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium text-muted-foreground">
          The core UI pattern: every demo in this app uses these tiers
        </h2>
        <ItemGroup className="grid gap-3 md:grid-cols-3">
          {TIER_ROWS.map((row, i) => (
            <Item key={i} variant="outline" size="sm">
              <ItemContent>
                <ItemTitle>{row.badge}</ItemTitle>
                <ItemDescription>{row.action}</ItemDescription>
              </ItemContent>
            </Item>
          ))}
        </ItemGroup>
      </section>
    </>
  )
}
