import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { NoteSection, PageHeader } from "@/components/jev/page-header"
import { Composer } from "@/components/demos/composer"

const STATES = [
  { state: "Nothing", when: "Top answer is weak, or the current mode already fits", ui: "No chip. Unsure is a valid answer." },
  { state: "Ghost preview", when: "A new answer is ahead but hasn't won twice yet", ui: "A faint, dashed chip you can ignore" },
  { state: "Did you mean", when: "Top < 70%, runner-up ≥ 25%, neither is the current mode", ui: "Both offered side by side" },
  { state: "Committed", when: "≥ 70% and won twice in a row (≥ 90% counts at once)", ui: "“Switch to Research?” You still click it." },
]

export default function ComposerPage() {
  return (
    <>
      <PageHeader
        title="Model picker in the composer"
        description="One call, five questions: which mode, plus web? file? actually a settings change? Jev suggests, you switch."
        primitives={["Choice", "Noul"]}
        notes={
          <>
            <NoteSection title="UI states">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>State</TableHead>
                    <TableHead>When</TableHead>
                    <TableHead>User sees</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {STATES.map((row) => (
                    <TableRow key={row.state}>
                      <TableCell className="font-medium text-foreground">{row.state}</TableCell>
                      <TableCell className="whitespace-normal">{row.when}</TableCell>
                      <TableCell className="whitespace-normal">{row.ui}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </NoteSection>
            <NoteSection title="Never auto-switch">
              <p>
                Changing the model changes the cost, the speed and the answer,
                so the user always makes the switch. Jev only makes the right
                option easy to find. The 300 ms debounce and the win-twice rule
                stop chips from flickering while someone is still typing.
              </p>
            </NoteSection>
            <NoteSection title="Recording tip">
              <p>
                Click the examples in order: Code, then Ghost, then Research +
                web shows the ghost preview turning into a committed suggestion.
              </p>
            </NoteSection>
          </>
        }
      />

      <Composer />
    </>
  )
}
