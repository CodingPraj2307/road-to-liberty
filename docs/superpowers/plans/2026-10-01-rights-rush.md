# Rights Rush Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A projector-ready race board game: 1 human vs. 1 bot, 30 spaces, collecting Bill of Rights cards. Every quote is verified against the 10 founding-era sources.

**Architecture:** A pure TypeScript rules engine (`src/engine`) over serializable state, including the RNG seed. Content lives in typed data files (`src/data`). A Zustand store with localStorage persistence wraps the engine. React/Tailwind UI owns timers and animations only. Node scripts cache the source texts and verify the quotes.

**Tech Stack:** Vite + React + TypeScript, Tailwind CSS v4, Zustand, Vitest, tsx, unpdf, Playwright (demo check).

**Spec:** `docs/superpowers/specs/2026-10-01-rights-rush-design.md`

## Global Constraints

- Sources: ONLY the 10 URLs in the spec. Every `quote` must be one unbroken substring of its cached source. No ellipses.
- Kid text (`summary`, `explain`, `prompt`) is for 8th grade: short sentences, never inside quotation marks, labeled "Summary" in the UI.
- Every data item has a `source` field.
- Body text ≥ 18px. Works at 1280×720. Keys: Space = roll, Enter = confirm/continue, 1–3 = choose, F = fullscreen.
- Question timer: 20s. Wrong-answer reveal: 3s. Unfinished Liberty: 5s. Bot: 70% correct, 2× animation speed, Fast Bot skips animations.
- Vite `base: '/road-to-liberty/'`.
- Commit after each task. Commit messages end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## File Structure

```
scripts/fetch-sources.ts      download the 10 sources → sources-cache/*.txt (one-off; output committed)
scripts/verify-quotes.ts      check every quote, write docs/sources.md, exit 1 on failure
sources-cache/<id>.txt        cached plain text of each source
src/data/types.ts             all content types + SourceId + Amendment
src/data/sources.ts           SOURCES (id, title, url)
src/data/quote.ts             normalize + quoteFound (shared by script + tests)
src/data/amendments.ts        AMENDMENTS (10)
src/data/clauses.ts           CLAUSES (3 Unfinished Liberty)
src/data/grievances.ts        GRIEVANCES (5)
src/data/founders.ts          FOUNDERS (8)
src/data/whoSaid.ts           WHO_SAID (15)
src/data/scenarios.ts         SCENARIOS (30)
src/data/content.test.ts      shape/count checks on content
src/engine/types.ts           GameState, Player, Pending, Space
src/engine/rng.ts             mulberry32 random(g) that advances g.seed
src/engine/board.ts           BOARD, FINISH, ERA4_START, clauseAt
src/engine/game.ts            newGame, roll, answer, acknowledge, grievanceBlocker, distinct
src/engine/bot.ts             BOT_ACCURACY, botCorrect
src/engine/*.test.ts          engine tests + pacing simulation
src/store/game.ts             Zustand store (persist) + feedback state
src/ui/useBotDriver.ts        schedules bot actions
src/ui/useKeys.ts             keyboard shortcuts
src/ui/*.tsx                  App, Setup, Board, Dice, Hands, Log, QuestionModal, CardReveal, Feedback, EndScreen
.github/workflows/deploy.yml  GitHub Pages deploy
README.md
```

---

### Task 1: Scaffold

**Files:** project root config, `src/main.tsx`, `src/index.css`, `vite.config.ts`, `package.json`

- [ ] **Step 1: Scaffold and install** (if npm hits EACCES, set `npm_config_cache` to a writable folder; see memory)

```bash
cd ~/road-to-liberty
npm create vite@latest . -- --template react-ts
npm i zustand
npm i -D tailwindcss @tailwindcss/vite vitest tsx unpdf @types/node
```

- [ ] **Step 2: Configure** `vite.config.ts`:

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  base: '/road-to-liberty/',
  plugins: [react(), tailwindcss()],
  test: { environment: 'node' },
});
```

Add `/// <reference types="vitest/config" />` at the top. Replace `src/index.css` with `@import "tailwindcss";`. Delete the template demo content in `App.tsx` (render `<h1>Rights Rush</h1>`). Add these scripts to `package.json`:

```json
"test": "vitest run",
"fetch-sources": "tsx scripts/fetch-sources.ts",
"verify-quotes": "tsx scripts/verify-quotes.ts"
```

- [ ] **Step 3: Verify** with `npm run build`. Expected: success.
- [ ] **Step 4: Commit** with `chore: scaffold Vite React TS + Tailwind + Vitest` (include `docs/`).

---

### Task 2: Content types, quote matcher, source cache

**Files:** Create `src/data/types.ts`, `src/data/sources.ts`, `src/data/quote.ts`, `src/data/quote.test.ts`, `scripts/fetch-sources.ts`, `sources-cache/*.txt`

**Interfaces — Produces:** all types below; `SOURCES: Source[]`; `quoteFound(quote, sourceText): boolean`.

- [ ] **Step 1: Types** `src/data/types.ts`:

