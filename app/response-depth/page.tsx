import { NoteSection, PageHeader } from "@/components/jev/page-header"
import { ResponseDepth } from "@/components/demos/response-depth"

export default function ResponseDepthPage() {
  return (
    <>
      <PageHeader
        title="Response depth"
        description="Jev scores how technical the writer is and how much detail they want. Code turns that into the LLM's instruction."
        primitives={["Score"]}
        notes={
          <>
            <NoteSection title="Jev steers, it doesn't answer">
              <p>
                Jev never writes the reply. It adds one short call (a few hundred
                milliseconds) before the LLM call and returns two numbers.
              </p>
            </NoteSection>
            <NoteSection title="Code owns the mapping">
              <p>
                The mapping from scores to instructions is ordinary code in{" "}
                <code>lib/jev/response-style.ts</code>. You can test it, tweak it
                and version it like any other code.
              </p>
            </NoteSection>
            <NoteSection title="Without a key">
              <p>
                Without an <code>OPENROUTER_API_KEY</code> (or{" "}
                <code>AI_GATEWAY_API_KEY</code>), the answer panel shows the
                instruction that would have been sent instead of calling a model.
              </p>
            </NoteSection>
          </>
        }
      />

      <ResponseDepth />
    </>
  )
}
