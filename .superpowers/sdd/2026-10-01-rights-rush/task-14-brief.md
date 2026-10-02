### Task 14: Copy, accessibility, reviews, verification

- [ ] **Step 1:** Run **design:ux-copy** over every button, tooltip, label and card text; apply the edits; re-run `npm test && npm run verify-quotes`.
- [ ] **Step 2:** Run **design:accessibility-review** on the running app (contrast, focus order, keyboard-only full game, `aria-live`, reduced motion). Fix all issues.
- [ ] **Step 3:** Reviews in order: **code-review**, then **coderabbit:code-review**, then **engineering:code-review**. Fix every finding rated high or medium (use superpowers:receiving-code-review). Commit the fixes.
- [ ] **Step 4: Demo check.** With Playwright at 1280×720, play a full game keyboard-only with Fast Bot. Assert the end screen appears and the console has no errors. Record the elapsed time. With Fast Bot off and ~12s per human turn, the estimate should be ≤ 8 min.
- [ ] **Step 5:** Run **superpowers:verification-before-completion**: `npm test`, `npm run build`, `npm run verify-quotes` (docs/sources.md all ✅). Paste the outputs into the final summary (what was built, what was cut, how to deploy).
- [ ] **Step 6:** Update the memory file status, then commit with `chore: review fixes, a11y, final verification`.
