# Jev Use Cases in Apps: Video Outline

A plan for a ~10–12 minute video showing small, genuinely useful interactions built with Jev, TypeSafe's "System One" model.

---

## 1. Intro: What Jev is (~1 min)

**One-line pitch:** Jev doesn't write text. It makes decisions. You give it a state and questions, and it returns typed answers with probabilities.

**The three primitives:**

| Primitive | What it does | Example |
|---|---|---|
| **Choice** | Picks one option from a set you define (up to 255) | Which setting matches "remove animations"? |
| **Score** | Places the input on an ordered scale (2–10 levels) | How technical is this message? |
| **Noul** | Yes/no question, returns P(yes) | Is this chat message toxic? |

**Why it fits micro-interactions:**
- Fast enough to run as you type (vendor figures: ~70–500 ms, most around 100 ms from the US West Coast)
- Cheap enough to run on every keystroke
- Several questions in one call cost about the same time as one
- Every answer comes with a **confidence value**, which is the key to good UI

**The theme to repeat throughout:**
> **Jev decides, code does.**
> The model makes judgment calls. Deterministic code handles anything with a correct answer (dates, math, rendering).

---

## 2. The core UI pattern: confidence tiers (~30 sec, show once, refer back)

| Confidence | UI behavior |
|---|---|
| High | Apply automatically, with undo |
| Medium | Show a suggestion chip or "Did you mean" |
| Low | Do nothing, fall back to normal UI |