```ts
export type SourceId =
  | 'henry' | 'common-sense' | 'declaration' | 'constitution' | 'bill-of-rights'
  | 'fed10' | 'fed51' | 'fed55' | 'brutus1' | 'centinel1';
export type Amendment = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
export type FounderEffect = 'forward2' | 'reroll' | 'check' | 'stealDuplicate' | 'collectMissing' | 'shield';

export interface Source { id: SourceId; title: string; url: string }
export interface Quoted { quote: string; source: SourceId; section: string }
export interface AmendmentCard extends Quoted { n: Amendment; title: string; summary: string }
export interface Clause extends Quoted { title: string; explain: string }
export interface Grievance extends Quoted { answers: Amendment[]; explain: string }
export interface FounderCard extends Quoted { speaker: string; effect: FounderEffect; explain: string }
export interface WhoSaid extends Quoted { choices: [SourceId, SourceId, SourceId] }
export interface Scenario { amendment: Amendment; prompt: string; choices: [Amendment, Amendment, Amendment]; source: 'bill-of-rights' }
```

- [ ] **Step 2: Sources** `src/data/sources.ts`: export `SOURCES: Source[]` with the 10 ids, titles and URLs, copied exactly from the spec table.

- [ ] **Step 3: Failing test** `src/data/quote.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { quoteFound } from './quote';

describe('quoteFound', () => {
  it('matches across whitespace and quote/dash styles', () => {
    expect(quoteFound("give me liberty, or give me death!", "his voice ‘give me  liberty,\nor give me death!’")).toBe(true);
    expect(quoteFound('a — b', 'x a - b y')).toBe(true);
  });
  it('joins words hyphenated across a line break in the source', () => {
    expect(quoteFound('the Blessings of Liberty', 'the Bless-\nings of Liberty')).toBe(true);
  });
  it('is case-sensitive and rejects paraphrase', () => {
    expect(quoteFound('Give me liberty', 'give me liberty')).toBe(false);
    expect(quoteFound('give me freedom', 'give me liberty')).toBe(false);
  });
});
```

Run `npx vitest run src/data/quote.test.ts`. Expected: FAIL (module not found).

- [ ] **Step 4: Implement** `src/data/quote.ts`:

```ts
const base = (s: string) =>
  s.replace(/[‘’]/g, "'").replace(/[“”]/g, '"')
   .replace(/[–—]/g, '-').replace(/\s+/g, ' ').trim();

// Only the source gets line-break hyphens joined; quotes are matched as written.
export const normalizeSource = (s: string) => base(s.replace(/(\w)-[ \t]*\r?\n\s*(\w)/g, '$1$2'));
export const quoteFound = (quote: string, sourceText: string) => normalizeSource(sourceText).includes(base(quote));
```

Run the test again. Expected: PASS.

- [ ] **Step 5: Fetch script** `scripts/fetch-sources.ts`:

```ts
import { mkdirSync, writeFileSync } from 'node:fs';
import { extractText, getDocumentProxy } from 'unpdf';
import { SOURCES } from '../src/data/sources';

const ENT: Record<string, string> = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', rsquo: '’', lsquo: '‘',
  rdquo: '”', ldquo: '“', mdash: '—', ndash: '–', hellip: '…', sect: '§',
};
const decode = (s: string) => s
  .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n))
  .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
  .replace(/&(\w+);/g, (m, n) => ENT[n] ?? m);
const htmlToText = (h: string) => decode(h
  .replace(/<(script|style|noscript)[\s\S]*?<\/\1>/gi, '')
  .replace(/<br\s*\/?>|<\/(p|div|h\d|li)>/gi, '\n')
  .replace(/<[^>]+>/g, ' '));

mkdirSync('sources-cache', { recursive: true });
for (const s of SOURCES) {
  const res = await fetch(s.url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  if (!res.ok) throw new Error(`${s.id}: HTTP ${res.status}`);
  const buf = new Uint8Array(await res.arrayBuffer());
  const text = s.url.endsWith('.pdf')
    ? (await extractText(await getDocumentProxy(buf), { mergePages: true })).text
    : htmlToText(new TextDecoder().decode(buf));
  writeFileSync(`sources-cache/${s.id}.txt`, text);
  console.log(`${s.id}: ${text.length} chars`);
}
```

- [ ] **Step 6: Run** `npm run fetch-sources`. Expected: 10 lines, each over 2,000 chars. Spot-check with `grep -c "Quartering" sources-cache/declaration.txt` (≥1) and `grep -c "give me death" sources-cache/henry.txt` (≥1). If a site returns 403, read the page with the in-app browser (`get_page_text`) and save the text into that cache file. Note this in the README.
- [ ] **Step 7: Commit** with `feat: content types, quote matcher, cached source texts`.

---

### Task 3: Verify script + amendments, clauses, grievances

**Files:** Create `scripts/verify-quotes.ts`, `src/data/amendments.ts`, `src/data/clauses.ts`, `src/data/grievances.ts`, `docs/sources.md` (generated)

**Interfaces — Produces:** `AMENDMENTS: AmendmentCard[]` (index i = Amendment i+1), `CLAUSES: Clause[]` (order: 3/5ths, slave trade, fugitive), `GRIEVANCES: Grievance[]`.

- [ ] **Step 1: Verify script** `scripts/verify-quotes.ts`. Once all data files exist, it imports every quoted collection. Until Task 4, import only the files that exist.

