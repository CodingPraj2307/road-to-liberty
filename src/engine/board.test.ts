import { describe, it, expect } from 'vitest';
import { BOARD, FINISH, ERA4_START, clauseAt } from './board.ts';
import { random } from './rng.ts';

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
