# Rights Rush — Design Spec

Repo: `road-to-liberty` (GitHub Pages at `/road-to-liberty/`). Audience: 8th graders. Presented live on a projector: presenter vs. 1 computer player, full game ≈ 8 minutes. Purely educational: no thesis or argument.

## Sources (the ONLY allowed sources)

| id | Document | URL |
|---|---|---|
| henry | Patrick Henry, "Give Me Liberty" (1775) | https://www.gilderlehrman.org/sites/default/files/2024-01/Speeches.pdf |
| common-sense | Thomas Paine, Common Sense (1776) | https://billofrightsinstitute.org/primary-sources/common-sense/ |
| declaration | Declaration of Independence | https://www.archives.gov/founding-docs/declaration-transcript |
| constitution | Constitution | https://constitutioncenter.org/the-constitution/full-text |
| bill-of-rights | Bill of Rights | https://www.archives.gov/founding-docs/bill-of-rights-transcript |
| fed10 | Federalist 10 | https://avalon.law.yale.edu/18th_century/fed10.asp |
| fed51 | Federalist 51 | https://constitutioncenter.org/the-constitution/historic-document-library/detail/james-madison-federalist-no-51-1788 |
| fed55 | Federalist 55 | https://constitutioncenter.org/the-constitution/historic-document-library/detail/james-madison-federalist-no-55-1788 |
| brutus1 | Brutus 1 | https://minio.la.utexas.edu/webeditor-files/coretexts/pdf/178720brutus201.pdf |
| centinel1 | Centinel 1 | https://teachingamericanhistory.org/document/centinel-i-2/ |

Source texts are fetched once into `sources-cache/<id>.txt` and committed. `npm run verify-quotes` checks every `quote` in `/src/data` against them and writes `docs/sources.md`. A quote must be one unbroken substring of the source. Matching ignores only whitespace, curly-vs-straight quotes and dash style; it is case-sensitive, and ellipses are not allowed. Kid-friendly text lives in `summary`/`explain` fields, is labeled ("Summary", "Why", "About the quote", "Why it matters") in the UI, and is never shown inside quotation marks.

**Findings from checking the sources (2026-10-01):**
- Brutus 1 and the Centinel 1 excerpt at the given URL do **not** mention a bill of rights or freedom of the press. The Antifederalist card uses quotes that are really there. The "their pressure led to the Bill of Rights" point appears as a labeled summary.
- The Federalist 55 and Common Sense pages are excerpts. They lack "esteem and confidence" and "begin the world over again", so those two cards use other sentences that are really in the cached pages.
- The Constitution text uses "Persons," not "slave." The Unfinished Liberty explanations must say this plainly.

## Board

30 spaces in 5 eras of 6 (index 0–29). Each era is a labeled, color-coded zone.

| Era | Spaces | Layout |
|---|---|---|
| 1 · 1775 Henry | 0–5 | START, right, founder, whoSaid, right, grievance |
| 2 · 1776 Common Sense + Declaration | 6–11 | right, grievance, whoSaid, right, founder, right |
| 3 · 1787 Constitution | 12–17 | unfinished(3/5), right, grievance, unfinished(slave trade), founder, unfinished(fugitive) |
| 4 · 1787–88 Fed vs. Antifed | 18–23 | right, founder, grievance, whoSaid, right, founder |
| 5 · 1789–91 Bill of Rights | 24–29 | right, grievance, right, whoSaid, right, FINISH "Bill of Rights Ratified" |

Totals: 11 right, 5 grievance, 5 founder, 4 whoSaid, 3 unfinished, start, finish.

## Rules

