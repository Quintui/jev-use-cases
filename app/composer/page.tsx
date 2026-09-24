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
import { Composer } from "@/components/demos/composer"

const STATES = [
  { state: "Nothing", when: "The top answer is weak (under 30%, or under 45% with no close rival), or the current mode already fits", ui: "No chip. Jev being unsure is a valid answer." },
  { state: "Ghost preview", when: "A new answer is ahead but hasn't won twice yet", ui: "A faint, dashed chip you can ignore" },
  { state: "Did you mean", when: "Neither is convincing alone (top < 70%, runner-up ≥ 25%) and neither is the current mode", ui: "Both offered side by side, and you pick" },
  { state: "Committed", when: "≥ 70% and has won twice in a row (≥ 90% counts at once)", ui: "“Switch to Research?” chip. You still have to click it." },
]

export default function ComposerPage() {
  return (
    <>
      <PageHeader
        eyebrow="Segment 3"
        title="Model picker in the composer"
        description="One call answers five questions: a Choice over modes, three yes/no Noul checks (web? file? actually a settings change?), and which setting. Code decides what the UI does with the answers."
        primitives={["Choice", "Noul"]}
      />

      <Composer />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>UI state</TableHead>
            <TableHead>When</TableHead>
            <TableHead>What the user sees</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {STATES.map((row) => (
            <TableRow key={row.state}>
              <TableCell className="font-medium">{row.state}</TableCell>
              <TableCell className="whitespace-normal text-muted-foreground">{row.when}</TableCell>
              <TableCell className="whitespace-normal">{row.ui}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Alert>
        <AlertTitle>Never auto-switch</AlertTitle>
        <AlertDescription>
          Changing the model changes the cost, the speed and the answer, so the
          user always makes the switch. Jev only makes the right option easy to
          find. The 300 ms debounce and the win-twice rule stop chips from
          flickering while someone is still typing.
        </AlertDescription>
      </Alert>
    </>
  )
}
