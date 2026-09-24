# Small AI features you can build with Jev

First draft. Demo-led, with brief explanations for developers and app builders. Target: approximately 6:50, including typing and pauses. Timestamps are editing targets; bracketed directions are not spoken.

The demonstrations below describe the intended footage, not verified model outputs. Rehearse each input before recording and adjust the narration to the result shown.

## 0:00–0:25 · Open with the settings demo

[Start on the app. Type “remove animations” into settings search. Let the Reduce Motion result appear before speaking.]

I type “remove animations,” and the app finds Reduce Motion. I don't need to know what the setting is called.

[Quick preview: a folder icon changes; a composer suggests Research.]

These are a few examples of what you can build with Jev. I want to show you where it fits into an app, and how much control you still have over what happens.

## 0:25–1:00 · Explain just enough

[Show a small overlay: input, question, typed answer. Then reveal Choice, Score, and Noul alongside one example each.]

Jev is a model from TypeSafe. You give it some context and a question, and it returns a structured decision your code can use.

There are three question types. Choice picks from options you provide. Score rates something on a scale you define. Noul gives you the probability that the answer to a yes-or-no question is yes.

You can ask several questions in one request. Then your code decides what to do with the answers.

That's the pattern throughout these demos: Jev decides, code does.

## 1:00–2:25 · Search by intent

[Return to settings. Show the query beside the available settings and their descriptions.]

[Show an explanatory overlay: “reduce moton” beside “Reduce Motion,” then “stop things moving” beside the same setting.]

Fuzzy search matches similar text. If I misspell “motion,” it can still find Reduce Motion because the letters are close.

“Stop things moving” describes what I want. Jev can match that intent to the setting's description, even when the words look different.

You can also improve ordinary search with descriptions and synonyms. Jev gives you another way to handle phrasing you haven't anticipated.

I give it the query and descriptions of the available settings, including “none of these” for unrelated requests.

[Open the command menu. Type “hide the left thing.” Show Toggle Sidebar, then select it.]

The same approach works in a command menu. “Hide the left thing” can find Toggle Sidebar.

Choice returns probabilities and a confidence value to help decide how strongly to present the result.

[Show one clear match, then a rehearsed ambiguous query.]

For a small, reversible change, you might apply a strong result with undo. For an uncertain match, show a suggestion. If nothing fits, leave the normal interface alone.

I'd keep exact and fuzzy matching as the baseline, with Jev helping when someone's wording needs interpretation.

## 2:25–2:55 · Small typing interactions

[Rename a folder “Summer trip.” Show its suggested icon. Cut to an expense titled “Lunch with Alex” and its category suggestion.]

You can use the same Choice question for smaller things. Pick a folder icon from a set you've chosen, or suggest a category while someone enters an expense.

These save a little manual work, but they need to respect what the user already chose. If I pick my own icon, keep it.

And wait for a short pause in typing. Suggestions should settle instead of changing with every letter.

## 2:55–3:45 · Suggest a mode in the composer

[In the composer, type “Compare the latest pricing for these hosting providers and include sources.” Show the Research suggestion and the actual returned values.]

Here's one for a chat app. As I write a message, Jev can suggest which of the app's modes fits it.

This request asks for current information and sources, so Research would be useful. The app offers a switch, and I choose whether to take it.

I'd keep that as a suggestion even with high confidence. If someone has already chosen a mode, changing it while they type would be annoying.

[Replace the draft with a rehearsed ambiguous request. Hold on the composer without a suggestion.]

For a vague message, there may not be enough information to recommend anything.

In the same request, you can also ask whether the message needs web search or refers to a file.

## 3:45–4:30 · Adjust response depth

