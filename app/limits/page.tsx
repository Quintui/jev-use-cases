import { HugeiconsIcon } from "@hugeicons/react"
import {
  Alert02Icon,
  ArrowRight01Icon,
  CheckmarkCircle02Icon,
} from "@hugeicons/core-free-icons"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@/components/ui/item"
import { PageHeader } from "@/components/jev/page-header"

const DONT = [
  {
    title: "It doesn't write text or read images",
    description: "Jev only answers questions about text: choose, score, or yes/no. Use an LLM to generate text, and a vision model for images.",
  },
  {
    title: "Don't use it where a rule already works",
    description: "If a regex, an exact match or a lookup table gets it right, use that. Because Jev is fast, it's tempting to use it everywhere.",
  },
  {
    title: "Always keep a fallback",
    description: "Plan for the API being down, a slow network, or low confidence. Every demo in this app still works on keyword matching without a key.",
  },
  {
    title: "Keep the API key on the server",
    description: "The browser calls a small proxy (/api/jev). The questions are also built on the server, so clients can't change them.",
  },
  {
    title: "Measure speed and cost yourself",
    description: "Vendor numbers are marketing. The header of this app shows the real round trip for every call. Check it on your own network.",
  },
]

const TRAITS = [
  "The user's words don't match the app's vocabulary",
  "The set of possible answers is closed and known",
  "A wrong answer is cheap or can be undone",
]

const RESOURCES = [
  {
    group: "Official",
    links: [
      { label: "TypeSafe docs", href: "https://docs.typesafe.ai" },
      { label: "Introducing System One models and Jev", href: "https://typesafe.ai/blog/introducing-system-one-models-and-jev" },
      { label: "AI SDK: evaluation", href: "https://ai-sdk.dev/docs/ai-sdk-core/evaluation" },
    ],
  },
  {
    group: "Catalogs",
    links: [
      { label: "shipwithjev", href: "https://www.shipwithjev.com" },
      { label: "madewithlaya", href: "https://www.madewithlaya.com" },
      { label: "Jev_apps (JackZeng)", href: "https://github.com/JackZeng/Jev_apps" },
    ],
  },
  {
    group: "Referenced projects",
    links: [
      { label: "Shapeshift: a text box that becomes UI", href: "https://github.com/anishfn/shapeshift" },
      { label: "Shapeshift demo (?debug=1 shows the probabilities)", href: "https://shapeshiftui.vercel.app/?debug=1" },
      { label: "json-render (Vercel Labs)", href: "https://github.com/vercel-labs/json-render" },
      { label: "Settings finder", href: "https://www.shipwithjev.com/builds/settings-finder" },
      { label: "CLI did-you-mean wrapper", href: "https://www.shipwithjev.com/builds/cli-did-you-mean-wrapper" },
      { label: "Spliit Cloud: expense categories", href: "https://github.com/antonio-ivanovski/spliit-cloud" },
      { label: "Word house-style formatter", href: "https://www.shipwithjev.com/builds/word-house-style" },
      { label: "Laya/Jev cascade", href: "https://www.madewithlaya.com/builds/laya-jev-lab-cascade" },
    ],
  },
]

export default function LimitsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Outro"
        title="When not to use Jev"
        description="Knowing where Jev doesn't fit matters as much as knowing where it does."
      />

      <div className="grid gap-3 md:grid-cols-2">
        {DONT.map((item) => (
          <Alert key={item.title}>
            <HugeiconsIcon icon={Alert02Icon} strokeWidth={2} />
            <AlertTitle>{item.title}</AlertTitle>
            <AlertDescription>{item.description}</AlertDescription>
          </Alert>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardDescription>Recap</CardDescription>
          <CardTitle className="font-heading text-2xl">Jev decides, code does.</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <p className="text-muted-foreground">The best use cases have three things in common:</p>
          <ItemGroup className="gap-2">
            {TRAITS.map((trait, i) => (
              <Item key={trait} variant="muted" size="sm">
                <HugeiconsIcon icon={CheckmarkCircle02Icon} strokeWidth={2} className="text-primary" />
                <ItemContent>
                  <ItemTitle>
                    {i + 1}. {trait}
                  </ItemTitle>
                </ItemContent>
              </Item>
            ))}
          </ItemGroup>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {RESOURCES.map((section) => (
          <div key={section.group} className="flex flex-col gap-3">
            <h2 className="text-sm font-medium text-muted-foreground">{section.group}</h2>
            <ItemGroup className="gap-2">
              {section.links.map((link) => (
                <Item
                  key={link.href}
                  size="sm"
                  variant="outline"
                  render={<a href={link.href} target="_blank" rel="noreferrer" />}
                >
                  <ItemContent className="min-w-0">
                    <ItemTitle>{link.label}</ItemTitle>
                    <ItemDescription className="truncate">
                      {link.href.replace(/^https:\/\/(www\.)?/, "")}
                    </ItemDescription>
                  </ItemContent>
                  <ItemActions>
                    <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} className="size-4" />
                  </ItemActions>
                </Item>
              ))}
            </ItemGroup>
          </div>
        ))}
      </div>
    </>
  )
}