```ts
import { readFileSync, writeFileSync } from 'node:fs';
import { SOURCES } from '../src/data/sources';
import { quoteFound } from '../src/data/quote';
import { AMENDMENTS } from '../src/data/amendments';
import { CLAUSES } from '../src/data/clauses';
import { GRIEVANCES } from '../src/data/grievances';
import { FOUNDERS } from '../src/data/founders';
import { WHO_SAID } from '../src/data/whoSaid';
import type { Quoted } from '../src/data/types';

const items: (Quoted & { label: string })[] = [
  ...AMENDMENTS.map(a => ({ ...a, label: `Amendment ${a.n}` })),
  ...CLAUSES.map(c => ({ ...c, label: `Unfinished: ${c.title}` })),
  ...GRIEVANCES.map((g, i) => ({ ...g, label: `Grievance ${i + 1}` })),
  ...FOUNDERS.map(f => ({ ...f, label: `Founder: ${f.speaker}` })),
  ...WHO_SAID.map((w, i) => ({ ...w, label: `Who Said It ${i + 1}` })),
];
const url = Object.fromEntries(SOURCES.map(s => [s.id, s.url]));
const text = Object.fromEntries(SOURCES.map(s => [s.id, readFileSync(`sources-cache/${s.id}.txt`, 'utf8')]));
const rows = items.map(it => ({ ...it, ok: !!text[it.source] && quoteFound(it.quote, text[it.source]) }));
const esc = (s: string) => s.replace(/\|/g, '\\|');
const ok = rows.filter(r => r.ok).length;
writeFileSync('docs/sources.md', [
  '# Source verification', '',
  `Generated by \`npm run verify-quotes\`. **${ok}/${rows.length} quotes verified** word for word against \`sources-cache/\`.`, '',
  '| Status | Item | Source | Section | Quote |', '|---|---|---|---|---|',
  ...rows.map(r => `| ${r.ok ? '✅ verified' : '❌ NOT FOUND'} | ${esc(r.label)} | [${r.source}](${url[r.source]}) | ${esc(r.section)} | ${esc(r.quote)} |`),
].join('\n') + '\n');
for (const r of rows.filter(r => !r.ok)) console.error(`NOT FOUND [${r.source}] ${r.label}: ${r.quote}`);
console.log(`${ok}/${rows.length} verified`);
process.exit(ok === rows.length ? 0 : 1);
```

- [ ] **Step 2: Amendments.** Write the full text of Amendments I–X from `sources-cache/bill-of-rights.txt`, copied exactly. Use `section: 'Amendment III'` and so on. `title` is short (e.g. "No Soldiers in Your House"). `summary` is one plain sentence with no quotation marks. Example:

```ts
{ n: 3, title: 'No Soldiers in Your House', source: 'bill-of-rights', section: 'Amendment III',
  quote: 'No Soldier shall, in time of peace be quartered in any house, without the consent of the Owner, nor in time of war, but in a manner to be prescribed by law.',
  summary: 'The government cannot make you house soldiers in your home during peacetime.' },
```

- [ ] **Step 3: Clauses.** Three entries from `sources-cache/constitution.txt`: Art. I §2 ("three fifths of all other Persons" sentence), Art. I §9 ("The Migration or Importation of such Persons…" sentence), and Art. IV §2 ("No Person held to Service or Labour…" sentence). Copy each sentence in full. Each `explain` is one respectful sentence, e.g. "Here, 'other Persons' meant enslaved people. The Constitution counted them as three-fifths of a person and did not protect their liberty."
- [ ] **Step 4: Grievances.** Use exactly the 5 pairings in the spec table (quote, `answers`, `section: 'List of grievances'`). Each `explain` is one sentence linking the complaint to the right.
- [ ] **Step 5: Run** `npm run verify-quotes` (with the not-yet-existing imports commented out). Expected: all verified. If any quote fails, fix the quote to match the source exactly. Never loosen the matcher.
- [ ] **Step 6: Commit** with `feat: verified amendments, clauses, grievances + verify-quotes`.

---

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

### Task 5: Engine types, RNG, board

**Files:** Create `src/engine/types.ts`, `src/engine/rng.ts`, `src/engine/board.ts`, `src/engine/board.test.ts`

**Interfaces — Produces:**

```ts
// src/engine/types.ts
import type { Amendment } from '../data/types';
export type Era = 1 | 2 | 3 | 4 | 5;
export type SpaceKind = 'start' | 'right' | 'grievance' | 'founder' | 'whoSaid' | 'unfinished' | 'finish';
export interface Space { kind: SpaceKind; era: Era }
export interface Player { name: string; isBot: boolean; pos: number; hand: Amendment[]; blockNextGain: boolean; shielded: boolean }
export type Pending = { kind: 'right' | 'grievance' | 'founder' | 'whoSaid' | 'unfinished'; card: number };
export interface GameState {
  seed: number;
  players: [Player, Player];
  current: 0 | 1;
  phase: 'roll' | 'resolve' | 'over';
  lastRoll: number | null;
  pending: Pending | null;
  winner: 0 | 1 | null;
  grievancesDrawn: number[];
  unfinishedSeen: number[];
  log: string[];
}
```

- [ ] **Step 1: Failing test** `src/engine/board.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { BOARD, FINISH, ERA4_START, clauseAt } from './board';
import { random } from './rng';