Supporting ideas:
- **Calm UI:** Don't let the UI flicker as the user types. Only switch when a new answer wins twice in a row or is very confident. Use a buffer zone so badges don't blink on and off. (Source: Shapeshift's state machine)
- **Always have a fallback:** Keyword or fuzzy matching runs first or when the API is down. The UI shouldn't know the difference.

---

## 3. Segment 1: Intent search trio (~2 min)

**One primitive, three places in the app.** All three use a single Choice call over a known list.

### 3a. Settings search by intent
- User types: `remove animations` → **Reduce Motion**
- User types: `things are too flashy` → Reduce Motion, Reduce Transparency
- User types: `make it easier to read` → Font Size, Contrast, Line Spacing (ranked by probability)

### 3b. Command search by intent (Cmd+K)
- `make it darker` → Toggle dark theme
- `hide the left thing` → Toggle sidebar
- Works across languages without extra setup

### 3c. "Did you mean?"
- Search with no results → "Did you mean: Export as PDF?" instead of an empty state
- Failed slash command → nearest command by meaning, not spelling
- Reference: CLI wrapper where `git record` → `git commit`, `npm add` → `npm install`

**Implementation notes:**
- Fuzzy search stays the baseline; Jev reranks
- The full probability distribution *is* the ranking, so no embeddings or vector index needed
- Tip ("LLM once, Jev at runtime"): have a big LLM write rich descriptions of each setting/command once, offline, then Jev matches against those descriptions live

**Sketch of the question:**
```
state:    user query + current screen
question: Choice — "Which setting does the user want?"
options:  [each setting with a one-line description] + "none of these"
```

---

## 4. Segment 2: Small typing interactions (~1 min, quick cuts)

Fast, delightful, shows the per-keystroke speed.

- **Folder/project rename → emoji or icon** picked from a curated set (≤255 options)
  - Never overwrite an icon the user picked by hand
- **Tag/category auto-suggest** while typing a title (expense, task, issue label)
  - Layering: exact match → user's own history → Jev → review if uncertain (Spliit Cloud pattern)
- **Text changes based on intent**, e.g. a placeholder or button label that adapts to what's being typed ("Send" → "Schedule" when the message mentions "tomorrow at 9")

**Keep it short:** 2–3 quick examples, no deep explanation.

---

## 5. Segment 3: Model picker in the composer (~1.5 min)

Live as you type, the composer suggests the best model or mode.

**Behavior:**
- Choice over available models/modes, run on debounced keystrokes
- Only show a subtle chip ("Switch to Research?") above a confidence threshold
- **Never auto-switch.** The user already chose a mode, and changing it under their fingers feels hostile

**Extra signals in the same call (Noul):**
- Does this need web search?
- Is the user asking about a file?
- Is this actually a settings request? (e.g. "I need to remove animations" → inline Reduce Motion shortcut)

**Demo moments:**
1. Show the confidence value on screen
2. Show a case where it's unsure and **suggests nothing**. That restraint is the point

**States (from Shapeshift):** ghost preview → "Did you mean" chips when two options are close → committed suggestion

---

## 6. Segment 4: Response depth by user expertise (~1.5 min)

Jev reads the user's message and steers the LLM's response style.

**Logic:**
- Technical user, terse and precise message → **concise** answer
- Less technical user, vague or exploratory message → **more explained, in-depth** answer

**How it works:**
1. Score: "How technical is this message?" (e.g. 5 levels)
2. Optionally Score: "How much detail does the user seem to want?"
3. Code maps the score to a response-style instruction passed to the LLM

**The twist to highlight:** Jev isn't replacing the big model here. It's steering it.

**Demo:** Side by side. Same question asked two ways → two Score values → two different responses. Without the side-by-side, this feature is invisible.

---

## 7. Segment 5: json-render, assembling UI from choices (~1.5 min)

**Credit clearly:** Vercel Labs' json-render (by @ctatedev). Not your project.

**How it works:**
- Jev never generates UI code
- Batch 1: which components to include and how many
- Batch 2: parent slots and ordering
- Code builds and validates JSON from 17 app-owned component types

**Be honest about limits:**
- 14 new elements per batch, depth 4
- Structurally valid ≠ well designed

**Why it matters:** Choosing blocks is much easier to constrain and validate than generating code character by character.

Links:
- https://github.com/vercel-labs/json-render
- https://github.com/JackZeng/Jev_apps/blob/main/cases/2026-09-19-json-render-ui/README.en.md

---

## 8. Segment 6: Twitch chat moderation (~2 min, closer)

Real-time classification of live chat to catch negative comments.

**What makes it stand out from existing bots:**

1. **Graduated actions, not delete-or-keep**
   | Confidence | Action |
   |---|---|
   | High | Hide instantly |
   | Medium | "Held for mod review" |
   | Low | Pass through |
   Deleting on AI judgment alone hurts real people when it's wrong. Showing this nuance makes the demo thoughtful.

2. **Custom rules in plain English** that keyword filters can't handle:
   - "Spoilers for the game being played"
   - "Backseat gaming"
   - "Passive-aggressive toward the streamer"

3. **Batching** a window of messages per call, since busy chats can exceed rate limits (1,200 requests/min during early access)

**Questions per message:**
```
Noul:  Is this message hostile toward someone?
Noul:  Does it contain spoilers for [current game]?
Score: Severity (none / mild / moderate / severe)
```

**Existing similar projects to acknowledge:** Telegram anti-spam bot, Discord moderation bot, reply-guy stamper Chrome extension.

---

## 9. When NOT to use Jev (~30 sec)

Builds trust with viewers.

- It doesn't write text and doesn't read images
- Don't use it where a simple rule or keyword match works. Speed invites overuse
- Keep fallbacks: API down, slow network, low confidence
- API key must stay server-side (use a small proxy)
- Vendor speed/cost numbers are marketing; measure your own



## 11. Outro (~30 sec)

- Recap: one theme, **Jev decides, code does**
- The best use cases share three traits:
  1. The user's words don't match the app's vocabulary
  2. The set of possible answers is closed and known
  3. A wrong answer is cheap or undoable
- Point to resources

---

## Resources

**Official**
- TypeSafe docs: https://docs.typesafe.ai

**Catalogs**
- shipwithjev: https://www.shipwithjev.com
- madewithlaya: https://www.madewithlaya.com
- Jev_apps (JackZeng): https://github.com/JackZeng/Jev_apps

**Referenced projects**
- Shapeshift (text box that becomes UI): https://github.com/anishfn/shapeshift · demo: https://shapeshiftui.vercel.app (add `?debug=1` to see probabilities)
- json-render (Vercel Labs): https://github.com/vercel-labs/json-render
- Settings finder: https://www.shipwithjev.com/builds/settings-finder
- CLI did-you-mean wrapper: https://www.shipwithjev.com/builds/cli-did-you-mean-wrapper
- Spliit Cloud (expense categories): https://github.com/antonio-ivanovski/spliit-cloud
- Word house-style formatter: https://www.shipwithjev.com/builds/word-house-style
- Laya/Jev cascade: https://www.madewithlaya.com/builds/laya-jev-lab-cascade

---

## Short-form clips

If cutting shorts from the main video, the two most clip-able moments:
1. **Intent search trio**: "remove animations" → Reduce Motion
2. **Twitch chat**: live messages getting hidden/held in real time
