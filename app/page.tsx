import { HugeiconsIcon } from "@hugeicons/react"
import {
  Coins01Icon,
  FlashIcon,
  LayoutGridIcon,
  Target01Icon,
} from "@hugeicons/core-free-icons"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
import { PageHeader } from "@/components/jev/page-header"
import { PrimitivesPlayground } from "@/components/demos/primitives-playground"
import { TIERS } from "@/lib/jev/tiers"

const WHY = [
  {
    icon: FlashIcon,
    title: "Fast enough to run as you type",
    description: "Vendor figures: ~70–500 ms, most around 100 ms from the US West Coast.",
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
    description: "That number is the key to good UI. See the tiers below.",
  },
]

export default function Page() {
  return (
    <>
      <PageHeader
        eyebrow="Intro"
        title="Jev doesn't write text. It makes decisions."
        description="You give it a state and questions, and it returns typed answers with probabilities. Nothing to parse, nothing to hallucinate."
        primitives={["Choice", "Score", "Noul"]}
      />

      <PrimitivesPlayground />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>The three primitives</CardTitle>
            <CardDescription>
              In the AI SDK these are <code>choice</code>, <code>score</code> and{" "}
              <code>boolean</code> questions in <code>experimental_evaluate</code>.
            </CardDescription>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Confidence tiers</CardTitle>
            <CardDescription>
              The core UI pattern. Every demo in this app uses it.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Confidence</TableHead>
                  <TableHead>UI behavior</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell><Badge>High ≥ {TIERS.high}</Badge></TableCell>
                  <TableCell>Apply automatically, with undo</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><Badge variant="secondary">Medium ≥ {TIERS.medium}</Badge></TableCell>
                  <TableCell>Suggestion chip or &ldquo;Did you mean&rdquo;</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><Badge variant="outline">Low</Badge></TableCell>
                  <TableCell>Do nothing, fall back to normal UI</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Why it fits micro-interactions</CardTitle>
        </CardHeader>
        <CardContent>
          <ItemGroup className="grid gap-2 sm:grid-cols-2">
            {WHY.map((item) => (
              <Item key={item.title} variant="muted">
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
        </CardContent>
      </Card>

      <Alert>
        <AlertTitle>Jev decides, code does.</AlertTitle>
        <AlertDescription>
          The model makes judgment calls. Deterministic code handles anything
          with a correct answer: dates, math, rendering. Keyword matching runs
          when the API is down, and the UI can&apos;t tell the difference.
        </AlertDescription>
      </Alert>
    </>
  )
}
