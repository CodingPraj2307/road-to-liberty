# Task 11 report: question timer, card reveals, answer feedback

Status: DONE

## Starting point
WIP commit 15ef912 already had nearly all of Task 11. I kept it and checked it against the brief and the controller's rulings. Most of it was right, so I made two fixes and added one test:

1. **Layout fix (1280x720):** a blocked grievance whose answer is the 6th Amendment (the longest amendment text) overflowed the card by 66px. Because Continue is auto-focused, the card scrolled and the header was cut off on the projector. Changes:
   - Removed the separate "6th Amendment" line. The citation now names the amendment: "Bill of Rights, 6th Amendment".
   - Tightened the result box padding, the header margin and the overlay padding (p-6 to p-4).

   I then swept all 61 cards (30 right, 15 whoSaid, 8 founder, 5 grievance, 3 unfinished) at 1280x720. All now fit: scrollHeight <= clientHeight on each card.
2. **Founder citation:** it read "Centinel 1, Centinel No. 1", which repeats itself. It now shows the source title only, the same way grievances do.
3. **Durations helper:** the feedback durations moved out of Feedback.tsx into `motion.ts` as `feedbackMs()`, next to `readMs`. Exporting it from the .tsx file had triggered the oxlint `only-export-components` warning. One test in `motion.test.ts` now pins the durations: wrong RIGHT 3000ms, correct 1000ms, grievance and founder 1500ms, unfinished 0.

## What the WIP already did (verified, kept)
- **QuestionModal:**
  - Fisher-Yates shuffle once per card. App remounts the modal per card with key = log length.
  - Buttons 1–3 work by click and by keys 1–3.
  - 20s bar and number. At 0 it calls `answer(false)`.
  - An sr-only `aria-live` region says "10 seconds left" and "5 seconds left".
  - The bot's card has no buttons and shows "Computer is thinking…".
- **Dialog:** role="dialog", aria-modal, aria-labelledby (the h2). Focus moves into the card: either to an auto-focused button or to the container itself.
- **CardReveal:**
  - Grievance: the result is computed with `grievanceBlocker` before acknowledging (fixed / Federalist 55 / back 2).
  - Founder: speaker, quote, "Summary:" line, and the effect in plain words. For the human, `collectMissing` shows 10 buttons with only the missing amendments enabled. The bot gets no picker; its driver calls `acknowledge()` with no pick.
  - Unfinished: a muted card that auto-continues after 5s, with the clause, its section and a "Summary:" line.
  - Continue (Enter) is auto-focused.
- **Feedback:**
  - Snapshots the state before and after each action. The bot gets half the time (`readMs`), and 0 with Fast Bot.
  - Always calls `clearFeedback()`.
- **Animation gating:** `useShownPending` holds a card back until the die has landed and the token has finished walking (`cardDelayMs`, half for the bot). App hides the bot's cards when Fast Bot is on. `useBotDriver` waits `cardDelayMs + 1200ms`, or + 2500ms for an unfinished card.
- **Task 10 carry-overs, all present in the WIP:**
  - Board shadows use `color-mix`; no `rgb(30…` is left in src.
  - Dice: the effect returns early once `ev.id === settled`, so changing `ms` later does not re-arm the tumble.
  - Dice: `key={ev?.id}` is on the die.
  - useKeys ignores `e.repeat` on the Space roll path.
- Quotation marks wrap only verified `quote` fields. Kid text (`explain`, scenario `prompt`) is never quoted, and `explain` is labeled "Summary:".

## Tests
- `npm test`: 9 files, 50 tests passing, output pristine.
- `npm run lint` (oxlint): no warnings.
- `npm run build`: OK.
- Not TDD. The task was UI and most of it already existed. The new duration test passed on its first run because it pins the existing values.

## Browser evidence (rights-rush-dev, 1280x720, timings from a store/DOM logger)
**Human turns:**
- **Grievance, not blocked:**
  - Rolled a 5. The card appeared 1379ms after the roll; the expected delay is 600 + 5×150 = 1350.
  - Continue had focus. Enter acknowledged it.
  - The "Back 2 spaces" banner showed for 1500ms.
