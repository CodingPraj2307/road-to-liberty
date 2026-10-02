import { describe, it, expect } from 'vitest';
import { acknowledge, answer, grievanceBlocker } from './game.ts';
import { at } from './testUtils.ts';
import { GRIEVANCES } from '../data/grievances.ts';
import { FOUNDERS } from '../data/founders.ts';
import type { FounderEffect, Amendment } from '../data/types.ts';

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
    const p = { ...at(0).players[0], hand: [3 as const] as Amendment[], shielded: true };
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
  it('forward2 from 28 with 5 different amendments reaches FINISH and wins', () => {
    const g = acknowledge(at(28, [1, 2, 3, 4, 5], { kind: 'founder', card: founder('forward2') }));
    expect([g.players[0].pos, g.winner, g.phase]).toEqual([29, 0, 'over']);
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
  it('stealDuplicate while Checked cancels the steal and keeps the opponent\'s card', () => {
    const s = at(2, [], { kind: 'founder', card: founder('stealDuplicate') });
    s.players[1].hand = [5, 5, 2, 2];
    s.players[0].blockNextGain = true;
    const g = acknowledge(s);
    expect(g.players[0].hand).toEqual([]);
    expect(g.players[0].blockNextGain).toBe(false);
    expect([...g.players[1].hand].sort()).toEqual([2, 2, 5, 5]);
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

describe('purity', () => {
  it('answer and acknowledge do not mutate their input', () => {
    const q = at(1, [], { kind: 'right', card: 0 });
    const q0 = structuredClone(q);
    answer(q, true);
    expect(q).toEqual(q0);
    const f = at(2, [], { kind: 'founder', card: founder('stealDuplicate') });
    f.players[1].hand = [5, 5];
    const f0 = structuredClone(f);
    acknowledge(f);
    expect(f).toEqual(f0);
  });
});
