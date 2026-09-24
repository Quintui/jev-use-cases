import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { NoteSection, PageHeader } from "@/components/jev/page-header"
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
        title="Twitch chat moderation"
        description="Per message: hostile? how severe? breaks a channel rule? A whole window of chat in one call."
        primitives={["Noul", "Score"]}
        notes={
          <>
            <NoteSection title="Graduated actions">
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
                      <TableCell className="font-medium text-foreground">{row.tier}</TableCell>
                      <TableCell className="whitespace-normal">{row.action}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </NoteSection>
            <NoteSection title="Rules a word filter can't express">
              <p>
                A word filter can&apos;t tell a spoiler from a guess, backseating
                from a question, or &ldquo;very entertaining 🙂&rdquo; from a
                compliment. A plain-English rule becomes one more yes/no
                question, with nothing to train. Turn a rule off to watch the
                same messages go through.
              </p>
            </NoteSection>
            <NoteSection title="Batching and the rate limit">
              <p>
                Early access allows 1,200 requests a minute. One call every 1.5 s
                is 40 calls a minute per channel, so one key covers about 30 busy
                channels.
              </p>
            </NoteSection>
          </>
        }
      />

      <Moderation />
    </>
  )
}
