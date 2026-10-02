import { useEffect } from 'react';
import { useGame } from './store/game.ts';
import { useBotDriver } from './ui/useBotDriver.ts';
import { useKeys } from './ui/useKeys.ts';
import { Board } from './ui/Board.tsx';
import { Dice } from './ui/Dice.tsx';
import { Hands } from './ui/Hands.tsx';
import { Log } from './ui/Log.tsx';
import { QuestionModal } from './ui/QuestionModal.tsx';
import { CardReveal } from './ui/CardReveal.tsx';
import { Feedback } from './ui/Feedback.tsx';
import { useShownPending } from './ui/motion.ts';

export default function App() {
  useBotDriver();
  useKeys();
  const game = useGame(s => s.game);
  const pending = useShownPending();
  const feedback = useGame(s => s.feedback);
  const fastBot = useGame(s => s.fastBot);

  // ponytail: dev stand-in until the setup screen (Task 12) starts the game.
  useEffect(() => {
    const s = useGame.getState();
    if (!s.game) s.start('You');
  }, [game]);

  if (!game) return null;
  // Fast Bot skips the bot's cards entirely; its driver acts on them unseen.
  const showCard = pending && !feedback && !(fastBot && game.players[game.current].isBot);
  return (
    <div className="grid h-dvh grid-cols-[minmax(0,7fr)_minmax(0,3fr)] gap-4 overflow-hidden p-4">
      <main className="relative flex min-h-0 flex-col">
        <header className="mb-1 flex items-end justify-between gap-4 border-b-[5px] border-ink pb-1 shadow-[0_3px_0_var(--color-parchment),0_4px_0_var(--color-ink)]">
          <h1 className="font-display text-[2.6rem] leading-none text-crimson">Rights Rush</h1>
          <p className="pb-1 text-right leading-tight">Win: reach Ratified with <b>5 different</b> Amendments</p>
        </header>
        <Board />
        {/* Keyed by log length so every new card remounts with a fresh timer and shuffle. */}
        {showCard && (pending.kind === 'right' || pending.kind === 'whoSaid'
          ? <QuestionModal key={game.log.length} />
          : <CardReveal key={game.log.length} />)}
        <Feedback />
      </main>
      <aside className="flex min-h-0 flex-col gap-3">
        <Dice />
        <Hands />
        <Log />
      </aside>
    </div>
  );
}
