import {
  AiBrain01Icon,
  Alert02Icon,
  Home01Icon,
  Layout01Icon,
  MessageMultiple01Icon,
  Search01Icon,
  SparklesIcon,
  TextFontIcon,
} from "@hugeicons/core-free-icons"

export const NAV = [
  { href: "/", label: "What Jev is", segment: "Intro", icon: Home01Icon },
  { href: "/intent-search", label: "Intent search trio", segment: "Segment 1", icon: Search01Icon },
  { href: "/typing", label: "Small typing interactions", segment: "Segment 2", icon: TextFontIcon },
  { href: "/composer", label: "Model picker", segment: "Segment 3", icon: SparklesIcon },
  { href: "/response-depth", label: "Response depth", segment: "Segment 4", icon: AiBrain01Icon },
  { href: "/json-render", label: "json-render", segment: "Segment 5", icon: Layout01Icon },
  { href: "/moderation", label: "Chat moderation", segment: "Segment 6", icon: MessageMultiple01Icon },
  { href: "/limits", label: "When not to use Jev", segment: "Outro", icon: Alert02Icon },
] as const