describe('board', () => {
  it('has 30 spaces in 5 eras of 6, start and finish at the ends', () => {
    expect(BOARD).toHaveLength(30);
    expect(BOARD[0].kind).toBe('start');
    expect(BOARD[FINISH].kind).toBe('finish');
    expect(BOARD.map(s => s.era)).toEqual(Array.from({ length: 30 }, (_, i) => Math.floor(i / 6) + 1));
    expect(ERA4_START).toBe(18);
  });
  it('has the spec counts', () => {
    const count = (k: string) => BOARD.filter(s => s.kind === k).length;
    expect([count('right'), count('grievance'), count('founder'), count('whoSaid'), count('unfinished')]).toEqual([11, 5, 5, 4, 3]);
  });
  it('maps unfinished spaces to clauses 0,1,2 in order', () => {
    const idx = BOARD.flatMap((s, i) => (s.kind === 'unfinished' ? [i] : []));
    expect(idx.map(clauseAt)).toEqual([0, 1, 2]);
  });
});

describe('random', () => {
  it('is deterministic per seed and advances the seed', () => {
    const a = { seed: 42 }, b = { seed: 42 };
    expect(random(a)).toBe(random(b));
    expect(a.seed).not.toBe(42);
    const r = random(a);
    expect(r).toBeGreaterThanOrEqual(0);
    expect(r).toBeLessThan(1);
  });
});
```

Run `npx vitest run src/engine/board.test.ts`. Expected: FAIL.

- [ ] **Step 2: Implement.**

```ts
// src/engine/rng.ts — mulberry32; state lives in the object so GameState stays serializable
export function random(g: { seed: number }): number {
  let t = (g.seed = (g.seed + 0x6d2b79f5) | 0);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
```

```ts
// src/engine/board.ts
import type { Era, Space, SpaceKind } from './types';

const KINDS = (
  'start right founder whoSaid right grievance ' +
  'right grievance whoSaid right founder right ' +
  'unfinished right grievance unfinished founder unfinished ' +
  'right founder grievance whoSaid right founder ' +
  'right grievance right whoSaid right finish'
).split(' ') as SpaceKind[];

export const BOARD: Space[] = KINDS.map((kind, i) => ({ kind, era: (Math.floor(i / 6) + 1) as Era }));
export const FINISH = 29;
export const ERA4_START = 18;
export const clauseAt = (pos: number) => BOARD.slice(0, pos).filter(s => s.kind === 'unfinished').length;
```

- [ ] **Step 3: Run** the tests. Expected: PASS.
- [ ] **Step 4: Commit** with `feat(engine): types, seeded rng, board layout`.

---

### Task 6: Engine core: newGame, roll, finish rule, answer

**Files:** Create `src/engine/game.ts`, `src/engine/game.test.ts`, `src/engine/testUtils.ts` (shared helper; never import one test file from another, because Vitest would re-register its tests)

```ts
// src/engine/testUtils.ts
import { newGame } from './game';
import type { GameState, Pending } from './types';
import type { Amendment } from '../data/types';

export function at(pos: number, hand: Amendment[] = [], pending: Pending | null = null): GameState {
  const g = newGame('Ana', 7);
  g.players[0].pos = pos;
  g.players[0].hand = hand;
  if (pending) { g.pending = pending; g.phase = 'resolve'; }
  return g;
}
```

**Interfaces — Produces:** `newGame(name: string, seed: number): GameState`, `roll(s): GameState`, `answer(s, correct: boolean): GameState`, `distinct(hand): number`, `ALL: Amendment[]`. Every function returns a new state and never mutates its input.

- [ ] **Step 1: Failing tests** `src/engine/game.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { newGame, roll, answer, distinct } from './game';
import { BOARD, FINISH, ERA4_START } from './board';
import { SCENARIOS } from '../data/scenarios';
import { at } from './testUtils';

describe('newGame', () => {
  it('creates human vs bot at start', () => {
    const g = newGame('Ana', 1);
    expect(g.players.map(p => [p.name, p.isBot, p.pos])).toEqual([['Ana', false, 0], ['Computer', true, 0]]);
    expect(g.phase).toBe('roll');
  });
});

describe('roll', () => {
  it('moves 1–6 and sets a pending card matching the space kind', () => {
    for (let seed = 1; seed < 50; seed++) {
      const g = roll(newGame('Ana', seed));
      expect(g.lastRoll).toBeGreaterThanOrEqual(1);
      expect(g.lastRoll).toBeLessThanOrEqual(6);
      expect(g.players[0].pos).toBe(g.lastRoll);
      expect(g.pending?.kind).toBe(BOARD[g.players[0].pos].kind);
      expect(g.phase).toBe('resolve');
    }
  });
  it('does not mutate its input', () => {
    const g = newGame('Ana', 3);
    roll(g);
    expect(g.players[0].pos).toBe(0);
  });
  it('rejects rolling outside the roll phase', () => {
    expect(() => roll(at(1, [], { kind: 'right', card: 0 }))).toThrow();
  });
  it('wins at FINISH with 5+ different amendments', () => {
    const g = roll(at(FINISH - 1, [1, 2, 3, 4, 5]));
    expect(g.winner).toBe(0);
    expect(g.phase).toBe('over');
  });
  it('sends you back to Era 4 at FINISH with fewer than 5, and passes the turn', () => {
    const g = roll(at(FINISH - 1, [1, 1, 2, 3, 4]));
    expect(g.players[0].pos).toBe(ERA4_START);
    expect(g.current).toBe(1);
    expect(g.winner).toBeNull();
  });
});

describe('answer', () => {
  const card = SCENARIOS.findIndex(s => s.amendment === 3);
  it('correct RIGHT answer gains the amendment and passes the turn', () => {
    const g = answer(at(1, [], { kind: 'right', card }), true);
    expect(g.players[0].hand).toEqual([3]);
    expect(g.current).toBe(1);
    expect(g.phase).toBe('roll');
  });
  it('wrong RIGHT answer gains nothing', () => {
    expect(answer(at(1, [], { kind: 'right', card }), false).players[0].hand).toEqual([]);
  });
  it('a Check cancels the next gain once', () => {
    const s = at(1, [], { kind: 'right', card });
    s.players[0].blockNextGain = true;
    const g = answer(s, true);
    expect(g.players[0].hand).toEqual([]);
    expect(g.players[0].blockNextGain).toBe(false);
  });
  it('collecting the 10th different amendment wins instantly', () => {
    const s = at(1, [1, 2, 4, 5, 6, 7, 8, 9, 10], { kind: 'right', card });
    expect(answer(s, true).winner).toBe(0);
  });
  it('correct WHO SAID IT moves forward 1 without resolving the new space', () => {
    const g = answer(at(3, [], { kind: 'whoSaid', card: 0 }), true);
    expect(g.players[0].pos).toBe(4);
    expect(g.pending).toBeNull();
  });
  it('duplicates are allowed', () => {
    expect(distinct(answer(at(1, [3], { kind: 'right', card }), true).players[0].hand)).toBe(1);
  });
});
```

Run `npx vitest run src/engine/game.test.ts`. Expected: FAIL.

- [ ] **Step 2: Implement** `src/engine/game.ts`. In Task 7, `acknowledge` and `grievanceBlocker` go in this same file.

```ts
import { BOARD, FINISH, ERA4_START, clauseAt } from './board';
import { random } from './rng';
import { SCENARIOS } from '../data/scenarios';
import { GRIEVANCES } from '../data/grievances';
import { FOUNDERS } from '../data/founders';
import { WHO_SAID } from '../data/whoSaid';
import type { GameState, Player } from './types';
import type { Amendment } from '../data/types';

export const ALL: Amendment[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
export const distinct = (hand: Amendment[]) => new Set(hand).size;
const ORD = ['', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th'];
export const ord = (a: Amendment) => ORD[a];
const cur = (g: GameState) => g.players[g.current];
const opp = (g: GameState) => g.players[1 - g.current];
const DECK_SIZE = { right: SCENARIOS.length, grievance: GRIEVANCES.length, founder: FOUNDERS.length, whoSaid: WHO_SAID.length };

export function newGame(name: string, seed: number): GameState {
  const p = (name: string, isBot: boolean): Player => ({ name, isBot, pos: 0, hand: [], blockNextGain: false, shielded: false });
  return {
    seed, players: [p(name, false), p('Computer', true)], current: 0, phase: 'roll',
    lastRoll: null, pending: null, winner: null, grievancesDrawn: [], unfinishedSeen: [], log: [],
  };
}

function endTurn(g: GameState, extraTurn = false) {
  g.pending = null;
  if (g.winner !== null) { g.phase = 'over'; return; }
  g.phase = 'roll';
  if (!extraTurn) g.current = (1 - g.current) as 0 | 1;
}

function finish(g: GameState) {
  const p = cur(g);
  if (distinct(p.hand) >= 5) {
    g.winner = g.current;
    g.log.push(`${p.name} reached Bill of Rights Ratified and wins!`);
  } else {
    p.pos = ERA4_START;
    g.log.push(`${p.name} needs 5 different Amendments. Back to Era 4!`);
  }
}

// Forced moves never resolve the space they end on; only FINISH is checked.
function moveBy(g: GameState, n: number) {
  const p = cur(g);
  p.pos = Math.max(0, Math.min(FINISH, p.pos + n));
  if (p.pos === FINISH) finish(g);
}

function gain(g: GameState, who: 0 | 1, a: Amendment) {
  const p = g.players[who];
  if (p.blockNextGain) {
    p.blockNextGain = false;
    g.log.push(`Checked! ${p.name} does not get the ${ord(a)} Amendment.`);
    return;
  }
  p.hand.push(a);
  g.log.push(`${p.name} collects the ${ord(a)} Amendment.`);
  if (distinct(p.hand) === 10) g.winner = who;
}

export function roll(s: GameState): GameState {
  if (s.phase !== 'roll') throw new Error('Not the roll phase');
  const g = structuredClone(s);
  const p = cur(g);
  const d = 1 + Math.floor(random(g) * 6);
  g.lastRoll = d;
  p.pos = Math.min(FINISH, p.pos + d);
  g.log.push(`${p.name} rolled a ${d}.`);
  if (p.pos === FINISH) { finish(g); endTurn(g); return g; }
  const kind = BOARD[p.pos].kind as 'right' | 'grievance' | 'founder' | 'whoSaid' | 'unfinished';
  g.pending = { kind, card: kind === 'unfinished' ? clauseAt(p.pos) : Math.floor(random(g) * DECK_SIZE[kind]) };
  g.phase = 'resolve';
  return g;
}

export function answer(s: GameState, correct: boolean): GameState {
  const pd = s.pending;
  if (s.phase !== 'resolve' || !pd || (pd.kind !== 'right' && pd.kind !== 'whoSaid')) throw new Error('No question pending');
  const g = structuredClone(s);
  if (pd.kind === 'right') {
    if (correct) gain(g, g.current, SCENARIOS[pd.card].amendment);
    else g.log.push(`${cur(g).name} missed it. The answer was the ${ord(SCENARIOS[pd.card].amendment)} Amendment.`);
  } else if (correct) {
    g.log.push(`${cur(g).name} knew who said it! Forward 1.`);
    moveBy(g, 1);
  } else {
    g.log.push(`${cur(g).name} guessed wrong on Who Said It.`);
  }
  endTurn(g);
  return g;
}
```

- [ ] **Step 3: Run** the tests. Expected: PASS.
- [ ] **Step 4: Commit** with `feat(engine): roll, finish rule, answering questions`.

---

### Task 7: Engine: grievances, founders, unfinished liberty

**Files:** Modify `src/engine/game.ts` (append). Create `src/engine/acknowledge.test.ts`.

**Interfaces — Produces:** `acknowledge(s, pick?: Amendment): GameState` and `grievanceBlocker(p: Player, card: number): Amendment | 'shield' | null` (also used by the UI to show the result).

- [ ] **Step 1: Failing tests** `src/engine/acknowledge.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { acknowledge, grievanceBlocker } from './game';
import { at } from './testUtils';
import { GRIEVANCES } from '../data/grievances';
import { FOUNDERS } from '../data/founders';
import type { FounderEffect } from '../data/types';

const quartering = GRIEVANCES.findIndex(c => c.answers.includes(3));
const founder = (e: FounderEffect) => FOUNDERS.findIndex(f => f.effect === e);

describe('grievance', () => {
  it('is blocked by a matching amendment', () => {
    const g = acknowledge(at(5, [3], { kind: 'grievance', card: quartering }));
    expect(g.players[0].pos).toBe(5);
    expect(g.grievancesDrawn).toEqual([quartering]);
  });
  it('sends you back 2 without the amendment', () => {
    expect(acknowledge(at(5, [1], { kind: 'grievance', card: quartering })).players[0].pos).toBe(3);
  });
  it('a shield blocks once and is used up', () => {
    const s = at(5, [], { kind: 'grievance', card: quartering });
    s.players[0].shielded = true;
    const g = acknowledge(s);
    expect(g.players[0].pos).toBe(5);
    expect(g.players[0].shielded).toBe(false);
  });
  it('grievanceBlocker reports the blocking amendment first', () => {
    const p = { ...at(0).players[0], hand: [3 as const], shielded: true };
    expect(grievanceBlocker(p, quartering)).toBe(3);
  });
  it('records each grievance once', () => {
    const g1 = acknowledge(at(5, [3], { kind: 'grievance', card: quartering }));
    g1.players[1].hand = [3]; g1.players[1].pos = 5; g1.pending = { kind: 'grievance', card: quartering }; g1.phase = 'resolve';
    expect(acknowledge(g1).grievancesDrawn).toEqual([quartering]);
  });
});

describe('unfinished liberty', () => {
  it('has no effect but is recorded', () => {
    const g = acknowledge(at(12, [], { kind: 'unfinished', card: 0 }));
    expect(g.players[0].pos).toBe(12);
    expect(g.unfinishedSeen).toEqual([0]);
    expect(g.current).toBe(1);
  });
});

describe('founder effects', () => {
  it('forward2', () => {
    expect(acknowledge(at(2, [], { kind: 'founder', card: founder('forward2') })).players[0].pos).toBe(4);
  });
  it('reroll keeps the same player in the roll phase', () => {
    const g = acknowledge(at(2, [], { kind: 'founder', card: founder('reroll') }));
    expect([g.current, g.phase]).toEqual([0, 'roll']);
  });
  it('check blocks the opponent\'s next gain', () => {
    expect(acknowledge(at(2, [], { kind: 'founder', card: founder('check') })).players[1].blockNextGain).toBe(true);
  });
  it('stealDuplicate takes the lowest duplicated amendment', () => {
    const s = at(2, [], { kind: 'founder', card: founder('stealDuplicate') });
    s.players[1].hand = [5, 5, 2, 2];
    const g = acknowledge(s);
    expect(g.players[0].hand).toEqual([2]);
    expect(g.players[1].hand.sort()).toEqual([2, 5, 5]);
  });
  it('stealDuplicate with no duplicates moves forward 1', () => {
    expect(acknowledge(at(2, [], { kind: 'founder', card: founder('stealDuplicate') })).players[0].pos).toBe(3);
  });
  it('collectMissing takes the picked missing amendment, else the lowest missing', () => {
    expect(acknowledge(at(2, [1], { kind: 'founder', card: founder('collectMissing') }), 7).players[0].hand).toEqual([1, 7]);
    expect(acknowledge(at(2, [1], { kind: 'founder', card: founder('collectMissing') }), 1).players[0].hand).toEqual([1, 2]);
  });
  it('shield sets shielded', () => {
    expect(acknowledge(at(2, [], { kind: 'founder', card: founder('shield') })).players[0].shielded).toBe(true);
  });
  it('rejects acknowledge when a question is pending', () => {
    expect(() => acknowledge(at(1, [], { kind: 'right', card: 0 }))).toThrow();
  });
});
```

Run: `npx vitest run src/engine/acknowledge.test.ts` → Expected: FAIL (no export).

- [ ] **Step 2: Implement** (append to `game.ts`):

```ts
export function grievanceBlocker(p: Player, card: number): Amendment | 'shield' | null {
  const held = GRIEVANCES[card].answers.find(a => p.hand.includes(a));
  return held ?? (p.shielded ? 'shield' : null);
}

export function acknowledge(s: GameState, pick?: Amendment): GameState {
  const pd = s.pending;
  if (s.phase !== 'resolve' || !pd || pd.kind === 'right' || pd.kind === 'whoSaid') throw new Error('Nothing to acknowledge');
  const g = structuredClone(s);
  const p = cur(g);
  let extraTurn = false;

  if (pd.kind === 'unfinished') {
    if (!g.unfinishedSeen.includes(pd.card)) g.unfinishedSeen.push(pd.card);
  } else if (pd.kind === 'grievance') {
    if (!g.grievancesDrawn.includes(pd.card)) g.grievancesDrawn.push(pd.card);
    const by = grievanceBlocker(p, pd.card);
    if (by === 'shield') { p.shielded = false; g.log.push(`${p.name} was protected by Federalist 55.`); }
    else if (by) g.log.push(`Blocked! The ${ord(by)} Amendment fixed this.`);
    else { g.log.push(`${p.name} has no right to block it. Back 2.`); moveBy(g, -2); }
  } else {
    const f = FOUNDERS[pd.card];
    g.log.push(`${p.name} drew ${f.speaker}.`);
    switch (f.effect) {
      case 'forward2': moveBy(g, 2); break;
      case 'reroll': extraTurn = true; break;
      case 'check': opp(g).blockNextGain = true; break;
      case 'shield': p.shielded = true; break;
      case 'stealDuplicate': {
        const o = opp(g);
        const dup = ALL.find(a => o.hand.filter(x => x === a).length >= 2);
        if (dup) { o.hand.splice(o.hand.indexOf(dup), 1); gain(g, g.current, dup); }
        else moveBy(g, 1);
        break;
      }
      case 'collectMissing': {
        const missing = ALL.filter(a => !p.hand.includes(a));
        gain(g, g.current, pick && missing.includes(pick) ? pick : missing[0]);
        break;
      }
    }
  }
  endTurn(g, extraTurn);
  return g;
}
```

- [ ] **Step 3: Run** `npm test`. Expected: PASS.
- [ ] **Step 4: Commit** with `feat(engine): grievances, founder powers, unfinished liberty`.

---

### Task 8: Bot + pacing simulation

**Files:** Create `src/engine/bot.ts`, `src/engine/sim.test.ts`

**Interfaces — Produces:** `BOT_ACCURACY = 0.7`, `botCorrect(s): [boolean, GameState]`.

- [ ] **Step 1: Failing test** `src/engine/sim.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { newGame, roll, answer, acknowledge } from './game';
import { botCorrect } from './bot';

function play(seed: number) {
  let g = newGame('Sim', seed);
  let turns = 0;
  while (g.phase !== 'over' && turns < 300) {
    if (g.phase === 'roll') { g = roll(g); turns++; continue; }
    const k = g.pending!.kind;
    if (k === 'right' || k === 'whoSaid') { const [c, g2] = botCorrect(g); g = answer(g2, c); }
    else g = acknowledge(g);
  }
  return { turns, over: g.phase === 'over' };
}

describe('pacing (≈8 min demo)', () => {
  it('500 games: all finish, median ≤ 40 turns', () => {
    const runs = Array.from({ length: 500 }, (_, i) => play(i + 1));
    const t = runs.map(r => r.turns).sort((a, b) => a - b);
    expect(runs.every(r => r.over)).toBe(true);
    expect(t[250]).toBeLessThanOrEqual(40);
  });
});
```

Run it. Expected: FAIL (no `bot` module).

- [ ] **Step 2: Implement** `src/engine/bot.ts`:

```ts
import { random } from './rng';
import type { GameState } from './types';

export const BOT_ACCURACY = 0.7;
export function botCorrect(s: GameState): [boolean, GameState] {
  const g = structuredClone(s);
  return [random(g) < BOT_ACCURACY, g];
}
```

- [ ] **Step 3: Run** `npm test`. Expected: PASS. If the median is over 40, use superpowers:systematic-debugging: log the turn distribution and the main cause of bounce-backs. Then tune the **board** (e.g. swap a whoSaid space in Era 4/5 for a right space) and update the board test counts and the spec table. Never change the threshold.
- [ ] **Step 4: Commit** with `feat(engine): bot accuracy + pacing simulation`.

---

### Task 9: Store, bot driver, keyboard

**Files:** Create `src/store/game.ts`, `src/ui/useBotDriver.ts`, `src/ui/useKeys.ts`

**Interfaces — Produces:**

```ts
export type Feedback = { pending: Pending; correct?: boolean; who: 0 | 1 };
interface Store {
  game: GameState | null; fastBot: boolean; feedback: Feedback | null;
  start(name: string): void; roll(): void; answer(correct: boolean): void;
  acknowledge(pick?: Amendment): void; clearFeedback(): void; quit(): void; setFastBot(v: boolean): void;
}
export const useGame; // Zustand hook: useGame(selector), useGame.getState(), useGame.setState()
```

- [ ] **Step 1: Store** `src/store/game.ts`:

```ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import * as E from '../engine/game';
import type { GameState, Pending } from '../engine/types';
import type { Amendment } from '../data/types';

export type Feedback = { pending: Pending; correct?: boolean; who: 0 | 1 };
type Store = {
  game: GameState | null; fastBot: boolean; feedback: Feedback | null;
  start: (name: string) => void; roll: () => void; answer: (correct: boolean) => void;
  acknowledge: (pick?: Amendment) => void; clearFeedback: () => void; quit: () => void; setFastBot: (v: boolean) => void;
};

export const useGame = create<Store>()(persist((set, get) => ({
  game: null, fastBot: false, feedback: null,
  start: name => set({ game: E.newGame(name.trim() || 'You', Date.now() >>> 0), feedback: null }),
  roll: () => { const g = get().game; if (g?.phase === 'roll') set({ game: E.roll(g) }); },
  answer: correct => {
    const g = get().game; if (!g?.pending) return;
    set({ game: E.answer(g, correct), feedback: { pending: g.pending, correct, who: g.current } });
  },
  acknowledge: pick => {
    const g = get().game; if (!g?.pending) return;
    set({ game: E.acknowledge(g, pick), feedback: { pending: g.pending, who: g.current } });
  },
  clearFeedback: () => set({ feedback: null }),
  quit: () => set({ game: null, feedback: null }),
  setFastBot: fastBot => set({ fastBot }),
}), { name: 'rights-rush-v1', partialize: s => ({ game: s.game, fastBot: s.fastBot }) }));
```

- [ ] **Step 2: Bot driver** `src/ui/useBotDriver.ts`. While the bot is the current player, wait and then act. The UI reveal durations for the bot are half of the human ones, and 0 with Fast Bot.

```ts
import { useEffect } from 'react';
import { useGame } from '../store/game';
import { botCorrect } from '../engine/bot';
import * as E from '../engine/game';

export function useBotDriver() {
  const game = useGame(s => s.game);
  const fastBot = useGame(s => s.fastBot);
  const feedback = useGame(s => s.feedback);
  useEffect(() => {
    if (!game || game.phase === 'over' || feedback || !game.players[game.current].isBot) return;
    const t = setTimeout(() => {
      const s = useGame.getState(); const g = s.game!;
      if (g.phase === 'roll') return s.roll();
      const k = g.pending!.kind;
      if (k === 'right' || k === 'whoSaid') {
        const [correct, g2] = botCorrect(g);
        useGame.setState({ game: E.answer(g2, correct), feedback: { pending: g.pending!, correct, who: g.current } });
      } else s.acknowledge();
    }, fastBot ? 0 : game.phase === 'roll' ? 500 : 900);
    return () => clearTimeout(t);
  }, [game, fastBot, feedback]);
}
```

- [ ] **Step 3: Keys** `src/ui/useKeys.ts`: one `keydown` listener. Space → `roll()` only if the current player is human and the phase is `roll`. F → toggle `document.documentElement.requestFullscreen()` / `document.exitFullscreen()`. Enter and 1–3 are handled by the focused modal buttons through native button focus. Ignore key events when `e.target` is an `<input>`.
- [ ] **Step 4: Verify** with `npm run build`. Expected: success (type-checks the store against the engine).
- [ ] **Step 5: Commit** with `feat: zustand store with persistence, bot driver, keyboard`.

---

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

### Task 13: Deploy + README

**Files:** Create `.github/workflows/deploy.yml`, `README.md`

- [ ] **Step 1: Workflow:**

```yaml
name: Deploy
on: { push: { branches: [main] }, workflow_dispatch: {} }
permissions: { contents: read, pages: write, id-token: write }
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: npm }
      - run: npm ci
      - run: npm test
      - run: npm run verify-quotes
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with: { path: dist }
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment: { name: github-pages, url: '${{ steps.d.outputs.page_url }}' }
    steps:
      - id: d
        uses: actions/deploy-pages@v4
```

- [ ] **Step 2: README** (engineering:documentation): what the game teaches, how to play, keys, presenter tips (Fast Bot, fullscreen), `npm i`, `npm run dev`, `npm test`, `npm run verify-quotes`, `npm run fetch-sources` (and that the cache is committed), how to edit content in `src/data`, and the deploy steps (create the GitHub repo `road-to-liberty`, push `main`, Settings → Pages → Source: GitHub Actions; site at `https://<user>.github.io/road-to-liberty/`).
- [ ] **Step 3: Verify** with `npm run build && npx vite preview`, and open `/road-to-liberty/` to check that assets load.
- [ ] **Step 4: Commit** with `chore: GitHub Pages deploy + README`.

---

### Task 14: Copy, accessibility, reviews, verification

- [ ] **Step 1:** Run **design:ux-copy** over every button, tooltip, label and card text; apply the edits; re-run `npm test && npm run verify-quotes`.
- [ ] **Step 2:** Run **design:accessibility-review** on the running app (contrast, focus order, keyboard-only full game, `aria-live`, reduced motion). Fix all issues.
- [ ] **Step 3:** Reviews in order: **code-review**, then **coderabbit:code-review**, then **engineering:code-review**. Fix every finding rated high or medium (use superpowers:receiving-code-review). Commit the fixes.
- [ ] **Step 4: Demo check.** With Playwright at 1280×720, play a full game keyboard-only with Fast Bot. Assert the end screen appears and the console has no errors. Record the elapsed time. With Fast Bot off and ~12s per human turn, the estimate should be ≤ 8 min.
- [ ] **Step 5:** Run **superpowers:verification-before-completion**: `npm test`, `npm run build`, `npm run verify-quotes` (docs/sources.md all ✅). Paste the outputs into the final summary (what was built, what was cut, how to deploy).
- [ ] **Step 6:** Update the memory file status, then commit with `chore: review fixes, a11y, final verification`.
