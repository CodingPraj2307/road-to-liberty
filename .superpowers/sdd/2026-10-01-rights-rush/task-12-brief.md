### Task 12: Setup, end screen, fullscreen, Fast Bot, resume

**Files:** Create `src/ui/Setup.tsx`, `src/ui/EndScreen.tsx`. Modify `src/App.tsx`.

- [ ] **Step 1: Setup** (`game === null`): title "Rights Rush", a 2-line how-to-play, a name input, a "Fast Bot" checkbox, and "Start (Enter)". If a saved game exists in storage, show "Resume game" and "New game". Every screen has a header with a fullscreen button (F) and a "Quit" button that asks for confirmation with a native `confirm()`.
- [ ] **Step 2: EndScreen** (`phase === 'over'`):
  - The winner banner, plus each player's amendments as seals.
  - A "Grievances → Rights" `<table>` with columns: grievance quote | answered by (amendment number(s) + title).
  - "Unfinished Liberty": the clauses in `unfinishedSeen`, with text + summary. If none were landed on this game, show all 3 under "Clauses you didn't land on".
  - "Your Bill of Rights": 10 native `<details>` elements, each with the summary in the `<summary>` and the verified text inside.
  - "Play again" calls `quit()` and then the setup screen.
- [ ] **Step 3: Verify.** Play a full game in the preview with Fast Bot on and check the end screen renders with no console errors. Reload mid-game and check that Resume works.
- [ ] **Step 4: Commit** with `feat(ui): setup, end-of-game recap, resume, fullscreen`.

---

