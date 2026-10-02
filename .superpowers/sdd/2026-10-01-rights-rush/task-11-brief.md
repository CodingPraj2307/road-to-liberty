### Task 11: Question modal, card reveal, feedback

**Files:** Create `src/ui/QuestionModal.tsx`, `src/ui/CardReveal.tsx`, `src/ui/Feedback.tsx`

- [ ] **Step 1: QuestionModal** (pending `right`/`whoSaid`). Shows the prompt or quote with its source label. It has 3 buttons labeled "1", "2", "3" with full text; keys 1–3 click them. The display order is shuffled once per card with `Math.random`. A 20s countdown bar with a numeric `aria-live` value at 10s and 5s; at 0 it calls `answer(false)`. Clicking a choice calls `answer(choice === correct)`. For the bot's turn: show the card, no buttons, and the label "Computer is thinking…".
- [ ] **Step 2: CardReveal** (pending `grievance`/`founder`/`unfinished`):
  - Grievance: the quote in quotation marks + "Declaration of Independence", then the result computed with `grievanceBlocker` *before* acknowledging: "The Bill of Rights fixed this!" + the amendment text, or "Federalist 55 protects you", or "No right to block it: back 2 spaces".
  - Founder: speaker, quote, a "Summary:" line, and the effect in plain words. For `collectMissing` (human), show a 10-button picker with only the missing amendments enabled; picking one calls `acknowledge(n)`.
  - Unfinished: the clause text, `Art. I, §2`-style section, and a "Summary:" explanation. It uses a muted, respectful style (no game colors or sounds) and auto-continues after 5s.
  - Others: a "Continue (Enter)" button that is auto-focused.
- [ ] **Step 3: Feedback** (the store `feedback`). For a wrong `right` answer: "The answer was the Nth Amendment" + the verified text, for 3s. For correct answers: a short "Collected!" for 1s. For the bot, durations are halved, and 0 with Fast Bot. Then call `clearFeedback()`.
- [ ] **Step 4: Verify** in the browser preview: play 5 turns, try a timeout, a wrong answer and a grievance block, and check the console is clean.
- [ ] **Step 5: Commit** with `feat(ui): question timer, card reveals, answer feedback`.

---

