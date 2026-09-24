import { HugeiconsIcon } from "@hugeicons/react"
import { Alert02Icon, CheckmarkCircle02Icon } from "@hugeicons/core-free-icons"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
import { PageHeader } from "@/components/jev/page-header"

const DONT = [
  { title: "It doesn't write text or read images", description: "Use an LLM to generate text and a vision model for images." },
  { title: "Don't use it where a rule already works", description: "A regex or lookup table that's right beats a fast guess." },
  { title: "Always keep a fallback", description: "API down, slow network, low confidence: the UI still works." },
  { title: "Keep the API key on the server", description: "The browser calls a small proxy; questions are built server-side." },
  { title: "Measure speed and cost yourself", description: "Vendor numbers are marketing. Check the header's round trip." },
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
      { label: "Introducing Jev", href: "https://typesafe.ai/blog/introducing-system-one-models-and-jev" },
      { label: "AI SDK evaluation", href: "https://ai-sdk.dev/docs/ai-sdk-core/evaluation" },
      { label: "Jev on OpenRouter", href: "https://openrouter.ai/typesafe/jev-1.13" },
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
      { label: "Shapeshift", href: "https://github.com/anishfn/shapeshift" },
      { label: "Shapeshift demo (?debug=1)", href: "https://shapeshiftui.vercel.app/?debug=1" },
      { label: "json-render", href: "https://github.com/vercel-labs/json-render" },
      { label: "Settings finder", href: "https://www.shipwithjev.com/builds/settings-finder" },
    ],
  },
  {
    group: "More builds",
    links: [
      { label: "CLI did-you-mean", href: "https://www.shipwithjev.com/builds/cli-did-you-mean-wrapper" },
      { label: "Spliit Cloud", href: "https://github.com/antonio-ivanovski/spliit-cloud" },
      { label: "Word house style", href: "https://www.shipwithjev.com/builds/word-house-style" },
      { label: "Laya/Jev cascade", href: "https://www.madewithlaya.com/builds/laya-jev-lab-cascade" },
    ],
  },
]

export default function LimitsPage() {
  return (
    <>
      <PageHeader
        title="When not to use Jev"
        description="Knowing where it doesn't fit matters as much as knowing where it does."
      />

      <div className="grid items-start gap-6 lg:grid-cols-2">
        <ItemGroup className="gap-2">
          {DONT.map((item) => (
            <Item key={item.title} variant="outline" size="sm">
              <ItemMedia variant="icon">
                <HugeiconsIcon icon={Alert02Icon} strokeWidth={2} />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>{item.title}</ItemTitle>
                <ItemDescription>{item.description}</ItemDescription>
              </ItemContent>
            </Item>
          ))}
        </ItemGroup>

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
      </div>

      <div className="grid gap-6 border-t pt-5 sm:grid-cols-2 lg:grid-cols-4">
        {RESOURCES.map((section) => (
          <nav key={section.group} className="flex flex-col gap-1.5">
            <h2 className="text-xs font-medium text-muted-foreground">{section.group}</h2>
            <ul className="flex flex-col gap-1 text-sm">
              {section.links.map((link) => (
                <li key={link.href}>
                  <a href={link.href} target="_blank" rel="noreferrer" className="underline-offset-4 hover:underline">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
    </>
  )
}
