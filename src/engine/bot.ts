import { random } from './rng.ts';
import type { GameState } from './types.ts';

export const BOT_ACCURACY = 0.7;
export function botCorrect(s: GameState): [boolean, GameState] {
  const g = structuredClone(s);
  return [random(g) < BOT_ACCURACY, g];
}
