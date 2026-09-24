import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { NoteSection, PageHeader } from "@/components/jev/page-header"
import { ExpenseCategory } from "@/components/demos/expense-category"
import { FolderEmoji } from "@/components/demos/folder-emoji"
import { SendIntent } from "@/components/demos/send-intent"

export default function TypingPage() {
  return (
    <>
      <PageHeader
        title="Small interactions while you type"
        description="Runs on every pause in typing. Never overwrites your choice; unsure means it asks or does nothing."
        primitives={["Choice", "Noul"]}
        notes={
          <>
            <NoteSection title="The pattern">
              <p>
                The cheap layers go first: code, exact matches, and your own
                history. Jev handles the fuzzy middle. Anything still uncertain
                goes to a person. A choice you make by hand always wins, and a
                guess from Jev never replaces it.
              </p>
            </NoteSection>
            <NoteSection title="Folder name → icon">
              <p>
                A Choice over about 30 curated icons. High confidence applies the
                icon; medium shows it as a faint preview. Picking an icon yourself
                stops Jev from touching it.
              </p>
            </NoteSection>
            <NoteSection title="Send → Schedule">
              <p>
                Code parses the time, because dates have a right answer. Jev
                answers one yes/no question: is this written to be read at that
                time? Only a confident yes changes the button. No time in the
                text means no call at all.
              </p>
            </NoteSection>
            <NoteSection title="Expense → category">
              <p>
                Exact dictionary first, then your own history, then Jev with
                your history as context. If Jev isn&apos;t sure, the expense goes
                to review with the top two as chips.
              </p>
            </NoteSection>
            <NoteSection title="Latency">
              <p>
                A Jev call takes a few hundred milliseconds end to end. The header
                shows the real number for every call.
              </p>
            </NoteSection>
          </>
        }
      />

      <Tabs defaultValue="folder" className="gap-4">
        <TabsList>
          <TabsTrigger value="folder">Folder icon</TabsTrigger>
          <TabsTrigger value="send">Send → Schedule</TabsTrigger>
          <TabsTrigger value="expense">Expense category</TabsTrigger>
        </TabsList>
        <TabsContent value="folder" className="max-w-3xl">
          <FolderEmoji />
        </TabsContent>
        <TabsContent value="send" className="max-w-3xl">
          <SendIntent />
        </TabsContent>
        <TabsContent value="expense" className="max-w-3xl">
          <ExpenseCategory />
        </TabsContent>
      </Tabs>
    </>
  )
}
