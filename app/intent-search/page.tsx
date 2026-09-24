import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { NoteSection, PageHeader } from "@/components/jev/page-header"
import { CommandSearchCard } from "@/components/demos/command-search-card"
import { CliDidYouMean, NoResultsSearch } from "@/components/demos/did-you-mean"
import { SettingsSearch } from "@/components/demos/settings-search"

export default function IntentSearchPage() {
  return (
    <>
      <PageHeader
        title="Intent search trio"
        description="One Choice call over a list the app already knows, used in three places."
        primitives={["Choice"]}
        notes={
          <>
            <NoteSection title="The call">
              <p>
                <strong>State:</strong> the user&apos;s query and the current
                screen. <strong>Question:</strong> Choice, &ldquo;Which setting
                does the user want?&rdquo; <strong>Options:</strong> each setting
                with a one-line description, plus &ldquo;none of these&rdquo;.
              </p>
            </NoteSection>
            <NoteSection title="Why no embeddings">
              <p>
                Fuzzy search stays the baseline and Jev reranks. The probability
                distribution is the ranking, so you don&apos;t need embeddings or
                a vector index. A big LLM wrote the rich descriptions once,
                offline. Jev matches against them live.
              </p>
            </NoteSection>
            <NoteSection title="Did you mean?">
              <p>
                Spelling-based suggestions can&apos;t map <code>git record</code>{" "}
                to <code>git commit</code>. Meaning can. High confidence offers
                one command, medium lists the closest few, low says &ldquo;command
                not found&rdquo;.
              </p>
            </NoteSection>
          </>
        }
      />

      <Tabs defaultValue="settings" className="gap-4">
        <TabsList>
          <TabsTrigger value="settings">Settings search</TabsTrigger>
          <TabsTrigger value="commands">Command search</TabsTrigger>
          <TabsTrigger value="no-results">Did you mean? (search)</TabsTrigger>
          <TabsTrigger value="cli">Did you mean? (CLI)</TabsTrigger>
        </TabsList>
        <TabsContent value="settings" className="max-w-3xl">
          <SettingsSearch />
        </TabsContent>
        <TabsContent value="commands" className="max-w-3xl">
          <CommandSearchCard />
        </TabsContent>
        <TabsContent value="no-results" className="max-w-3xl">
          <NoResultsSearch />
        </TabsContent>
        <TabsContent value="cli" className="max-w-3xl">
          <CliDidYouMean />
        </TabsContent>
      </Tabs>
    </>
  )
}
