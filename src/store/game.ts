import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import * as E from '../engine/game.ts';
import type { GameState, Pending } from '../engine/types.ts';
import type { Amendment } from '../data/types.ts';
import { isValidGame } from './validate.ts';

export type Feedback = { pending: Pending; correct?: boolean; who: 0 | 1 };
type Store = {
  game: GameState | null; fastBot: boolean; feedback: Feedback | null;
  /** True while a token on the board is still walking to its space (set by the Board; not saved). */
  animating: boolean;
  start: (name: string) => void; roll: () => void; answer: (correct: boolean) => void;
  acknowledge: (pick?: Amendment) => void; clearFeedback: () => void; quit: () => void; setFastBot: (v: boolean) => void;
  setAnimating: (v: boolean) => void;
};

/** Loads a save into the store. A saved game that is damaged or from an incompatible build is dropped rather than crashing the board. */
export function mergeSave<S extends { game: GameState | null; fastBot: boolean }>(persisted: unknown, current: S): S {
  const p = (typeof persisted === 'object' && persisted !== null ? persisted : {}) as Record<string, unknown>;
  return {
    ...current,
    game: isValidGame(p.game) ? p.game : null,
    fastBot: typeof p.fastBot === 'boolean' ? p.fastBot : current.fastBot,
  };
}

const isQuestion = (p: Pending) => p.kind === 'right' || p.kind === 'whoSaid';

export const useGame = create<Store>()(persist((set, get) => ({
  game: null, fastBot: false, feedback: null, animating: false,
  start: name => set({ game: E.newGame(name.trim() || 'Player', Date.now() >>> 0), feedback: null }),
  roll: () => { const g = get().game; if (g?.phase === 'roll') set({ game: E.roll(g) }); },
  answer: correct => {
    const g = get().game; if (g?.phase !== 'resolve' || !g.pending || !isQuestion(g.pending)) return;
    set({ game: E.answer(g, correct), feedback: { pending: g.pending, correct, who: g.current } });
  },
  acknowledge: pick => {
    const g = get().game; if (g?.phase !== 'resolve' || !g.pending || isQuestion(g.pending)) return;
    set({ game: E.acknowledge(g, pick), feedback: { pending: g.pending, who: g.current } });
  },
  clearFeedback: () => set({ feedback: null }),
  quit: () => set({ game: null, feedback: null, animating: false }),
  setFastBot: fastBot => set({ fastBot }),
  setAnimating: animating => { if (get().animating !== animating) set({ animating }); },
}), {
  name: 'rights-rush-v1',
  version: 1,
  partialize: s => ({ game: s.game, fastBot: s.fastBot }),
  // Saves from before versioning (v0) have the same shape; merge() checks them like any other.
  migrate: persisted => persisted,
  merge: mergeSave,
}));
