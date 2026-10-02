import { beforeEach, describe, expect, it } from 'vitest';
import { useGame } from './game.ts';
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
