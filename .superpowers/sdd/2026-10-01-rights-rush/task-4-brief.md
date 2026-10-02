### Task 4: Founders, Who-Said-It, scenarios + content tests

**Files:** Create `src/data/founders.ts`, `src/data/whoSaid.ts`, `src/data/scenarios.ts`, `src/data/content.test.ts`

Use the **design:ux-copy** skill for all `prompt`, `explain` and `summary` text (8th-grade level, ≤ 25 words each).

- [ ] **Step 1: Failing test** `src/data/content.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { AMENDMENTS } from './amendments';
import { GRIEVANCES } from './grievances';
import { FOUNDERS } from './founders';
import { WHO_SAID } from './whoSaid';
import { SCENARIOS } from './scenarios';
import { CLAUSES } from './clauses';
import { SOURCES } from './sources';

describe('content', () => {
  it('has the required counts', () => {
    expect(AMENDMENTS.map(a => a.n)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(CLAUSES).toHaveLength(3);
    expect(GRIEVANCES).toHaveLength(5);
    expect(FOUNDERS).toHaveLength(8);
    expect(WHO_SAID).toHaveLength(15);
    expect(SCENARIOS).toHaveLength(30);
  });
  it('has 3 scenarios per amendment, each with 3 distinct choices including the answer', () => {
    for (let n = 1; n <= 10; n++) expect(SCENARIOS.filter(s => s.amendment === n)).toHaveLength(3);
    for (const s of SCENARIOS) {
      expect(new Set(s.choices).size).toBe(3);
      expect(s.choices).toContain(s.amendment);
    }
  });
  it('Who Said It: choices distinct, include the answer, and cover all 10 sources', () => {
    for (const w of WHO_SAID) { expect(new Set(w.choices).size).toBe(3); expect(w.choices).toContain(w.source); }
    expect(new Set(WHO_SAID.map(w => w.source))).toEqual(new Set(SOURCES.map(s => s.id)));
  });
  it('uses every founder effect', () => {
    expect(new Set(FOUNDERS.map(f => f.effect)).size).toBe(6);
  });
  it('never puts quotation marks in kid-friendly text', () => {
    const kid = [...AMENDMENTS.map(a => a.summary), ...CLAUSES.map(c => c.explain), ...GRIEVANCES.map(g => g.explain),
                 ...FOUNDERS.map(f => f.explain), ...SCENARIOS.map(s => s.prompt)];
    for (const t of kid) expect(t).not.toMatch(/["“”]/);
  });
});
```

Run `npx vitest run src/data/content.test.ts`. Expected: FAIL (missing modules).

- [ ] **Step 2: Founders.** Use the 8 cards from the spec table. Find the Fed 55 quote by running `grep -o "Republican government presupposes[^.]*\." sources-cache/fed55.txt` and use that exact sentence. The Brutus and Centinel `explain` must say (as a summary) that Antifederalists' worries pushed leaders to add a Bill of Rights.
- [ ] **Step 3: Who Said It.** 15 quotes covering all 10 sources. Candidates: Henry "give me liberty, or give me death!"; Paine "a necessary evil", "We have it in our power to begin the world over again"; Declaration "all men are created equal", "deriving their just powers from the consent of the governed"; Constitution "secure the Blessings of Liberty to ourselves and our Posterity", the Habeas Corpus sentence; Bill of Rights "abridging the freedom of speech, or of the press"; Fed 10 "Liberty is to faction what air is to fire"; Fed 51 "If men were angels, no government would be necessary"; Fed 55 "esteem and confidence" sentence; Brutus 1 "manners, sentiments, and interests"; Centinel 1 "All the blessings of liberty…". That makes 13; add 2 more from any source (e.g. Declaration "unalienable Rights", Fed 51 "Ambition must be made to counteract ambition"). The 2 wrong choices should be plausible (e.g. Fed 51 vs. Fed 10 vs. Brutus 1).
- [ ] **Step 4: Scenarios.** 30 concrete situations, 3 per amendment, written in second person, e.g. `{ amendment: 3, prompt: 'Soldiers knock and say they will live in your house. Which amendment protects you?', choices: [3, 4, 2], source: 'bill-of-rights' }`. Vary the position of the correct answer.
- [ ] **Step 5: Run** `npm test && npm run verify-quotes` (all imports enabled). Expected: tests PASS and every quote verified.
- [ ] **Step 6: Commit** with `feat: founder, who-said-it, scenario content`.

---

