### Task 9: Store, bot driver, keyboard

**Files:** Create `src/store/game.ts`, `src/ui/useBotDriver.ts`, `src/ui/useKeys.ts`

**Interfaces — Produces:**

```ts
export type Feedback = { pending: Pending; correct?: boolean; who: 0 | 1 };
interface Store {
  game: GameState | null; fastBot: boolean; feedback: Feedback | null;
  start(name: string): void; roll(): void; answer(correct: boolean): void;
  acknowledge(pick?: Amendment): void; clearFeedback(): void; quit(): void; setFastBot(v: boolean): void;
}
export const useGame; // Zustand hook: useGame(selector), useGame.getState(), useGame.setState()
```

- [ ] **Step 1: Store** `src/store/game.ts`:

```ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import * as E from '../engine/game';
import type { GameState, Pending } from '../engine/types';
import type { Amendment } from '../data/types';

export type Feedback = { pending: Pending; correct?: boolean; who: 0 | 1 };
type Store = {
  game: GameState | null; fastBot: boolean; feedback: Feedback | null;
  start: (name: string) => void; roll: () => void; answer: (correct: boolean) => void;
  acknowledge: (pick?: Amendment) => void; clearFeedback: () => void; quit: () => void; setFastBot: (v: boolean) => void;
};

export const useGame = create<Store>()(persist((set, get) => ({
  game: null, fastBot: false, feedback: null,
  start: name => set({ game: E.newGame(name.trim() || 'You', Date.now() >>> 0), feedback: null }),
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
```

- [ ] **Step 2: Bot driver** `src/ui/useBotDriver.ts`. While the bot is the current player, wait and then act. The UI reveal durations for the bot are half of the human ones, and 0 with Fast Bot.

```ts
import { useEffect } from 'react';
import { useGame } from '../store/game';
import { botCorrect } from '../engine/bot';
import * as E from '../engine/game';

export function useBotDriver() {
  const game = useGame(s => s.game);
  const fastBot = useGame(s => s.fastBot);
  const feedback = useGame(s => s.feedback);
  useEffect(() => {
    if (!game || game.phase === 'over' || feedback || !game.players[game.current].isBot) return;
    const t = setTimeout(() => {
      const s = useGame.getState(); const g = s.game!;
      if (g.phase === 'roll') return s.roll();
      const k = g.pending!.kind;
      if (k === 'right' || k === 'whoSaid') {
        const [correct, g2] = botCorrect(g);
        useGame.setState({ game: E.answer(g2, correct), feedback: { pending: g.pending!, correct, who: g.current } });
      } else s.acknowledge();
    }, fastBot ? 0 : game.phase === 'roll' ? 500 : 900);
    return () => clearTimeout(t);
  }, [game, fastBot, feedback]);
}
```

- [ ] **Step 3: Keys** `src/ui/useKeys.ts`: one `keydown` listener. Space → `roll()` only if the current player is human and the phase is `roll`. F → toggle `document.documentElement.requestFullscreen()` / `document.exitFullscreen()`. Enter and 1–3 are handled by the focused modal buttons through native button focus. Ignore key events when `e.target` is an `<input>`.
- [ ] **Step 4: Verify** with `npm run build`. Expected: success (type-checks the store against the engine).
- [ ] **Step 5: Commit** with `feat: zustand store with persistence, bot driver, keyboard`.

---

