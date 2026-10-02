# Task 14 (Steps 1–2 + folded minors) report

Scope: UX copy pass, WCAG 2.1 AA accessibility pass on the running app, and the four Task 12+13 minors.
Steps 3–6 (reviews, demo check, final verification, memory file) were not part of this dispatch.

## 1. UX copy pass (design:ux-copy)

No `quote` strings were changed; `npm run verify-quotes` = 41/41 and `docs/sources.md` is unchanged.
All kid text stays in `summary`/`explain`/`prompt`, with no quotation marks and no more than 25 words (content.test.ts).

| Where | Before | After | Why |
|---|---|---|---|
| amendments.ts, 4th summary (deferred) | Police need a good reason and a warrant to search you or your home or take your things. | Government officials, like police, need a good reason, and usually a warrant, to search you or your home or take your things. | "Police" was too narrow. The amendment limits all government searches, and some searches are reasonable without a warrant. |
| grievances.ts, petition explain (deferred) | The king ignored the colonists when they asked for help, so … | Each time the colonists petitioned the king, he answered with more harm, so … | Brings back the meaning of "repeated injury": he answered with harm, not silence. |
| scenarios.ts, 10th #1 (deferred) | The Constitution never mentions schools. Which amendment leaves powers it does not mention to the states or the people? | The Constitution never mentions schools, so each state runs its own public schools. Which amendment allows this? | The old question restated the 10th Amendment's own text, giving the answer away. |
| scenarios.ts, 10th #3 | … Which amendment says that power stays with the states or the people? | Congress tries to use a power the Constitution never gave it, and a state objects. Which amendment is the state relying on? | Same giveaway. |
| scenarios.ts, 9th #1 | … Which amendment says unlisted rights still belong to people? | …, but people still have it. Which amendment supports this? | The question repeated the answer. |
| scenarios.ts, 9th #2 | … Which amendment says other rights count too? | … Which amendment proves them wrong? | Echoed the answer's title, "Other Rights Count Too". |
| scenarios.ts, 6th #2 | … Which amendment promises a speedy trial? | … Which amendment protects you? | Echoed the title, "Fair and Speedy Trial". |
| scenarios.ts, 8th #1/#2/#3 | forbids excessive bail / bans excessive fines / bans cruel and unusual punishments | protects the student / protects the student / forbids this | Each one quoted the 8th Amendment (and #3 its title, "No Cruel Punishments"). |
| founders.ts, Madison check explain | Cancel your opponent's next gain. | Cancel the next amendment your opponent would collect. | "Gain" was vague. |
| CardReveal EFFECT.check | Your opponent's next gain is cancelled. | Your opponent's next amendment is cancelled. | Same as above. |
| CardReveal, unblocked grievance | No right to block it: back 2 spaces | No amendment blocks it: move back 2 spaces | "Right" is also a space or card name. Uses an action verb. |
| Feedback, Who Said It | Correct! Forward 1 / Not this time | Correct! Forward 1 space / Not quite | Says what moved; a kinder near-miss. |
| Feedback, grievance | The Nth Amendment fixed this. / X had no right to block it. | The Nth Amendment blocked this grievance. / X had no amendment to block it. | Matches the "Blocked!" title and uses consistent terms. |
| Feedback, check | X's next gain is cancelled. | X's next amendment is cancelled. | Consistent with the card. |
| engine log | knew who said it! Forward 1. / has no right to block it. Back 2. / … fixed this. / Back to Era 4! | Forward 1 space. / has no amendment to block it. Back 2 spaces. / … fixed this grievance. / Back to the start of Era 4! | Same terms as the cards. "Back to Era 4" was unclear. |
| Setup intro | Roll the die (Space) and play your card. Answer Right cards to collect Amendments. | Press Space to roll the die, then follow the card for the space you land on. Answer Right questions to collect Amendments. | You don't "play" a card. You land on a space and follow its card. |
| Setup goal | Reach … before the Computer to win. | To win, reach … before the Computer does. | Goal first, then reads naturally. |
| Header Quit confirm | Quit this game? It cannot be resumed. | Quit this game? You cannot resume it. | Active voice. |

I reviewed these and left them unchanged: buttons (Start (Enter), Resume game, New game, Roll (Space), Continue (Enter), Full screen (F), Play again), the remaining scenario prompts, the clause and founder explanations, and the end-screen headings.

## 2. Accessibility pass (design:accessibility-review), WCAG 2.1 AA

