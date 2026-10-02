import { useEffect, useState } from 'react';
import { useGame } from '../store/game.ts';

export const DICE_MS = 600;
export const STEP_MS = 150;

const reducedMotion = () =>
  typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Bot animations run at 2x speed, and not at all with Fast Bot. */
export function animMs(base: number, isBot: boolean): number {
  if (reducedMotion()) return 0;
  if (!isBot) return base;
  return useGame.getState().fastBot ? 0 : base / 2;
}

/** Board cell of a space: rows run left-to-right, then right-to-left (serpentine). */
export function cellOf(i: number) {
  const row = Math.floor(i / 6);
  return { row, col: row % 2 ? 5 - (i % 6) : i % 6 };
}

/** Bumps `id` each time a die is rolled; `bot` tells whose roll it was. */
export function useRollEvent() {
  const [ev, setEv] = useState<{ id: number; bot: boolean } | null>(null);
  useEffect(() => useGame.subscribe((s, prev) => {
    const p = prev.game;
    // In the roll phase the only game change that grows the log is roll().
    if (p?.phase === 'roll' && s.game && s.game.log.length > p.log.length)
      setEv(e => ({ id: (e?.id ?? 0) + 1, bot: p.players[p.current].isBot }));
  }), []);
  return ev;
}
