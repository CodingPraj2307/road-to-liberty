import { useEffect, useState, type ReactNode } from 'react';
import { useGame } from './store/game.ts';
import type { GameState } from './engine/types.ts';
import { useBotDriver } from './ui/useBotDriver.ts';
import { toggleFullscreen, useKeys } from './ui/useKeys.ts';
import { Board } from './ui/Board.tsx';
import { Dice } from './ui/Dice.tsx';
import { Hands } from './ui/Hands.tsx';
import { Log } from './ui/Log.tsx';
import { QuestionModal } from './ui/QuestionModal.tsx';
import { CardReveal } from './ui/CardReveal.tsx';
import { Feedback } from './ui/Feedback.tsx';
import { Setup, SECONDARY } from './ui/Setup.tsx';
import { EndScreen } from './ui/EndScreen.tsx';
import { cardDelayMs, useShownPending } from './ui/motion.ts';

/** How long the final board stays up after the winning move lands, before the recap. */
const END_HOLD_MS = 1500;

/** On every screen: full screen (same as F) and, while there is a game, Quit. `title` is off on the title screen. */
function Header({ title = true, inert, children }: { title?: boolean; inert?: boolean; children?: ReactNode }) {
  const hasGame = useGame(s => !!s.game);
  const quit = () => { if (confirm('Quit this game? It cannot be resumed.')) useGame.getState().quit(); };
  return (
    <header inert={inert} className={`flex items-end gap-4 pb-1 ${title ? 'mb-1 border-b-[5px] border-ink shadow-[0_3px_0_var(--color-parchment),0_4px_0_var(--color-ink)]' : ''}`}>
      {title && <h1 className="font-display text-[2.6rem] leading-none text-crimson">Rights Rush</h1>}
      <div className="ml-auto flex items-end gap-3">
        {children}
        <button type="button" onClick={toggleFullscreen} className={SECONDARY}>Full screen (F)</button>
        {hasGame && <button type="button" onClick={quit} className={SECONDARY}>Quit</button>}
      </div>
    </header>
  );
}

/** The board, dice, hands and log, with the card or feedback over the board. */
function Play() {
  useBotDriver();
  const game = useGame(s => s.game)!;
  const pending = useShownPending();
  const feedback = useGame(s => s.feedback);
  const fastBot = useGame(s => s.fastBot);
  // Fast Bot skips the bot's cards entirely; its driver acts on them unseen.
  const showCard = pending && !feedback && !(fastBot && game.players[game.current].isBot);
  // Keep Tab inside the card or feedback while either covers the board.
  const covered = !!showCard || !!feedback;
  return (
    <div className="flex h-dvh flex-col overflow-hidden p-4">
      <Header inert={covered}>
        <p className="pb-1 text-right leading-tight">Win: reach Ratified with <b>5 different</b> Amendments</p>
      </Header>
      <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,7fr)_minmax(0,3fr)] gap-4 pt-2">
        <main className="relative flex min-h-0 flex-col">
          <div inert={covered} className="flex min-h-0 flex-1 flex-col"><Board /></div>
          {/* Keyed by log length so every new card remounts with a fresh timer and shuffle. */}
          {showCard && (pending.kind === 'right' || pending.kind === 'whoSaid'
            ? <QuestionModal key={game.log.length} />
            : <CardReveal key={game.log.length} />)}
          <Feedback />
        </main>
        <aside inert={covered} className="flex min-h-0 flex-col gap-3">
          <Dice />
          <Hands />
          <Log />
        </aside>
      </div>
    </div>
  );
}

export default function App() {
  const game = useGame(s => s.game);
  const feedback = useGame(s => s.feedback);
  // A game saved in storage loads into the store, but waits on the title screen until Resume.
  const [playing, setPlaying] = useState(false);
  // The game the recap is for, set once the winning move has played out on the board.
  const [ended, setEnded] = useState<GameState | null>(null);
  useEffect(() => {
    if (!game || game.phase !== 'over' || feedback) return;
    const t = setTimeout(() => setEnded(game), cardDelayMs(game) + END_HOLD_MS);
    return () => clearTimeout(t);
  }, [game, feedback]);

  const screen = !game || !playing ? 'setup' : ended === game ? 'end' : 'play';
  useKeys(screen === 'play');

  if (screen === 'play') return <Play />;
  return (
    <div className="min-h-dvh p-4">
      <Header title={screen !== 'setup'} />
      {screen === 'setup' ? <Setup onPlay={() => setPlaying(true)} /> : <EndScreen />}
    </div>
  );
}