Method: `npm run dev`, then Playwright/Chromium at 1280×720 driving everything from the keyboard. Scripts are in the scratchpad (`a11y.mjs`, `timer.mjs`, `contrast.mjs`), not in the repo.

### Contrast (computed from the @theme tokens, with alpha and oklab color-mix composited)
| Pair | Ratio | Need | Result |
|---|---|---|---|
| ink on parchment / parchment-light / cream | 12.81 / 14.43 / 15.75 | 4.5 | pass |
| navy on parchment / pl / cream | 10.06 / 11.33 / 12.37 | 4.5 | pass |
| crimson on parchment / pl / cream | 7.01 / 7.89 / 8.62 | 4.5 | pass |
| cream on navy / crimson / era-1..5 | 12.37 / 8.62 / 7.56, 8.12, 8.07, 10.22, 7.94 | 4.5 | pass |
| ink label on era tiles 1..5 | 11.16–11.53 | 4.5 | pass |
| era icon on its tile 1..5 | 5.53–7.24 | 3 | pass |
| focus outline crimson on parchment / cream | 7.01 / 8.62 | 3 | pass |
| body text at the vignette edge | 9.30 | 4.5 | pass |
| **name placeholder ink/55 on pl** | **3.71** | 4.5 | **fail, fixed with ink/70: 5.91** |
| disabled amendment numeral ink/60 on cream | 4.45 | (exempt) | raised to ink/75 (7.31) for projector legibility; border ink/60 at 4.45 |
| inactive Roll border ink/40 | 2.44 | (inactive) | raised to ink/60 (4.31) |
| ink/40 section borders | 2.44 | n/a | decorative (not a component boundary); left as is |

