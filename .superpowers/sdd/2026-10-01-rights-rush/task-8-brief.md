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

