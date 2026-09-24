import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { PageHeader } from "@/components/jev/page-header"
import { ExpenseCategory } from "@/components/demos/expense-category"
import { FolderEmoji } from "@/components/demos/folder-emoji"
import { SendIntent } from "@/components/demos/send-intent"

export default function TypingPage() {
  return (
    <>
      <PageHeader
        eyebrow="Segment 2"
        title="Small interactions while you type"
        description="Each of these runs on every pause in typing, so a call has to be fast and cheap. A Jev call takes a few hundred milliseconds end to end (the header shows the real number). Jev never overwrites something you chose yourself, and when it isn't sure it asks or does nothing."
        primitives={["Choice", "Noul"]}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <FolderEmoji />
        <SendIntent />
      </div>
      <ExpenseCategory />

      <Alert>
        <AlertTitle>The pattern</AlertTitle>
        <AlertDescription>
          <p>
            The cheap layers go first: code, exact matches, and your own history.
            Jev handles the fuzzy middle. Anything still uncertain goes to a
            person. A choice you make by hand always wins, and a guess from Jev
            never replaces it.
          </p>
        </AlertDescription>
      </Alert>
    </>
  )
}
