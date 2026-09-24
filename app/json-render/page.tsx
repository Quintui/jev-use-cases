import { NoteSection, PageHeader } from "@/components/jev/page-header"
import { JsonRender } from "@/components/demos/json-render"
import { MAX_DEPTH, MAX_ELEMENTS } from "@/lib/jev/json-render"

const link = "underline underline-offset-4 hover:text-foreground"

export default function JsonRenderPage() {
  return (
    <>
      <PageHeader
        title="Generative UI with json-render"
        description={
          <>
            After{" "}
            <a href="https://github.com/vercel-labs/json-render" target="_blank" rel="noreferrer" className={link}>
              Vercel Labs&apos; json-render
            </a>{" "}
            by{" "}
            <a href="https://x.com/ctatedev" target="_blank" rel="noreferrer" className={link}>
              @ctatedev
            </a>
            . Jev picks the components; code builds the tree.
          </>
        }
        primitives={["Choice", "Score"]}
        notes={
          <>
            <NoteSection title="Jev never writes UI">
              <p>
                Jev never writes JSX or JSON. It answers questions about the
                app&apos;s own components: how many of each (batch 1), then which
                section, what order and which label for each element (batch 2).
                Code assembles and validates the tree.
              </p>
            </NoteSection>
            <NoteSection title="The honest limits">
              <ul className="flex list-disc flex-col gap-1 pl-4">
                <li>
                  At most {MAX_ELEMENTS} elements per batch. Anything over that is
                  dropped, and step 1 tells you how many.
                </li>
                <li>
                  Depth is capped at {MAX_DEPTH} levels, and this renderer uses
                  three: root → section → element.
                </li>
                <li>Labels come from a fixed vocabulary. Jev picks them; it can&apos;t write new copy.</li>
                <li>
                  Structurally valid doesn&apos;t mean well designed. Code
                  guarantees a valid tree, not a good screen (a sign-up form can
                  still get two &ldquo;Password&rdquo; fields).
                </li>
              </ul>
            </NoteSection>
          </>
        }
      />

      <JsonRender />
    </>
  )
}
