/**
 * App-owned vocabularies that Jev chooses from.
 *
 * Tip from the script: "LLM once, Jev at runtime". The rich descriptions below
 * are the kind of thing a big model writes once, offline. At runtime Jev only
 * has to match the user's words against them.
 */

/** The "none of these" option every intent search includes. */
export const NONE = "none"

export type Setting = {
  key: string
  label: string
  group: "Accessibility" | "Appearance" | "Notifications" | "Account" | "Media"
  description: string
  control: "switch" | "slider"
}

export const SETTINGS: Setting[] = [
  {
    key: "reduceMotion",
    label: "Reduce Motion",
    group: "Accessibility",
    control: "switch",
    description:
      "Turns off animations, transitions, parallax, zooming and sliding effects. For users who find movement distracting, flashy, dizzying or nauseating, or who want the interface to feel calmer and less busy.",
  },
  {
    key: "reduceTransparency",
    label: "Reduce Transparency",
    group: "Accessibility",
    control: "switch",
    description:
      "Replaces blurred, translucent, glassy backgrounds with solid colors. Helps when the interface looks busy, flashy, shimmery or hard to read because content shows through panels.",
  },
  {
    key: "fontSize",
    label: "Font Size",
    group: "Accessibility",
    control: "slider",
    description:
      "Makes text bigger or smaller everywhere. For when text is too small, tiny, hard to read, hard to see, or the user is squinting or has poor eyesight.",
  },
  {
    key: "increaseContrast",
    label: "Increase Contrast",
    group: "Accessibility",
    control: "switch",
    description:
      "Makes text and borders darker and backgrounds plainer so things stand out. Helps when text looks faded, washed out, grey, pale or is hard to read.",
  },
  {
    key: "lineSpacing",
    label: "Line Spacing",
    group: "Accessibility",
    control: "slider",
    description:
      "Adds more space between lines of text. Helps readability when paragraphs feel cramped, dense, crowded or like a wall of text, and for dyslexic readers.",
  },
  {
    key: "colorFilters",
    label: "Color Filters",
    group: "Accessibility",
    control: "switch",
    description:
      "Adjusts colors for color blindness (red-green, blue-yellow) or tints the screen. For users who can't tell colors apart.",
  },
  {
    key: "darkMode",
    label: "Dark Mode",
    group: "Appearance",
    control: "switch",
    description:
      "Switches to a dark theme with light text on a dark background. For night use, when the screen is too bright, blinding or hurts the eyes in the dark.",
  },
  {
    key: "compactMode",
    label: "Compact Mode",
    group: "Appearance",
    control: "switch",
    description:
      "Shows more on screen by shrinking padding and spacing. For users who want denser lists, less whitespace, or to fit more items at once.",
  },
  {
    key: "notifications",
    label: "Push Notifications",
    group: "Notifications",
    control: "switch",
    description:
      "Controls alerts, badges and pop-ups sent to this device. For users who get too many pings, want to stop being bothered, or want to be alerted about new activity.",
  },
  {
    key: "doNotDisturb",
    label: "Do Not Disturb",
    group: "Notifications",
    control: "switch",
    description:
      "Temporarily silences all notifications and sounds, e.g. during meetings, focus time, sleep or at night.",
  },
  {
    key: "soundEffects",
    label: "Sound Effects",
    group: "Media",
    control: "switch",
    description:
      "Plays clicks, chimes and interface sounds. For users who find the app too noisy, loud or beeping, or want audio feedback.",
  },
  {
    key: "autoplayVideo",
    label: "Autoplay Videos",
    group: "Media",
    control: "switch",
    description:
      "Starts videos and GIFs automatically in feeds. Turn off to save data or to stop moving, distracting media from playing on its own.",
  },
  {
    key: "twoFactor",
    label: "Two-Factor Authentication",
    group: "Account",
    control: "switch",
    description:
      "Requires a code from an authenticator app when signing in. For making the account more secure, stopping hackers, or 2FA / MFA setup.",
  },
  {
    key: "dataExport",
    label: "Export My Data",
    group: "Account",
    control: "switch",
    description:
      "Downloads a copy of everything in the account: files, messages, history. For backups, GDPR requests, or moving to another service.",
  },
]

export type Command = {
  key: string
  label: string
  shortcut?: string
  description: string
}

