# Jev Decides, Code Does: Video Script (v2)

A recording script for a ~11 minute video. Each beat has what's **on screen** and what to **say**. The spoken lines total about 1,600 words, which is roughly 11 minutes at a relaxed pace.

Keep **Probabilities** switched on in the header for the whole recording, unless a beat says to turn it off. Every prompt in quotes was tested against live Jev (`typesafe/jev-1.13` via OpenRouter). Numbers can drift a few points between takes.

**What changed from `idea.md`, and why**
- **Open on a demo, not a definition.** The first 20 seconds decide whether people stay, so the definition comes second.
- **One running example teaches all three primitives.** One message gets a Choice, a Score and a Noul in a single call, so viewers see the primitives instead of reading them off a table.
- **Confidence tiers are shown, not explained.** Each segment names which tier it's in, so the pattern repeats without a separate lecture.
- **Show failures inside the segments.** The "when not to use it" section is short because viewers will already have seen Jev be unsure or wrong (D&D folder, Uber Eats, fitness screen).
- **Measured numbers, not only vendor numbers.** The header shows real latency on every call, so the video can say "measure your own" and prove it at the same time.

---

## 0. Cold open (0:00–0:25)

**On screen:** Settings search tab. Type slowly: "scrolling makes me feel a bit seasick". Reduce Motion jumps to the top.

**Say:**
> I never typed "motion" or "animation". The app still found the right setting, in about a third of a second, for a tiny fraction of a cent.
>
> No LLM wrote a word here. This is Jev, a model that doesn't generate text at all. It only makes decisions. In the next ten minutes I'll show you eight small features built on it, and the one rule that makes all of them work.

---

## 1. What Jev is (0:25–1:35)

**On screen:** Home page playground. Paste:
"honestly the constant animations in this app are giving me a migraine, fix it or I'm uninstalling this garbage"

**Say:**
> Jev is what TypeSafe calls a System One model: fast, intuitive judgment rather than slow reasoning. You give it a state, which here is this message, and a list of questions. It gives you back typed answers with probabilities.
>
> There are three question types. A **Choice** picks one option from a list you define, up to 255 of them. Here, which setting is this about? Reduce Motion, basically a hundred percent.
>
> A **Score** places the input on a scale you define. How technical is this? Not very.
>
> A **Noul**, which is TypeSafe's yes/no type, gives you the probability of "yes". Is this toxic? Forty-five percent. It's angry, but it's a real complaint, and Jev didn't call it toxic. That's the right answer.

**On screen:** Point at the latency badge in the header.

> That was one call with three questions, and the header shows how long it really took. From my machine, through OpenRouter, it's usually three to five hundred milliseconds. TypeSafe quotes faster numbers from the US West Coast, so measure your own.

**On screen:** Paste "you're genuinely the worst developer I've ever seen, go back to making spreadsheets". No setting at all; toxic 96%.

> This one matches none of the settings, so it says none. It's toxic, and it says that too.
>
> There's one idea to keep in mind for the whole video: **Jev decides, code does.** The model makes the judgment calls. Anything with a correct answer, like dates, math or rendering, is ordinary code.

---

## 2. The confidence rule (1:35–1:55)

**On screen:** The three-tier strip on the home page.

**Say:**
> Every answer comes with a confidence, and that's what makes the UI good. High confidence: just do it, with undo. Medium: suggest it. Low: do nothing and let the normal UI handle it. Every feature from here on is one of those three.

---

## 3. Intent search (1:55–4:00)

### Settings search (1:55–2:40)

**On screen:** Settings search tab. Type these one after another:
1. "someone in Brazil logged into my account and I've never been there" → Two-factor auth
2. "I'm screen sharing with a client and don't want anything embarrassing popping up" → Do Not Disturb
3. "videos start blasting sound on the train" → Autoplay 72%, ranked with others

**Say:**
> This is the most useful thing on the list. People describe the problem, and settings pages only understand the setting's name.
>
> None of these share a word with the setting they find. The last one is only seventy-two percent sure, so it doesn't jump to one answer. It ranks the list and lets me pick.
>
> Under the hood it's one Choice: here's what the user typed, here are all the settings with a one-line description each, plus "none of these". The probabilities are the ranking, so I don't need embeddings or a vector database.
>
> One tip: have a big LLM write those descriptions once, offline. Then Jev matches against them live, on every keystroke.

### Command palette (2:40–3:15)

**On screen:** Command search tab. Type:
1. "get this out of my way but don't delete it, I might need it next year" → Archive
2. "lass es dunkler aussehen" → Toggle theme, and the theme actually changes
3. "my boss needs to see this before Friday" → Share link only 53%, nothing forced

