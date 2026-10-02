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