- **Turn:** roll 1d6, move (stop at FINISH), resolve the space. Each question has a 20-second timer; running out counts as wrong.
- **Forced moves** (back 2, forward 1/2) do **not** trigger the space you end on. The only exception is reaching FINISH, which triggers the finish check.
- **RIGHT:** draw a random scenario and pick the amendment from 3 choices. Correct: gain that Amendment (duplicates are allowed).
- **Result card (RIGHT and WHO SAID IT?):** after every answer, correct or wrong, a card shows Correct or Wrong, the right answer, its explanation, the verified text (the amendment, or the quote and its source) and what happened. The human's card waits for Continue (Enter), with focus on Continue and the result announced in a live region. The bot's card continues by itself after 6 seconds (2 seconds with Fast Bot).
- **GRIEVANCE:** draw a card. If you hold any answering amendment: BLOCK ("The Bill of Rights fixed this!" plus the text). Otherwise, if you are shielded: the shield is used up and you are blocked. Otherwise: move back 2. Every grievance drawn is recorded for the end screen.
- **FOUNDER:** draw a card and apply its effect: `forward2` · `reroll` (same player rolls again) · `check` (the opponent's next gain is cancelled; applied immediately, so the bot "always uses Check") · `stealDuplicate` (take the lowest-numbered amendment the opponent holds 2+ of; if none, move forward 1) · `collectMissing` (the player picks any missing amendment; the bot picks the lowest) · `shield` (blocks your next grievance).
- **Gaining an amendment while `blockNextGain` is set:** the flag clears and nothing is gained.
- **WHO SAID IT?:** pick the document from 3 choices. Correct: move forward 1.
- **UNFINISHED LIBERTY:** show the clause text plus its explanation until Continue (Enter); the bot's card stays up 6 seconds. No effect. Recorded for the end screen.
- **Win:** reaching FINISH with ≥5 different amendments wins. With fewer than 5, you go back to space 18 (start of Era 4). Holding all 10 different amendments wins instantly.
- **Bot:** answers correctly 70% of the time and decides instantly. Its animations run at 2× speed. The "Fast Bot" toggle skips its animations and card reveals, but its result cards still show for 2 seconds; the log still records its moves.

## Grievance → Right pairings (checked against the Declaration text)

| Grievance quote | Answers |
|---|---|
| "For Quartering large bodies of armed troops among us" | 3rd |
| "For depriving us in many cases, of the benefits of Trial by Jury" | 6th, 7th |
| "For transporting us beyond Seas to be tried for pretended offences" | 6th |
| "Our repeated Petitions have been answered only by repeated injury" | 1st |
| "For protecting them, by a mock Trial, from punishment for any Murders" | 6th |

Dropped as a stretch: Standing Armies → 2nd/3rd; "swarms of Officers to harrass our people" → 4th.

## Founder cards (8)

| Source | Quote (to verify) | Effect |
|---|---|---|
| henry | "give me liberty, or give me death!" | forward2 |
| declaration | "Life, Liberty and the pursuit of Happiness" | forward2 |
| common-sense | "O! receive the fugitive, and prepare in time an asylum for mankind." | reroll |
| fed51 | "Ambition must be made to counteract ambition" | check |
| fed10 | "Liberty is to faction what air is to fire" | stealDuplicate |
| centinel1 | "All the blessings of liberty and the dearest privileges of freemen are now at stake" | collectMissing |
| brutus1 | "In a republic, the manners, sentiments, and interests of the people should be similar." | collectMissing |
| fed55 | "I am unable to conceive that the people of America, in their present temper, or under any circumstances which can speedily happen, will choose, and every second year repeat the choice of, sixty-five or a hundred men who would be disposed to form and pursue a scheme of tyranny or treachery." | shield |

## Content counts

50 scenarios (5 per amendment, correct slot rotating), 5 grievances, 8 founders, 25 Who-Said-It quotes (each of the 10 sources at least twice), 3 unfinished clauses, 10 amendments (summary + explanation + verified text). Every item has a `source` field. Questions are drawn at random, so repeat demos feel different.

**Explanations.** Every scenario, amendment, Who-Said-It quote, grievance, founder and clause has an `explain` field: 8th-grade reading level, 2–4 sentences, about 35–70 words (the content test allows 20–80), plain text with no quotation marks. A scenario says why the amendment protects the person, in the amendment's own words, and often why a tempting wrong choice does not fit. An amendment says what it protects, why the founders wanted it, and one modern example. A Who-Said-It quote says who wrote it, when, why, and what it means. A founder's last sentence is its power. No invented facts, dates or statistics; when unsure, stay general.

## Architecture

- `src/engine/` is pure TypeScript with no React. The game state is plain serializable data, including the RNG seed. Its functions are `newGame`, `roll`, `answer(correct)` and `acknowledge(pick?)`, plus `botCorrect`. It reads `src/data` only for deck lengths and card fields.
- `src/store/` is a Zustand store wrapping the engine and saving to localStorage (`persist`). A bot-driver hook schedules the bot's actions.
- `src/ui/` holds the React components (Tailwind). The UI owns the timers, animations, and display-order shuffling. The engine owns every rule.
- `scripts/` holds `fetch-sources.ts` and `verify-quotes.ts`, run with `tsx`.

## Presentation

Minimum body text 18px, high contrast, works at 1280×720, fullscreen toggle (F). Keys: Space = roll, Enter = confirm/continue, 1–3 = answer choice. Look: aged parchment, colonial broadside typography, navy/red/cream. The palette and fonts are chosen with ui-ux-pro-max. Animations stay short (dice ≤600ms, token ≤150ms per space).

## End screen

Shows the winner and each player's amendments; a "Grievances → Rights" table (each grievance drawn, next to its answering amendment); "Unfinished Liberty" (the clauses landed on this game); and "Your Bill of Rights" (all 10 amendments, each with a summary, opening a native `<details>` element to its explanation and verified text).

## Pacing

A seeded simulation of 500 games, with both players at 70% accuracy, must give a median of ≤ 40 total turns per game (≈ 8 min at ~12s/turn) and finish every game within 300 turns. If it fails, tune the board, not the threshold.

Reading time (2026-10-02): with Fast Bot off, at ~12 s per human turn plus the result cards (the human reads each for as long as the class needs; the bot's stay 6 s), a median game is about 7 minutes if the class spends ~10 s on each of the presenter's ~9 result cards, and about 7.8 minutes at ~15 s. Fast Bot cuts the bot's share by about a minute.

## Definition of done

Engine tests pass; `npm run build` succeeds; `npm run verify-quotes` passes; accessibility review issues fixed; code-review, CodeRabbit and engineering:code-review findings rated high or medium fixed; one full demo game played without errors; README includes deploy steps.
