import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { PageHeader } from "@/components/jev/page-header"
import { ResponseDepth } from "@/components/demos/response-depth"

export default function ResponseDepthPage() {
  return (
    <>
      <PageHeader
        eyebrow="Segment 4"
        title="Response depth"
        description="Before the big model answers, Jev scores the question: how technical the writer is, and how much detail they want. Code turns those two numbers into a style instruction for the LLM."
        primitives={["Score"]}
      />

      <ResponseDepth />

      <Alert>
        <AlertTitle>Jev steers, it doesn&apos;t answer</AlertTitle>
        <AlertDescription>
          <p>
            Jev never writes the reply. It adds one short call (a few hundred
            milliseconds) before the LLM call and returns two numbers. The mapping from scores to
            instructions is ordinary code in <code>lib/jev/response-style.ts</code>.
            You can test it, tweak it and version it like any other code.
          </p>
          <p>
            Without an <code>OPENROUTER_API_KEY</code> (or <code>AI_GATEWAY_API_KEY</code>), the reply panel shows
            the instruction that would have been sent instead of calling a model.
          </p>
        </AlertDescription>
      </Alert>
    </>
  )
}
