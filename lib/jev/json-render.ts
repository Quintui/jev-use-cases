/**
 * A small take on Vercel Labs' json-render (by @ctatedev).
 * Jev never writes UI code. It only answers questions about app-owned
 * component types; code builds and validates the JSON tree.
 */

export const MAX_ELEMENTS = 14
export const MAX_DEPTH = 4

export type LeafType =
  | "heading"
  | "text"
  | "stat"
  | "input"
  | "switch"
  | "button"
  | "badge"
  | "avatar"
  | "alert"
  | "progress"
  | "table"
  | "list"
  | "separator"

export const LEAF_TYPES: { type: LeafType; description: string }[] = [
  { type: "heading", description: "A title at the top of a section" },
  { type: "text", description: "A paragraph of explanatory copy" },
  { type: "stat", description: "A single big number / KPI tile, e.g. revenue or orders" },
  { type: "input", description: "A text field the user fills in, e.g. email or name" },
  { type: "switch", description: "An on/off toggle for a preference" },
  { type: "button", description: "A clickable action like Save, Submit or Sign up" },
  { type: "badge", description: "A small status label or tag" },
  { type: "avatar", description: "A round profile picture of a person" },
  { type: "alert", description: "A callout with a warning or important notice" },
  { type: "progress", description: "A progress bar showing completion toward a goal" },
  { type: "table", description: "Rows and columns of records, e.g. recent orders" },
  { type: "list", description: "A vertical list of items, e.g. activity feed or tasks" },
  { type: "separator", description: "A thin divider line between groups" },
]

/** Words Jev can pick for labels. It chooses them; it never types them. */
export const VOCAB = {
  input: ["Email", "Password", "Full name", "Company", "Search", "Message", "Phone"],
  button: ["Save", "Submit", "Sign up", "Log in", "Continue", "Export", "Invite", "Contact us"],
  stat: ["Revenue", "Orders", "Customers", "Conversion", "Avg. order", "Active users", "Tasks done"],
  heading: ["Overview", "Create account", "Welcome back", "Profile", "Settings", "Recent activity", "Contact"],
  switch: ["Email notifications", "Dark mode", "Two-factor auth", "Marketing emails"],
} satisfies Partial<Record<LeafType, string[]>>

export type LabeledType = keyof typeof VOCAB

export function isLabeled(type: LeafType): type is LabeledType {
  return type in VOCAB
}

export type PlannedElement = { id: string; type: LeafType }

export type UINode =
  | { type: "root"; children: UINode[] }
  | { type: "section"; id: string; children: UINode[] }
  | { type: LeafType; id: string; label?: string }

export type LayoutAnswer = {
  parent: string
  order: number
  label?: string
}

/** Expands "how many of each" into concrete element ids. */
export function expandPlan(counts: Record<string, number>) {
  const sections = Math.min(3, Math.max(1, Math.round(counts.section ?? 1)))
  const elements: PlannedElement[] = []
  for (const { type } of LEAF_TYPES) {
    const n = Math.round(counts[type] ?? 0)
    for (let i = 1; i <= n; i++) elements.push({ id: `${type}_${i}`, type })
  }
  const dropped = Math.max(0, elements.length + sections - MAX_ELEMENTS)
  return {
    sections: Array.from({ length: sections }, (_, i) => `section_${i + 1}`),
    elements: elements.slice(0, elements.length - dropped),
    dropped,
  }
}

/** Code assembles and validates. Structurally valid ≠ well designed. */
export function buildTree(
  sections: string[],
  elements: PlannedElement[],
  layout: Record<string, LayoutAnswer>
): { tree: UINode; issues: string[] } {
  const issues: string[] = []
  const bySection = new Map(sections.map((id) => [id, [] as UINode[]]))

  const sorted = [...elements].sort(
    (a, b) => (layout[a.id]?.order ?? 0) - (layout[b.id]?.order ?? 0)
  )
  for (const element of sorted) {
    const answer = layout[element.id]
    let parent = answer?.parent ?? sections[0]
    if (!bySection.has(parent)) {
      issues.push(`${element.id}: unknown parent "${parent}", moved to ${sections[0]}`)
      parent = sections[0]
    }
    bySection.get(parent)!.push({ type: element.type, id: element.id, label: answer?.label })
  }

  const children: UINode[] = []
  for (const [id, nodes] of bySection) {
    if (nodes.length === 0) {
      issues.push(`${id}: empty section removed`)
      continue
    }
    children.push({ type: "section", id, children: nodes })
  }

  const tree: UINode = { type: "root", children }
  if (depthOf(tree) > MAX_DEPTH) issues.push(`Tree deeper than ${MAX_DEPTH}`)
  return { tree, issues }
}

function depthOf(node: UINode): number {
  if (!("children" in node)) return 1
  return 1 + Math.max(0, ...node.children.map(depthOf))
}
