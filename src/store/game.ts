import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import * as E from '../engine/game.ts';
import type { GameState, Pending } from '../engine/types.ts';
import type { Amendment } from '../data/types.ts';

export type Feedback = { pending: Pending; correct?: boolean; who: 0 | 1 };
type Store = {
  game: GameState | null; fastBot: boolean; feedback: Feedback | null;
  start: (name: string) => void; roll: () => void; answer: (correct: boolean) => void;
  acknowledge: (pick?: Amendment) => void; clearFeedback: () => void; quit: () => void; setFastBot: (v: boolean) => void;
};

export const useGame = create<Store>()(persist((set, get) => ({
  game: null, fastBot: false, feedback: null,
  start: name => set({ game: E.newGame(name.trim() || 'Player', Date.now() >>> 0), feedback: null }),
  roll: () => { const g = get().game; if (g?.phase === 'roll') set({ game: E.roll(g) }); },
  answer: correct => {
    const g = get().game; if (!g?.pending) return;
    set({ game: E.answer(g, correct), feedback: { pending: g.pending, correct, who: g.current } });
  },
  acknowledge: pick => {
    const g = get().game; if (!g?.pending) return;
    set({ game: E.acknowledge(g, pick), feedback: { pending: g.pending, who: g.current } });
  },
  clearFeedback: () => set({ feedback: null }),
  quit: () => set({ game: null, feedback: null }),
  setFastBot: fastBot => set({ fastBot }),
}), { name: 'rights-rush-v1', partialize: s => ({ game: s.game, fastBot: s.fastBot }) }));
