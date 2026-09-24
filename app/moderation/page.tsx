import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { PageHeader } from "@/components/jev/page-header"
import { Moderation } from "@/components/demos/moderation"

const ACTIONS = [
  { tier: "High (≥ 85%)", action: "Hide it right away. A mod can still see and restore it." },
  { tier: "Medium (55–85%)", action: "Hold it for mod review. A person decides." },
  { tier: "Low (< 55%)", action: "Let it through. False positives cost more than a missed borderline message." },
]

export default function ModerationPage() {
  return (
    <>
      <PageHeader
        eyebrow="Segment 6"
        title="Twitch chat moderation"
        description="For each message in the window: is it hostile (Noul)? How severe (Score)? Does it break each channel rule (Noul per rule)? All messages in the window share one call."
        primitives={["Noul", "Score"]}
      />

      <Moderation />

      <div className="grid gap-6 lg:grid-cols-2">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Confidence</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ACTIONS.map((row) => (
              <TableRow key={row.tier}>
                <TableCell className="font-medium">{row.tier}</TableCell>
                <TableCell className="whitespace-normal">{row.action}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Alert>
          <AlertTitle>Rules a word filter can&apos;t express</AlertTitle>
          <AlertDescription>
            A word filter can&apos;t tell a spoiler from a guess, backseating
            from a question, or &ldquo;very entertaining 🙂&rdquo; from a
            compliment. A plain-English rule becomes one more yes/no question.
            You don&apos;t need to train or fine-tune anything. Turn the rules
            off to watch the same messages go through.
          </AlertDescription>
        </Alert>
      </div>
    </>
  )
}