### Findings and fixes
| # | Issue | WCAG | Severity | Fix |
|---|---|---|---|---|
| 1 | After every card or feedback closed, and at game start, focus fell to `<body>`. Keyboard and screen reader users lost their place. Roll was `disabled` on the Computer's turn, so focus had nowhere to go. | 2.4.3 | Major | Roll now uses `aria-disabled` with a guarded onClick, so it stays focusable and a click on the Computer's turn is a no-op. Dice takes a `covered` prop, and when a cover clears it pulls dropped focus back to Roll (only from body, never from the header). Verified: focus lands on Roll at game start and after Right, Who Said It, Grievance, Founder and Unfinished cards. |
| 2 | Player tokens are `aria-hidden`, so screen readers couldn't tell where anyone was on the board. | 1.3.1 | Major | Each space's label adds who is there, e.g. "Space 0, Era 1, Start: Ada and Computer here". |
| 3 | The Game log `aria-live` region was inside the `inert` aside, and inert content leaves the accessibility tree, so moves made while a card was up weren't announced. | 4.1.3 | Major | Only the Dice wrapper is inert now. Hands and Log have no focusable content and stay live. |
| 4 | Header was `inert` under cards, which blocked Quit (folded minor). | 2.1.1 | Major | `inert` now covers only the title and the win text. Full screen and Quit stay usable (Quit's ancestors have no `[inert]`; tested Quit plus the confirm during an open question, which returns to setup). |
| 5 | When focus lands on a card's button (Continue, or the amendment picker), screen readers heard only the button, not the card. | 4.1.2 / 1.3.1 | Minor | The dialog gets `aria-describedby` pointing at its body (a `display: contents` wrapper, so layout is unchanged). |
| 6 | Placeholder contrast was 3.71. | 1.4.3 | Minor | ink/70 (5.91). |

### Verified passing (no change needed)
- Visible focus: every focusable element shows a 3px crimson outline (computed style checked on each Tab stop).
- Tab order. Setup: name, Fast Bot, Start, then Full screen. Play: Full screen, Quit, Roll. End: the h2 banner gets focus, then the 10 `<details>` summaries, then Play again.
- Keyboard-only full games completed. Fast Bot: 102 s (Computer wins), 86 s (Computer wins). Reduced motion: 48 s and 53 s. Used Space to roll, 1–3 to answer, Enter for Continue and the amendment picker, and typed the name plus Enter. No app console errors or warnings.
- aria-live: Log (polite) announces each move. Feedback is `role=status`. The timer's assertive region announced "10 seconds left" at 10 s and "5 seconds left" at 5 s.
- prefers-reduced-motion: the die animation is `none`/0s, token transitions are 0ms, and CSS transitions are zeroed. Reading times are unchanged by design.
- `lang="en"`, labelled inputs, buttons have names, and the die is `role=img` with "Die shows N".

### Not changed (noted)
- 2.2.1 Timing: the 20 s question timer, the 5 s Unfinished Liberty card, and the 1–3 s feedback are spec-mandated game timing (the "essential" exception). The timer is announced at 10 and 5 seconds.
- Environment: Google Fonts are blocked by the sandbox proxy (ERR_CERT_AUTHORITY_INVALID), so the fallback serif fonts render. At 1280×720 the bottom board row is clipped (board bottom 745px). This is identical on the baseline commit, so it is not a regression. The Step 4 demo check should confirm the layout fits with the real fonts loaded.

## 3. Folded Task 12+13 minors
- App.tsx: Quit shows only off the setup screen (`canQuit`). The setup screen shows 0 Quit buttons even with a finished game saved.
- App.tsx: header `inert` moved to the title and children only (see a11y #4).
- README: the deploy steps now start with "Create the GitHub repo `road-to-liberty`", then push `main`.
- vite.config.ts: `test.exclude: [...configDefaults.exclude, '.claude/**']`. Verified with a decoy test copied under `.claude/worktrees/x/src/`: still 8 files run. The now-redundant `/// <reference types="vitest/config" />` was removed (oxlint flagged it once `vitest/config` was imported); `tsc -b` is clean.

## Tests
- No component-test harness exists (vitest `environment: 'node'`, no testing-library). The UI behavior changes (focus return, aria labels, header inert and Quit) are verified with the Playwright runs above, not unit tests. Engine and store logic is unchanged; only log strings changed, and no test asserts on them.
- Lint: `npm run lint` shows no warnings (baseline had none either).

## Command outputs
```
$ npm test
 Test Files  8 passed (8)
      Tests  50 passed (50)
(0 lines containing "warn")

$ npm run build
dist/index.html                   0.81 kB │ gzip:  0.42 kB
dist/assets/index-DcsQ1nb0.css   28.86 kB │ gzip:  5.98 kB
dist/assets/index-CtinHScg.js   279.20 kB │ gzip: 87.02 kB
✓ built in 389ms

$ npm run verify-quotes
41/41 verified
```

## Files changed
README.md, vite.config.ts, src/App.tsx, src/engine/game.ts (log strings only), src/data/{amendments,founders,grievances,scenarios}.ts, src/ui/{Board,CardReveal,Dice,Feedback,QuestionModal,Setup}.tsx

## Concerns
- Board clipping at 720px could not be checked with the real web fonts in this sandbox (see above).
- The dialog is `aria-modal`, but with the header buttons now outside `inert`, Tab can reach Full screen and Quit while a card is up. This is intended (Quit must work), but it is not a strict focus trap.

## Fix wave (commit 659c996)

All 7 findings checked against the code first; all were real.

### HIGH
1. **Layout fit.** Confirmed: at 1280×720 the board ran to 745px (6 tiles and the 1789–91 era clipped). The App play grid and the Board grid now have a single `grid-rows-[minmax(0,1fr)]` row; ols, lis and the relative wrapper get `h-full`/`min-h-0`; tiles and era flags are `overflow-hidden min-h-0`. The Board wrapper is a size container (`@container-size`): tile icons are `clamp(1.25rem,6cqh,2.25rem)` (Start/Finish `clamp(1rem,4cqh,2rem)`), labels `line-clamp-2` (Finish `line-clamp-3`). Era years are 1.5rem on one line ("1787–88" no longer wraps), titles `line-clamp-2`. Label text stays ≥18px. Header `max-height` tweak tried and dropped: the header height is set by the buttons, so a smaller h1 saved ~1px.
   Playwright (fallback fonts, web fonts blocked), `fit.mjs`, checking every tile/era/label for clipping and overflow:
   ```
   1280 720  board bottom 702 / vh 720, clipped 0, overflowing 0, "Bill of Rights Ratified" clamped=false
   1366 768  board bottom 750 / vh 768, clipped 0, overflowing 0, "Bill of Rights Ratified" clamped=false
   1920 1080 board bottom 1062 / vh 1080, clipped 0, overflowing 0
   ```

### MEDIUM
2. **deploy.yml:** top level `permissions: { contents: read }`; `pages: write, id-token: write` on the deploy job only.
3. **Save validation.** New `src/store/validate.ts` `isValidGame()`: phase, current, 2 players (name, isBot, pos integer 0–29, hand of 1–10, flags), log, seed, lastRoll, drawn/seen lists, winner vs phase, and `pending` (null outside resolve; in resolve an own-property kind with card index inside that deck, incl. CLAUSES for unfinished). Store persist: `version: 1`, pass-through `migrate` (v0 saves have the same shape, and it avoids zustand's "couldn't be migrated" console error), `merge: mergeSave` which keeps the game only if valid (else `game: null`) and fastBot only if boolean. New `src/ui/ErrorBoundary.tsx` wraps `<Play />`; its "Back to the title screen" button calls `quit()`. Tests: `validate.test.ts` (6) + 3 `mergeSave` tests.
4. **Animation sync.** Confirmed: `useShownPositions` animated player 0 to completion before player 1, and the roll event's dice wait was consumed by whichever token moved. Now each token has its own `useShownPos(game, who)`; the roll event carries `who`, and only that player's token waits for the die. Board sets a non-persisted store flag `animating` (cleared on unmount and on quit). The bot driver holds its roll while `animating` (only the roll, via `holdRoll`, so a card's timer is not restarted when the bot's own token starts/stops); `useShownPending` also waits for `!animating`.
   Playwright (`check.mjs`): Player at 28 with no amendments rolls → fails Finish → walks back to 18: human token at 18 @3054ms, bot rolled @3566ms (after the walk + its 500ms), bot token arrived @4224ms, bot card @4278ms — order correct.

### LOW
5. useKeys: Space does not roll while `feedback` is set (Playwright: Space during feedback → no roll).
6. CardReveal: window `keydown` Enter listener while a human card with Continue is up (not on Unfinished Liberty or the collectMissing picker, where Enter presses the focused amendment). Playwright: focus on header Quit + Enter → card acknowledged, no confirm() dialog.
7. Store `answer` requires phase resolve + a right/whoSaid card; `acknowledge` requires phase resolve + a non-question card. 2 tests.

Also verified in Playwright: a damaged save in localStorage → no "Resume game" button; forcing a crash shows the boundary, and its button returns to the title screen.

### Step 4 demo check (`demo.mjs`, 1280×720, keyboard only, Fast Bot on)
Setup by keys (type name, Tab, Space for Fast Bot, Shift+Tab, Enter); Space to roll, 1–3 to answer (right answer ~70% of the time), Enter to continue.
```
end screen: "Ada wins!"   elapsed: 67.7 s   turns (rolls): 39 = 20 human + 19 bot
questions answered: 10 (6 right)   app console errors/warnings: 0 (blocked web-font requests ignored)
```
Estimate with Fast Bot off: 20 human turns × ~12 s = 240 s, plus 19 bot turns × ~3.5 s (500 ms wait, half-speed die and walk, 1.2 s card, half-length feedback) ≈ 67 s → **≈ 5.1 min** (target ≤ 8 min). The engine sim's p90 of 58 turns would be ≈ 29 human × 12 + 29 × 3.5 ≈ 7.5 min.
Screenshots: `/tmp/claude-0/-home-user/6445930c-a5c6-52f1-b4ff-e216239ef010/scratchpad/demo-board.png`, `/tmp/claude-0/-home-user/6445930c-a5c6-52f1-b4ff-e216239ef010/scratchpad/demo-end.png`.

### Tests
No component-test harness exists (vitest env node), so the hook changes (4, 5, 6) are covered by the Playwright runs above; logic changes (3, 7) have unit tests.

### Command outputs
```
$ npm test
 Test Files  9 passed (9)
      Tests  61 passed (61)

$ npm run build
dist/index.html                   0.81 kB │ gzip:  0.43 kB
dist/assets/index-BhMON-Ny.css   29.44 kB │ gzip:  6.12 kB
dist/assets/index-BqQA8zHi.js   282.20 kB │ gzip: 87.98 kB
✓ built in 384ms

$ npm run verify-quotes
41/41 verified

$ npm run lint
(no findings)
```
0 lines containing "warn" across the four outputs. Dev server stopped.

### Files changed
.github/workflows/deploy.yml, src/App.tsx, src/store/{game.ts,game.test.ts,validate.ts,validate.test.ts}, src/ui/{Board.tsx,CardReveal.tsx,ErrorBoundary.tsx,motion.ts,useBotDriver.ts,useKeys.ts}

### Concerns
- Fit was verified only with fallback fonts (web fonts blocked here); with the real fonts, labels clamp rather than overflow if they run wider.
- `animating` lives in the store (not persisted); if a future change left a token unable to reach its target, the bot would wait. Today the walk always converges and the flag clears on unmount/quit.
