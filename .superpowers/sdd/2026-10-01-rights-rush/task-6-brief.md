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