export const COMMANDS: Command[] = [
  {
    key: "toggleTheme",
    label: "Toggle dark theme",
    shortcut: "D",
    description:
      "Switch between light and dark appearance. Make it darker or lighter, night mode, eyes hurt, too bright.",
  },
  {
    key: "toggleSidebar",
    label: "Toggle sidebar",
    shortcut: "⌘B",
    description:
      "Show or hide the navigation panel on the left. Hide the left thing, more room, focus, collapse the menu.",
  },
  {
    key: "newDocument",
    label: "New document",
    shortcut: "⌘N",
    description: "Create a blank page, note or file to start writing.",
  },
  {
    key: "exportPdf",
    label: "Export as PDF",
    description:
      "Download the current document as a PDF file to print, send as an attachment, or save offline.",
  },
  {
    key: "shareLink",
    label: "Copy share link",
    description:
      "Copy a link to this page so someone else can view it. Send to a colleague, share with the team.",
  },
  {
    key: "duplicate",
    label: "Duplicate page",
    description: "Make a copy of the current page or document.",
  },
  {
    key: "zoomIn",
    label: "Zoom in",
    shortcut: "⌘+",
    description: "Make everything bigger on screen. Text too small, enlarge.",
  },
  {
    key: "fullscreen",
    label: "Enter full screen",
    description:
      "Hide browser chrome and fill the whole display. Presentation, distraction free.",
  },
  {
    key: "inviteTeammate",
    label: "Invite teammate",
    description:
      "Add a colleague or collaborator to this workspace by email.",
  },
  {
    key: "openSettings",
    label: "Open settings",
    shortcut: "⌘,",
    description: "Preferences, configuration, options for the app.",
  },
  {
    key: "print",
    label: "Print",
    shortcut: "⌘P",
    description: "Send the current page to a printer or paper.",
  },
  {
    key: "archive",
    label: "Archive page",
    description:
      "Move the page out of the way without deleting it. Declutter, put away, hide old stuff.",
  },
]

export type CliCommand = {
  key: string
  description: string
}

/** Every real command the CLI wrapper knows about. */
export const CLI_COMMANDS: CliCommand[] = [
  { key: "git commit", description: "Record staged changes to the repository with a message. Save a snapshot." },
  { key: "git push", description: "Upload local commits to the remote. Publish, send changes up." },
  { key: "git pull", description: "Fetch and merge changes from the remote. Update, download latest." },
  { key: "git status", description: "Show changed, staged and untracked files. What changed?" },
  { key: "git log", description: "Show commit history. List past commits." },
  { key: "git checkout -b", description: "Create and switch to a new branch." },
  { key: "git stash", description: "Temporarily shelve uncommitted changes. Put work aside." },
  { key: "git restore", description: "Discard changes in a file. Undo edits, revert a file." },
  { key: "git diff", description: "Show line-by-line changes not yet staged. Compare." },
  { key: "npm install", description: "Add a package dependency to the project. Install, add a library." },
  { key: "npm uninstall", description: "Remove a package dependency. Delete a library." },
  { key: "npm run dev", description: "Start the local development server. Run the app, serve, start." },
  { key: "npm test", description: "Run the test suite. Check tests, specs." },
  { key: "npm run build", description: "Create a production build. Compile, bundle." },
]

export type EmojiOption = { key: string; emoji: string; description: string }

