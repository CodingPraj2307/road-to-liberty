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

