import { describe, it, expect } from 'vitest';
import { newGame, roll, answer, acknowledge } from './game.ts';
import { botCorrect } from './bot.ts';

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