**Say:**
> Same call, in a command palette. "Get this out of my way but don't delete it" means Archive.
>
> German works with no setup, and the dark theme flips on.
>
> And "my boss needs to see this before Friday". Share is the best guess, but it's only fifty-three percent, so it just goes to the top of the list. Nothing runs by itself.

### Did you mean? (3:15–4:00)

**On screen:** CLI tab. Type:
1. `git snapshot -m "wip"` → Did you mean `git commit`? Press Enter, it runs.
2. `git sidequest login-page` → a short list, `checkout -b` first
3. `npm make-coffee` → command not found

**Say:**
> Normal "did you mean" checks spelling. "Snapshot" isn't spelled anything like "commit", but it means the same thing.
>
> "Sidequest login-page" is a guess, so I get a short list instead of one answer. And for "make coffee" it says "command not found", which is correct.
>
> All three tiers in fifteen seconds.

---

## 4. Small typing interactions (4:00–5:05)

Quick cuts, no deep explanation.

**On screen:** Folder icon tab.
- "Things to sort out before the baby arrives" → 👶 applied
- "Maria's wedding speech drafts" → ❤️ as a faint preview (76%)
- "D&D campaign notes" → stays 📁 (52% vs 42%)

**Say:**
> Rename a folder and it picks an icon. Sure means it applies it. Fairly sure means a faint preview. For D&D it can't decide between a game and a book, so it leaves the folder alone. And if I pick an icon myself, it never touches it again.

**On screen:** Send → Schedule tab.
- "Happy anniversary you two ❤️ 10 years! Send tomorrow at 8" → button becomes **Schedule**
- "The deploy is scheduled for Friday at 5pm, please don't merge anything after 3" → stays **Send**

**Say:**
> This is where the split between model and code matters. Code finds the time, because dates have a right answer. Jev answers one question: is this message meant to be read at that time?
>
> The second one literally says "scheduled", and it's still a normal message you send now. Seven percent, so the button stays Send.

**On screen:** Expense tab.
- "Protein powder" → Groceries 68 / Health 32 as chips. Pick Health, add it.
- Type "Protein powder" again → "Your history" answers, no Jev call
- "Uber Eats" → Transport from the dictionary

**Say:**
> Expenses go through layers. Exact match first, then my own history, then Jev, then me if it's still unsure. Protein powder is a coin flip, so it asks. I say Health. Next time my history answers and Jev isn't even called.
>
> The cheap layers aren't perfect. "Uber Eats" matches "Uber" in the dictionary and goes to Transport. So put your layers in a sensible order, and let users fix mistakes.

---

## 5. Model picker in the composer (5:05–6:35)

**On screen:** Composer, starting in **Fast** mode.

**Say:**
> Chat apps make you choose a model before you type. Here the composer reads the draft and suggests one. It never switches by itself. You picked a mode, and changing it under your fingers would feel hostile.

**On screen:** Type the stack-trace prompt:
"Our checkout page started throwing 500s right after this morning's deploy, here's the stack trace: TypeError: Cannot read properties of null (reading 'id') at createOrder (orders.ts:42)"

> A stack trace means Code, a hundred percent. Click, switched.

**On screen:** Clear and type: "Three friends split a dinner bill unevenly, and one of them paid for drinks too. Walk me through who owes whom, step by step". A ghost chip shows first, then it commits.

> While I type, the suggestion shows faintly and doesn't jump around. It only commits once it wins twice in a row. That's the calm-UI trick from Shapeshift. Without it, the chip flickers on every keystroke.

**On screen:** "Find the latest benchmarks for Bun vs Node and write a script that reproduces them on my machine" → Did you mean Research 64 / Code 35.

> This one is two jobs, so it gives me both options.

**On screen:** "I'm choosing between the Framework 13 and a MacBook Air for dev work. What are people saying about battery life on the newest models?" → no mode chip, but "Turn on web search?"

> The same call asks yes/no side questions too. Does this need the web? Yes, eighty-six percent. Is it about a file? Is it actually a settings request?

**On screen:** "All the animations in this app make me motion sick, can you make them stop?" → Reduce Motion switch inline.

> That last one lets the composer just fix the problem.

**On screen:** "Should we rewrite our Rails monolith in Go?" → nothing.

> And this is my favorite: nothing. Jev isn't sure, and Fast is one of its top two guesses, so it stays quiet. Knowing when to say nothing is the whole feature.

---

## 6. Response depth (6:35–7:50)

**On screen:** Response depth page, two columns.
- Left: "What's the difference between a mutex and a semaphore in Rust's tokio, and when does RwLock beat both? Short answer please."
- Right: "My computer says 'disk almost full' and I'm scared to delete anything. What's safe to remove? Please explain slowly, I'm not good with computers"

Click Ask on both.