- **Wrong RIGHT answer** (pressed key 1): "The answer was the 8th Amendment" plus the quoted Amendment VIII text, for 3000ms.
- **Timeout** (whoSaid): the aria-live region read "10 seconds left" at +10.0s and "5 seconds left" at +15.0s. The modal closed at +20.1s with `answer(false)` ("Not this time", 1500ms).
- **Unfinished Liberty** (natural roll to the Slave Trade Clause): a muted card shown 5008ms, then auto-continued. No banner followed.
- **Founder collectMissing:** with hand [1,3,6], buttons 2,4,5,7,8,9,10 were enabled and "2nd Amendment" was auto-focused. Clicking 7 gave "Collected! You collected the 7th Amendment."
- **Founder reroll:** "Roll again!" banner, then still the human's roll phase.
- **Grievance blocked by the 6th:** card plus "The Bill of Rights fixed this!" with the text, then a "Blocked!" banner.
- **Grievance blocked by shield:** "Federalist 55 protects you", then "Shielded!". `shielded` was false afterwards.
- **Correct answer** (clicked the 2nd Amendment): "Collected!" for 1000ms.

**Bot turns:**
- **Fast Bot off:** watched 10+ bot turns across two runs (whoSaid, right, grievance and founder outcomes), with no stall.
  - Each bot card appeared about 300 + d×75 ms after its roll and stayed about 1190ms.
  - Bot feedback lasted 500ms (correct), 750ms (card outcome) and 1500ms (wrong RIGHT).
  - Every feedback was cleared.
- **Fast Bot on** (`setFastBot(true)`): no bot dialogs were shown. Each bot turn resolved within about 30ms, and its feedback cleared at 0ms. The game ran to completion (phase "over").
- **Console:** clean. Only Vite and HMR debug lines plus the React DevTools info message; no errors or warnings.

## Files changed (this commit)
- src/ui/CardReveal.tsx: grievance and founder citations, tighter result box.
- src/ui/QuestionModal.tsx: Dialog overlay padding and header margin.
- src/ui/Feedback.tsx: uses `feedbackMs` from motion.ts.
- src/ui/motion.ts: `feedbackMs`.
- src/ui/motion.test.ts: durations test.

## Concerns / notes for later tasks
- The engine log reads "You has no right to block it" and "You reached … and wins!" because the human's default name is "You". This is engine/Task 12 territory, so I left it.
- The brief says "with its source label". For Who Said It? the source is the answer, so the WIP rightly leaves it out. RIGHT prompts are kid text and their source is the Bill of Rights, which the choices already name.
- A timeout shows the same banner as a wrong answer. Feedback cannot tell the two apart, so there is no "Time's up" wording.
- The Roll button stays clickable while a feedback banner is up. Rolling early is harmless, because the next card waits until feedback clears. I left it as is.
- Founder card quote for Paine differs from the spec table ("We have it in our power…"). That is data, not this task.

## Fix round 1

### Changes
1. **(Important) Who Said It? wrong-answer duration.** `feedbackMs` in `src/ui/motion.ts` now returns `correct ? 1000 : 3000` for both `right` and `whoSaid`, so a wrong Who Said It? answer or its timeout stays up 3s. Bot durations still go through `readMs`: halved, and 0 with Fast Bot. `motion.test.ts` gains `expect(fb('whoSaid', false)).toBe(3000)`.
2. **(Minor) `inert` behind overlays.** In `src/App.tsx`, `covered = showCard || feedback`.
   - The header and Board are now wrapped in a `<div inert={covered} className="flex min-h-0 flex-1 flex-col">`, which leaves the layout unchanged.
   - The `<aside>` (Dice, Hands, Log) also gets `inert={covered}`.
   - Tab therefore cannot reach the Roll button or anything else behind the aria-modal card or the feedback banner.
   - Side effect: the Roll button can no longer be clicked while a banner is up (one of my earlier notes). Space still rolls through the window key handler, and that roll is harmless as before.

### Commands and output
`npm test`
```
 Test Files  8 passed (8)
      Tests  50 passed (50)
```
`npm run lint` (oxlint): no output, meaning no warnings or errors.

`npm run build`
```
dist/assets/index-CxnVBOSc.js   269.91 kB │ gzip: 85.01 kB
✓ built in 82ms
```

### Browser check (1280x720, fresh game)
- **Before the card:** the main wrapper and the aside had inert=false. The Board height was 625px, the same layout as before.
- **Forced Who Said It? card:** both regions had inert=true and focus was inside the dialog. The only enabled buttons outside an inert subtree were the 3 choices.
- **Clicked a wrong choice:** the aside stayed inert during the feedback. Feedback cleared after **3056ms** (previously 1500ms), and inert was false afterwards.
- **Bot:** took its turn normally afterwards.
- **Console:** no errors.
