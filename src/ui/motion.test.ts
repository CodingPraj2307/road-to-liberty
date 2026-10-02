import { afterEach, describe, expect, it } from 'vitest';
import { animMs, cardDelayMs, cellOf, readMs } from './motion.ts';
import { at } from '../engine/testUtils.ts';
import { useGame } from '../store/game.ts';

afterEach(() => useGame.setState({ fastBot: false }));

describe('motion', () => {
  it('lays the 30 spaces out as a serpentine', () => {
    expect(cellOf(0)).toEqual({ row: 0, col: 0 });
    expect(cellOf(5)).toEqual({ row: 0, col: 5 });
    expect(cellOf(6)).toEqual({ row: 1, col: 5 });
    expect(cellOf(11)).toEqual({ row: 1, col: 0 });
    expect(cellOf(12)).toEqual({ row: 2, col: 0 });
    expect(cellOf(29)).toEqual({ row: 4, col: 5 });
  });

  it('runs bot animations at 2x speed, and skips them with Fast Bot', () => {
    expect(animMs(600, false)).toBe(600);
    expect(animMs(600, true)).toBe(300);
    useGame.setState({ fastBot: true });
    expect(animMs(600, true)).toBe(0);
    expect(animMs(600, false)).toBe(600);
  });

  it('halves reading time for the bot and skips it with Fast Bot', () => {
    expect(readMs(3000, false)).toBe(3000);
    expect(readMs(3000, true)).toBe(1500);
    useGame.setState({ fastBot: true });
    expect(readMs(3000, true)).toBe(0);
    expect(readMs(3000, false)).toBe(3000);
  });

  it('waits for the die and every token step before showing a card', () => {
    const g = at(4, [], { kind: 'right', card: 0 });
    g.lastRoll = 4;
    expect(cardDelayMs(g)).toBe(600 + 4 * 150);
    g.current = 1;
    expect(cardDelayMs(g)).toBe(300 + 4 * 75);
    useGame.setState({ fastBot: true });
    expect(cardDelayMs(g)).toBe(0);
  });
});
