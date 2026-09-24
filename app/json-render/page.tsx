import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { PageHeader } from "@/components/jev/page-header"
import { JsonRender } from "@/components/demos/json-render"
import { MAX_DEPTH, MAX_ELEMENTS } from "@/lib/jev/json-render"

export default function JsonRenderPage() {
  return (
    <>
      <PageHeader
        eyebrow="Segment 5"
        title="Generative UI with json-render"
        description={
          <>
            Inspired by{" "}
            <a
              href="https://github.com/vercel-labs/json-render"
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-4 hover:text-foreground"
            >
              Vercel Labs&apos; json-render
            </a>{" "}
            by{" "}
            <a
              href="https://x.com/ctatedev"
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-4 hover:text-foreground"
            >
              @ctatedev
            </a>
            . Jev never writes JSX or JSON. It answers questions about the
            app&apos;s own components, and code puts the tree together.
          </>
        }
        primitives={["Choice", "Score"]}
      />

      <JsonRender />

      <Alert>
        <AlertTitle>The honest limits</AlertTitle>
        <AlertDescription>
          <ul className="list-disc pl-4">
            <li>
              At most {MAX_ELEMENTS} elements per batch. Anything over that is
              dropped, and the step card tells you how many.
            </li>
            <li>
              Depth is capped at {MAX_DEPTH} levels, and this renderer uses
              three: root → section → element. There&apos;s no arbitrary nesting.
            </li>
            <li>
              Labels come from a fixed vocabulary. Jev picks them. It can&apos;t
              write new copy.
            </li>
            <li>
              Structurally valid doesn&apos;t mean well designed. Code
              guarantees the tree is valid. It doesn&apos;t guarantee the
              screen is good.
            </li>
          </ul>
        </AlertDescription>
      </Alert>
    </>
  )
}
