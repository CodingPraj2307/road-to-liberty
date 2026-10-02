import { newGame } from './game.ts';
import type { GameState, Pending } from './types.ts';
import type { Amendment } from '../data/types.ts';

export function at(pos: number, hand: Amendment[] = [], pending: Pending | null = null): GameState {
  const g = newGame('Ana', 7);
  g.players[0].pos = pos;
  g.players[0].hand = hand;
  if (pending) { g.pending = pending; g.phase = 'resolve'; }
  return g;
}