[Show two messages side by side: “Explain what a database index does. I'm new to databases.” and “Explain B-tree index lookup briefly; assume I know SQL.” Show their scores and resulting responses.]

You can also use Jev before another model writes its answer.

These messages ask about a similar topic, but they ask for different explanations. Score can estimate how technical the message is and how much detail it requests. Your code turns those scores into instructions for the model writing the response.

One answer explains the basics. The other gets to the technical details faster.

I'd treat the wording as a clue, not a permanent label for the person. An experienced developer might want a long explanation too. An explicit request for detail should take priority.

## 4:30–5:15 · Assemble an interface

[Show a request for a small dashboard, then the selected components, JSON, and rendered result. On-screen credit: “json-render · Vercel Labs” and “Jev example · JackZeng/Jev_apps.”]

You can take this further and use decisions to assemble an interface.

This example uses json-render from Vercel Labs. The Jev approach comes from a community example linked below.

Start with a catalog of components. Ask which ones the screen needs, then where they should go. Code builds and validates the JSON, and json-render displays the components.

Jev is choosing from the building blocks you've provided. Your code owns the components and their behavior.

That gives you control over the output, although a valid layout can still look bad. You still need to judge the design.

## 5:15–6:20 · Chat moderation

[Show a simulated stream chat, clearly labeled “Demo chat.” Display the rule “No backseat gaming.” Feed in ordinary conversation, an insult, and unsolicited gameplay instructions.]

The last example is chat moderation. A streamer might have a rule like “no backseat gaming,” which can be awkward to express as a list of banned words.

Give Jev the rule and the messages. Ask whether each message breaks the rule, and use a separate Score question if you also want to estimate severity.

[Show the rule-violation probability next to each message. Demonstrate visible, held-for-review, and hidden states using rehearsed examples.]

The app can leave a message visible, hold it for a moderator, or hide it with a way to restore it. You choose those boundaries based on how the model performs on your chat.

A high probability means the model thinks the rule was broken. It doesn't tell you how serious the message is. Those are different questions.

[A moderator restores a held message.]

Context matters here. Friends teasing each other can look hostile in isolation. Include relevant context and let moderators correct mistakes.

You can also group messages into a request, with separate questions for each, instead of sending a request for every message.

## 6:20–6:50 · Close

[Return to settings search, then briefly show the component catalog. End with resource links.]

The use case I'd try first is intent search. You already have the settings or commands, and the user gets something useful without learning your app's vocabulary.

Use ordinary code where the answer is exact, like calculating a date. Keep a fallback for slow or failed requests, and measure latency in your own app.

I've linked the docs and the community projects behind these examples below. Pick one small interaction in your app and see whether this makes it easier to use.

---

## Recording notes

- The current workspace contains the intro and intent-search pages, plus logic for the other use cases. The typing, composer, response-depth, json-render, and moderation pages still need to be completed or sourced as credited footage before recording this full script. This draft does not establish a live Twitch integration.
- Record actual Jev responses. The app includes local heuristic fallbacks; label fallback footage if used. Choose the ambiguous examples after rehearsal, and show the returned values without inventing percentages.
- Response depth: the script recommends that explicit detail requests take priority. The current helper blends technicality and detail scores, so that behavior needs aligning before filming. The proposed moderation review and restore controls also need to exist in the footage.
- The fuzzy-search comparison is an explanatory overlay. The current app's keyword baseline uses literal substring matching, not typo-tolerant fuzzy search; do not label that baseline as a fuzzy-search benchmark. Rehearse “stop things moving” against Jev before filming.
- Keep narration running over most typing and transitions. Allow about 30–45 seconds total for silent result reveals and reading the screen. If the edit runs long, trim the expense-category cut first.

## Fact checks and credits (not spoken)

- Jev accepts state and typed questions and supports asking several questions together. See the [TypeSafe introduction](https://docs.typesafe.ai/introduction).
- The question types are documented under [Choice](https://docs.typesafe.ai/primitives/choice), [Score](https://docs.typesafe.ai/primitives/score), and [Noul](https://docs.typesafe.ai/primitives/noul). Noul reports the probability of yes, not severity.
- Choice and Score have a separate confidence field derived from their probability distributions; Noul does not. Confidence is not a guarantee of correctness, and thresholds require evaluation for the specific use case. See [TypeSafe's confidence documentation](https://docs.typesafe.ai/confidence).
- Credit [Vercel Labs' json-render](https://github.com/vercel-labs/json-render) for the rendering framework and [JackZeng's Jev UI example](https://github.com/JackZeng/Jev_apps/blob/main/cases/2026-09-19-json-render-ui/README.en.md) for the decision-based assembly approach. Component limits in that example belong to its implementation, not to json-render generally.
- Include [Shapeshift](https://github.com/anishfn/shapeshift), [Spliit Cloud](https://github.com/antonio-ivanovski/spliit-cloud), and the [Jev apps collection](https://github.com/JackZeng/Jev_apps) in the description when crediting the inspirations listed in `idea.md`.
