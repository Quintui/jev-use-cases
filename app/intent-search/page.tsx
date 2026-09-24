import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PageHeader } from "@/components/jev/page-header"
import { CommandSearchCard } from "@/components/demos/command-search-card"
import { CliDidYouMean, NoResultsSearch } from "@/components/demos/did-you-mean"
import { SettingsSearch } from "@/components/demos/settings-search"

export default function IntentSearchPage() {
  return (
    <>
      <PageHeader
        eyebrow="Segment 1"
        title="Intent search trio"
        description="One primitive, three places in the app. Each one is a single Choice call over a list the app already knows, plus a “none of these” option."
        primitives={["Choice"]}
      />

      <Tabs defaultValue="settings" className="gap-6">
        <TabsList>
          <TabsTrigger value="settings">Settings search</TabsTrigger>
          <TabsTrigger value="commands">Command search</TabsTrigger>
          <TabsTrigger value="did-you-mean">Did you mean?</TabsTrigger>
        </TabsList>
        <TabsContent value="settings">
          <SettingsSearch />
        </TabsContent>
        <TabsContent value="commands">
          <CommandSearchCard />
        </TabsContent>
        <TabsContent value="did-you-mean" className="grid gap-6 lg:grid-cols-2">
          <NoResultsSearch />
          <CliDidYouMean />
        </TabsContent>
      </Tabs>

      <Alert>
        <AlertTitle>How it works</AlertTitle>
        <AlertDescription>
          <p>
            <strong>state:</strong> the user&apos;s query and the current screen.{" "}
            <strong>question:</strong> Choice, &ldquo;Which setting does the user
            want?&rdquo; <strong>options:</strong> each setting with a one-line
            description, plus &ldquo;none of these&rdquo;.
          </p>
          <p>
            Fuzzy search stays the baseline and Jev reranks. The probability
            distribution is the ranking, so you don&apos;t need embeddings or a
            vector index. A big LLM wrote the rich descriptions once, offline.
            Jev matches against them live.
          </p>
        </AlertDescription>
      </Alert>
    </>
  )
}
