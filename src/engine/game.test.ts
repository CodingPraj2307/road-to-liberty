import { describe, it, expect } from 'vitest';
import { newGame, roll, answer, distinct } from './game.ts';
import { BOARD, FINISH, ERA4_START } from './board.ts';
import { SCENARIOS } from '../data/scenarios.ts';
import { at } from './testUtils.ts';

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
