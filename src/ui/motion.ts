import { useEffect, useState } from 'react';
import { useGame } from '../store/game.ts';
import type { GameState, Pending, SpaceKind } from '../engine/types.ts';

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

/** How long to show text: half as long for the bot, and not at all with Fast Bot. Reduced motion does not shorten reading time. */
export function readMs(base: number, isBot: boolean): number {
  if (!isBot) return base;
  return useGame.getState().fastBot ? 0 : base / 2;
}

/** How long the result of an answer or card stays up for the human (pass it through readMs for the bot). */
export function feedbackMs({ pending: { kind }, correct }: { pending: Pending; correct?: boolean }): number {
  if (kind === 'right' || kind === 'whoSaid') return correct ? 1000 : 3000;
  return kind === 'unfinished' ? 0 : 1500; // Unfinished Liberty was already on screen for 5s.
}

/** Time from a roll until its die has landed and the token has finished walking to the card's space. */
export function cardDelayMs(g: GameState): number {
  const isBot = g.players[g.current].isBot;
  return animMs(DICE_MS, isBot) + (g.lastRoll ?? 0) * animMs(STEP_MS, isBot);
}

/** The pending card, once the animations that led to it have finished; null until then. */
export function useShownPending(): Pending | null {
  const pending = useGame(s => s.game?.pending ?? null);
  const [shown, setShown] = useState<Pending | null>(null);
  useEffect(() => {
    if (!pending) return;
    const t = setTimeout(() => setShown(pending), cardDelayMs(useGame.getState().game!));
    return () => clearTimeout(t);
  }, [pending]);
  return shown === pending ? pending : null;
}

/** Display name of each kind of space, shared by the board and the cards. */
export const LABEL: Record<SpaceKind, string> = {
  start: 'Start', right: 'Right', grievance: 'Grievance', founder: 'Founder',
  whoSaid: 'Who Said It?', unfinished: 'Unfinished Liberty', finish: 'Bill of Rights Ratified',
};

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
