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

