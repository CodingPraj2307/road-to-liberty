### Task 10: Visual system + board screen

Invoke **ui-ux-pro-max** to choose the palette, font pairing and style (aged parchment, colonial broadside, navy/red/cream, projector contrast ≥ 7:1 for body text). Then invoke **frontend-design** before writing components.

**Files:** Modify `src/index.css` (Tailwind `@theme` tokens: colors, the 5 era colors, fonts from Google Fonts). Create `src/ui/Board.tsx`, `src/ui/Dice.tsx`, `src/ui/Hands.tsx`, `src/ui/Log.tsx`. Modify `src/App.tsx`.

- [ ] **Step 1: Tokens.** Define `--color-parchment`, `--color-ink`, `--color-navy`, `--color-crimson`, `--color-era-1..5` and `--font-display`/`--font-body` in `@theme`. Set `html { font-size: 18px }` as the minimum. Add a `prefers-reduced-motion` rule that sets animation durations to 0.
- [ ] **Step 2: Board.** A 30-space serpentine path laid out in a CSS grid (6 columns × 5 rows, alternate rows reversed so the path snakes). Each row is one era, with an era banner (year + title) and its era color. Each space shows an icon + short label (Right, Grievance, Founder, Who Said It?, Unfinished Liberty). Two tokens (human = navy, bot = crimson) are absolutely positioned and animate `transform` over ≤150ms per space. Each space has `aria-label` like "Space 13, Era 3, Right".
- [ ] **Step 3: Dice.** A large die face that tumbles for ≤600ms (0 for the bot with Fast Bot) and then shows `lastRoll`. A "Roll (Space)" button, disabled unless it's the human's roll phase.
- [ ] **Step 4: Hands.** For each player: name, a 10-slot row of amendment seals (filled when held, with a ×2 badge for duplicates), a "different: n/5" progress count, and Shield/Checked status chips.
- [ ] **Step 5: Log.** Sidebar showing `game.log`, newest first, last 12 lines. Wrapped in `aria-live="polite"`.
- [ ] **Step 6: App layout** at 1280×720 with no scrolling: board on the left (~70%), hands + dice + log on the right.
- [ ] **Step 7: Verify.** Run `npm run dev` via preview_start, take a screenshot at 1280×720, and check the console for errors.
- [ ] **Step 8: Commit** with `feat(ui): broadside visual system, board, dice, hands, log`.

---