**Say:**
> This one works differently. Jev doesn't replace the big model. It steers it.
>
> Two scores for each message: how technical is it, and how much detail does this person want? Code turns those two numbers into a style instruction, and a normal LLM writes the answer.
>
> On the left: very technical and wants little detail, so the answer is short and dense. On the right: not technical and wants a lot of detail, so the answer is slow, step by step, and reassuring.
>
> You can only see this side by side. In a real app, each user just gets an answer that feels written for them. Checking a message costs about as much as nothing, and the big model does less work on the short answers.

---

## 7. json-render: UI from choices (7:50–9:00)

**On screen:** json-render page. Put the credit in the description on screen.

**Say:**
> This idea comes from Vercel Labs' json-render, by Chris Tate. It isn't mine, and it's clever. Let's see what Jev can do with it.

**On screen:** "Admin page to manage team members and their roles, with a form to invite someone new" → Generate.

> Jev doesn't write JSX or JSON. The app owns thirteen component types, and Jev answers questions about them. Batch one: which components, and how many? Batch two: which section does each go in, in what order, with which label? Code builds the tree and validates it. Picking from a menu is much easier to constrain than generating code token by token.

**On screen:** "Billing settings with a warning that my card expires soon and a list of past invoices". Point at "1 dropped (over 14)".

> There are real limits. Fourteen new elements per batch, and anything over that is dropped. You can see it here.

**On screen:** "Fitness app home screen: weekly goal progress, today's workouts and my current streak" → three stat tiles all labelled "Tasks done".

> And this one is valid but bad. Three identical stat tiles, because the labels come from a fixed list and none of them are about fitness. Valid structure isn't the same as good design. Code guarantees the first. It can't guarantee the second.

---

## 8. Twitch chat moderation (9:00–10:40)

**On screen:** Moderation page. The chat is running. Open the Rules tab and add: "No self-promotion or links to other channels".

**Say:**
> The last demo is where all of this comes together: live chat moderation.
>
> Most bots either delete a message or keep it. Here there are three outcomes. Very confident: hidden right away, and a mod can still see it. Fairly confident: held for a mod. Everything else goes through. Deleting someone's message because a model guessed wrong hurts a real person.
>
> Rules are plain English. I just added "no self-promotion", with no training and no word list.

**On screen:** Type these in the chat, one at a time:
1. "who is the lady in the blue cloak, is she important later?" → passes
2. "the ending where you become Elden Lord with Ranni is the best one btw" → hidden, spoiler
3. "you know you could just summon mimic tear right? just saying" → hidden, backseat
4. "wow, only 40 deaths on this boss, truly a gaming legend 🙂" → hidden, passive-aggressive
5. "follow me on kick, i stream elden ring too, way better runs" → hidden, custom rule
6. "imagine not knowing the tree sentinel is optional lmao" → held for review

> A question about a character isn't a spoiler. Naming the ending is, and it never says the word "spoiler". Backseating. The smiley at the end of "truly a gaming legend" is exactly what a word filter can't read. My new rule catches the self-promo. And the snarky one in the middle gets held, because a person should decide that one.

**On screen:** Turn off the passive-aggressive rule and send the "gaming legend" message again. It passes. Then point at the footer with calls per minute and messages per call.

> Rules are per channel. If this streamer is fine with sarcasm, they turn that rule off and the same message goes through.
>
> Chat is fast, so messages are batched: one call every one and a half seconds, with the whole window in it. That's forty calls a minute per channel. Early access allows twelve hundred a minute, so one key covers about thirty busy channels.

---

## 9. When not to use it (10:40–11:10)

**On screen:** The Limits page.

**Say:**
> Quick honesty check. Jev doesn't write text, and it doesn't read images. If a regex or a keyword solves it, use that, because speed makes it tempting to overuse. Always have a fallback for when the API is down, slow or unsure. Everything you saw has one. Keep the key on your server. And measure your own latency and cost. Don't trust anyone's marketing, including this video.

---

## 10. Outro (11:10–11:40)

**On screen:** The recap card, then the resources row.

**Say:**
> Every good example here had three things in common. The user's words didn't match the app's words. The set of possible answers was closed and known. And a wrong answer was cheap to undo.
>
> If your feature has those three, Jev is probably a good fit. Jev decides, code does.
>
> The whole demo app is open source, and it's linked below along with every project I mentioned. Thanks for watching.

---

## Shorts

1. **"scrolling makes me feel a bit seasick" → Reduce Motion** (the cold open, as it is).
2. **Chat moderation:** the spoiler that never says "spoiler" gets hidden, the question about the character passes. Fifteen seconds, no explanation needed.
3. **Bonus: "Should we rewrite our Rails monolith in Go?" → nothing.** "The best AI feature I built this week does nothing, on purpose."

## Before recording

- Push the latest layout commit and put the repo link in the description.
- Run each demo once before recording to warm up the dev server, so the first call isn't slow.
- Check the credit line and link for Chris Tate / @ctatedev before publishing.
