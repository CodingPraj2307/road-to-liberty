# Task 12 report: setup, end screen, fullscreen, Fast Bot, resume

Status: DONE_WITH_CONCERNS (minor, see Concerns)

## What was implemented

Most of the work came from the interrupted attempt. I reviewed its diff, kept it, and finished it.

- `src/ui/Setup.tsx` (new): the title screen. It has the "Rights Rush" title, a 2-line how-to-play, a name input (placeholder "Player", max 20), a Fast Bot checkbox bound to `setFastBot`, and "Start (Enter)", which is the native form submit. "Resume game" (autofocused) and "New game" show only when the store holds a persisted game whose phase is not `'over'`. It exports the `PRIMARY`/`SECONDARY` button classes that the header and end screen reuse.
- `src/ui/EndScreen.tsx` (new):
  - Winner banner, focused on mount so keyboard users start at the top.
  - Each player's amendments shown as seals, with sr-only full names.
  - "Grievances → Rights" `<table>`: each grievance quote in quotation marks, next to the answering amendment number(s) and title.
  - "Unfinished Liberty": muted heading, rule and icon. Shows the clauses in `unfinishedSeen`; if none, all 3 under "Clauses you didn't land on". Each clause shows its verified quote with a citation and a "Summary:" line.
  - "Your Bill of Rights": 10 native `<details>`. The `<summary>` holds the number, "Nth Amendment: title" and "Summary: …". The body holds the verified text in quotation marks, cited as "Bill of Rights, Amendment N". I changed the cite from the roman-numeral `section` to `Amendment ${am.n}` to match the ruling.
  - "Play again" calls `quit()`, which returns to setup.
  - The page scrolls vertically. Everything on it is a native button, `<details>` or `<summary>`, so it is all keyboard reachable.
- `src/App.tsx`:
  - Removed the temporary auto-`start('You')`.
  - A `Header` appears on every screen, with "Full screen (F)" and, while a game exists, "Quit". Quit asks with `confirm()` and then calls `quit()`.
  - Screen routing is setup → play → end. A persisted game waits on setup until Resume. The end screen appears after the winning move's animation plus a 1.5s hold.
- `src/ui/useKeys.ts`: `toggleFullscreen()` is extracted and shared by the F key and the header button. `useKeys(play)`: F works on every screen, and Space rolls only on the board.
- `src/store/game.ts` and its test: a blank name now defaults to 'Player'. The test is updated.
- `src/ui/CardReveal.tsx`: exports `Quote` and `Summary` so the end screen reuses them.
- `src/data/sources.ts`: `sourceTitle(id)` moved here from CardReveal, because CardReveal and EndScreen both need it. This is a pure move with no data change, which justifies keeping it.

## Tests

- `npm test`: all pass. The project's own suite is 8 files, 50 tests.
- `npm run build`: OK.
- `npm run lint`: exit 0, no findings.

## Browser check (preview "rights-rush-dev", 1280x720 at first; the pane later reset to its own size)

1. Cleared storage. Typed "Ana", ticked Fast Bot, and pressed Enter in the name field. The store showed players ["Ana", "Computer"] and `fastBot: true`.
2. Reloaded mid-game. Setup showed "Resume game" (focused) and "New game". Enter on Resume returned to the same board state.
3. Played to the end with Fast Bot on. I used console shortcuts: an interval called the real store's `roll/answer(true)/acknowledge/clearFeedback` for the human's turns only, and the real bot driver played the Computer.
   - The result was "Ben wins!".
   - All sections rendered: seals for both players, a grievance table with 2 rows, Unfinished Liberty with 1 clause landed on, and 10 `<details>`.
   - I opened a `<details>`. It showed the quote and "Bill of Rights, Amendment 5".
   - I forced `unfinishedSeen: []` through `setState`. That showed "Clauses you didn't land on" with all 3 clauses.
4. A persisted game in phase `'over'`, reloaded, shows only "Start (Enter)" with no Resume.
5. Quit: `window.confirm` was stubbed, because a native dialog blocks the automation.
   - Quit on the end screen confirmed with "Quit this game? It cannot be resumed." and the game cleared to setup.
   - Mid-game, a cancelled confirm kept the game and an accepted confirm cleared it.
6. Console: after fresh reloads, the session's console had no new errors. It holds one earlier React error: "final argument passed to useEffect changed size between renders, Previous [] Incoming [..]". This is an HMR artifact. `useKeys`'s deps changed from `[]` to `[play]` while the page was hot-updated, and it did not recur after reloads.

Testing note: in the dev server, `import('/road-to-liberty/src/store/game.ts')` returns a different module instance than the app's, which is HMR-stamped `?t=…`. My first attempt drove that copy. I then used the URL from `performance.getEntriesByType('resource')`.

## Files changed

src/App.tsx, src/ui/Setup.tsx (new), src/ui/EndScreen.tsx (new), src/ui/useKeys.ts, src/ui/CardReveal.tsx, src/data/sources.ts, src/store/game.ts, src/store/game.test.ts

## Concerns

- Header "Quit" also shows on the setup screen when a persisted game exists, including a finished one, because it shows whenever `game` is non-null. It is harmless: it discards the saved game after a confirm.
- The human's turns in the browser run were automated, so the human-side card timers were bypassed. The bot's Fast Bot path ran for real.
- Vitest also picks up `.claude/worktrees/agent-*/src/**/*.test.ts`, another agent's worktree, so `npm test` currently reports 16 files / 100 tests. The project's own count is 8/50. I did not touch the config.
- `progress.md` (the SDD ledger) was already modified in the tree. I left it uncommitted for the controller.