/** A curated set (≤255) so the answer is always something we can render. */
export const FOLDER_EMOJI: EmojiOption[] = [
  { key: "folder", emoji: "📁", description: "Generic folder, nothing specific" },
  { key: "money", emoji: "💰", description: "Money, finance, budget, taxes, invoices, salary" },
  { key: "receipt", emoji: "🧾", description: "Receipts, expenses, bills, reimbursements" },
  { key: "chart", emoji: "📈", description: "Reports, analytics, metrics, growth, KPIs, sales" },
  { key: "plane", emoji: "✈️", description: "Travel, trips, flights, vacation, holidays abroad" },
  { key: "beach", emoji: "🏖️", description: "Summer, beach, vacation photos, holiday" },
  { key: "house", emoji: "🏠", description: "Home, house, apartment, mortgage, rent, renovation" },
  { key: "heart", emoji: "❤️", description: "Love, wedding, partner, family memories" },
  { key: "baby", emoji: "👶", description: "Baby, kids, children, parenting, school stuff" },
  { key: "dog", emoji: "🐶", description: "Dog, pets, vet, puppy" },
  { key: "cat", emoji: "🐱", description: "Cat, kitten" },
  { key: "camera", emoji: "📷", description: "Photos, pictures, photography, screenshots" },
  { key: "music", emoji: "🎵", description: "Music, songs, playlists, audio, band" },
  { key: "film", emoji: "🎬", description: "Video, movies, film, editing, YouTube" },
  { key: "book", emoji: "📚", description: "Books, reading, study, notes, research, school, university" },
  { key: "pencil", emoji: "✏️", description: "Writing, drafts, essays, blog posts, ideas" },
  { key: "code", emoji: "💻", description: "Code, programming, software, dev, projects, repos" },
  { key: "bug", emoji: "🐛", description: "Bugs, issues, debugging, errors, crash logs" },
  { key: "rocket", emoji: "🚀", description: "Launch, startup, side project, release, shipping" },
  { key: "art", emoji: "🎨", description: "Design, art, illustrations, mockups, branding" },
  { key: "briefcase", emoji: "💼", description: "Work, job, office, clients, career, resume" },
  { key: "calendar", emoji: "📅", description: "Planning, schedule, meetings, events, agenda" },
  { key: "health", emoji: "🩺", description: "Health, medical, doctor, prescriptions, insurance" },
  { key: "gym", emoji: "🏋️", description: "Fitness, workouts, gym, running, training" },
  { key: "food", emoji: "🍳", description: "Recipes, cooking, food, meal plans, groceries" },
  { key: "car", emoji: "🚗", description: "Car, vehicle, driving, repairs, insurance" },
  { key: "game", emoji: "🎮", description: "Games, gaming, mods, saves" },
  { key: "gift", emoji: "🎁", description: "Gifts, birthdays, presents, wishlists, christmas" },
  { key: "lock", emoji: "🔒", description: "Private, passwords, secrets, sensitive, confidential" },
  { key: "archive", emoji: "🗄️", description: "Archive, old stuff, backups, misc" },
  { key: "plant", emoji: "🌱", description: "Garden, plants, nature, sustainability" },
  { key: "graduation", emoji: "🎓", description: "Degree, graduation, courses, certificates, thesis" },
]

export type ExpenseCategory = { key: string; label: string; emoji: string; description: string }

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  { key: "groceries", label: "Groceries", emoji: "🛒", description: "Supermarket, food shopping, household supplies" },
  { key: "dining", label: "Dining out", emoji: "🍽️", description: "Restaurants, cafes, takeaway, coffee, lunch, dinner, drinks, bars" },
  { key: "transport", label: "Transport", emoji: "🚕", description: "Taxi, ride share, fuel, gas, parking, train, bus, metro tickets" },
  { key: "travel", label: "Travel", emoji: "✈️", description: "Flights, hotels, airbnb, rental cars, trips" },
  { key: "housing", label: "Housing", emoji: "🏠", description: "Rent, mortgage, repairs, furniture" },
  { key: "utilities", label: "Utilities", emoji: "💡", description: "Electricity, water, internet, phone bill, heating" },
  { key: "entertainment", label: "Entertainment", emoji: "🎟️", description: "Movies, concerts, games, streaming subscriptions, events" },
  { key: "health", label: "Health", emoji: "💊", description: "Pharmacy, doctor, dentist, gym membership" },
  { key: "shopping", label: "Shopping", emoji: "🛍️", description: "Clothes, electronics, gadgets, online orders" },
  { key: "gifts", label: "Gifts", emoji: "🎁", description: "Presents, birthdays, donations" },
  { key: "work", label: "Work", emoji: "💼", description: "Office supplies, software, coworking, business costs" },
]

export type ComposerMode = { key: string; label: string; description: string }

export const COMPOSER_MODES: ComposerMode[] = [
  { key: "chat", label: "Fast", description: "Quick everyday questions, casual chat, short rewrites, simple facts." },
  { key: "research", label: "Research", description: "Deep research across many web sources, comparisons, reports, current events, citations." },
  { key: "code", label: "Code", description: "Writing, debugging or reviewing code, stack traces, programming errors, scripts." },
  { key: "reasoning", label: "Reasoning", description: "Hard math, logic puzzles, proofs, multi-step planning, careful thinking." },
  { key: "image", label: "Image", description: "Generate, draw or create a picture, illustration, logo or photo." },
]

export function byKey<T extends { key: string }>(items: T[]) {
  return Object.fromEntries(items.map((item) => [item.key, item])) as Record<string, T>
}
