import { describe, expect, it } from 'vitest';
import { isValidGame } from './validate.ts';
import * as E from '../engine/game.ts';
import { at } from '../engine/testUtils.ts';
import { SCENARIOS } from '../data/scenarios.ts';
import { CLAUSES } from '../data/clauses.ts';
import type { GameState } from '../engine/types.ts';

/** A JSON round-trip, like the save in localStorage, with `edit` applied to the copy. */
const saved = (g: GameState, edit: (g: any) => void = () => {}) => { const c = JSON.parse(JSON.stringify(g)); edit(c); return c; };

describe('isValidGame', () => {
  it('accepts real games in every phase', () => {
    const g = E.newGame('Ana', 1);
    expect(isValidGame(saved(g))).toBe(true);
    expect(isValidGame(saved(E.roll(g)))).toBe(true); // resolve, or over/roll after a lucky FINISH
    expect(isValidGame(saved(at(5, [1, 2], { kind: 'right', card: SCENARIOS.length - 1 })))).toBe(true);
    expect(isValidGame(saved(at(29, [1, 2, 3, 4, 5]), g => { g.phase = 'over'; g.winner = 0; }))).toBe(true);
    expect(isValidGame(saved(g, g => { g.seed = -123; }))).toBe(true);
  });

  it('rejects non-objects and missing fields', () => {
    for (const v of [null, undefined, 42, 'game', [], {}]) expect(isValidGame(v)).toBe(false);
    expect(isValidGame(saved(E.newGame('Ana', 1), g => { delete g.log; }))).toBe(false);
  });

  it('rejects an unknown phase', () => {
    expect(isValidGame(saved(E.newGame('Ana', 1), g => { g.phase = 'paused'; }))).toBe(false);
  });

  it('needs exactly 2 players, each with a hand array', () => {
    const g = E.newGame('Ana', 1);
    expect(isValidGame(saved(g, g => { g.players.pop(); }))).toBe(false);
    expect(isValidGame(saved(g, g => { g.players.push(g.players[0]); }))).toBe(false);
    expect(isValidGame(saved(g, g => { delete g.players[1].hand; }))).toBe(false);
    expect(isValidGame(saved(g, g => { g.players[0].hand = [11]; }))).toBe(false);
  });

  it('needs positions from 0 to 29', () => {
    const g = E.newGame('Ana', 1);
    expect(isValidGame(saved(g, g => { g.players[0].pos = 30; }))).toBe(false);
    expect(isValidGame(saved(g, g => { g.players[1].pos = -1; }))).toBe(false);
    expect(isValidGame(saved(g, g => { g.players[1].pos = 2.5; }))).toBe(false);
    expect(isValidGame(saved(g, g => { g.players[0].pos = 29; }))).toBe(true);
  });

  it('needs the pending card to exist in its deck', () => {
    const q = at(5, [], { kind: 'right', card: 0 });
    expect(isValidGame(saved(q, g => { g.pending.card = SCENARIOS.length; }))).toBe(false);
    expect(isValidGame(saved(q, g => { g.pending = { kind: 'unfinished', card: CLAUSES.length }; }))).toBe(false);
    expect(isValidGame(saved(q, g => { g.pending.kind = 'toString'; }))).toBe(false);
    expect(isValidGame(saved(q, g => { g.pending = null; }))).toBe(false); // resolve with nothing to resolve
    expect(isValidGame(saved(E.newGame('Ana', 1), g => { g.pending = { kind: 'right', card: 0 }; }))).toBe(false);
  });
});
