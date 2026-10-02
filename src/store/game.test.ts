import { beforeEach, describe, expect, it } from 'vitest';
import { mergeSave as merge, useGame } from './game.ts';
import * as E from '../engine/game.ts';
import { at } from '../engine/testUtils.ts';

beforeEach(() => useGame.setState({ game: null, feedback: null }));

describe('store', () => {
  it('start() trims the name, defaulting to Player when blank', () => {
    useGame.getState().start('  Ana  ');
    expect(useGame.getState().game?.players[0].name).toBe('Ana');
    useGame.getState().start('   ');
    expect(useGame.getState().game?.players[0].name).toBe('Player');
  });

  it('roll() is a no-op unless phase is roll', () => {
    const g = E.roll(E.newGame('Ana', 1));
    expect(g.phase).toBe('resolve');
    useGame.setState({ game: g });
    useGame.getState().roll();
    expect(useGame.getState().game).toBe(g);
  });

  it('answer() records feedback and advances the game', () => {
    const pending = { kind: 'right', card: 0 } as const;
    useGame.setState({ game: at(1, [], pending) });
    useGame.getState().answer(false);
    const s = useGame.getState();
    expect(s.feedback).toEqual({ pending, correct: false, who: 0 });
    expect(s.game).toMatchObject({ phase: 'roll', current: 1, pending: null });
  });
});

describe('store guards', () => {
  it('answer() ignores a card that is not a question', () => {
    const g = at(1, [], { kind: 'grievance', card: 0 });
    useGame.setState({ game: g });
    useGame.getState().answer(true);
    expect(useGame.getState().game).toBe(g);
    expect(useGame.getState().feedback).toBeNull();
  });

  it('acknowledge() ignores a question, and both ignore the roll phase', () => {
    const q = at(1, [], { kind: 'whoSaid', card: 0 });
    useGame.setState({ game: q });
    useGame.getState().acknowledge();
    expect(useGame.getState().game).toBe(q);
    const r = E.newGame('Ana', 1);
    useGame.setState({ game: r });
    useGame.getState().answer(true);
    useGame.getState().acknowledge();
    expect(useGame.getState().game).toBe(r);
    expect(useGame.getState().feedback).toBeNull();
  });
});

describe('loading a save', () => {
  const current = useGame.getState();

  it('keeps a valid saved game and Fast Bot', () => {
    const game = JSON.parse(JSON.stringify(E.newGame('Ana', 1)));
    const s = merge({ game, fastBot: true }, current);
    expect(s.game).toEqual(game);
    expect(s.fastBot).toBe(true);
  });

  it('drops a damaged game but keeps the rest', () => {
    const game = JSON.parse(JSON.stringify(E.newGame('Ana', 1)));
    game.players[0].pos = 99;
    const s = merge({ game, fastBot: true }, current);
    expect(s.game).toBeNull();
    expect(s.fastBot).toBe(true);
    expect(typeof s.roll).toBe('function');
  });

  it('survives junk in storage', () => {
    for (const junk of [null, 'x', 7, { game: 'x', fastBot: 'yes' }]) {
      const s = merge(junk, current);
      expect(s.game).toBeNull();
      expect(s.fastBot).toBe(current.fastBot);
    }
  });
});
