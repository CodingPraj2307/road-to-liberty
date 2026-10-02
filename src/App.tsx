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
import { GameErrorBoundary } from './ui/ErrorBoundary.tsx';

/** How long the final board stays up after the winning move lands, before the recap. */
const END_HOLD_MS = 1500;

/**
 * On every screen: full screen (same as F) and, off the title screen, Quit. `title` is off on the title screen.
 * `inert` covers only the title and `children` while a card is up; the buttons stay usable so a class can always quit.
 */
function Header({ title = true, canQuit = false, inert, children }: { title?: boolean; canQuit?: boolean; inert?: boolean; children?: ReactNode }) {
  const quit = () => { if (confirm('Quit this game? You cannot resume it.')) useGame.getState().quit(); };
  return (
    <header className={`flex items-end gap-4 pb-1 ${title ? 'mb-1 border-b-[5px] border-ink shadow-[0_3px_0_var(--color-parchment),0_4px_0_var(--color-ink)]' : ''}`}>
      {title && <h1 inert={inert} className="font-display text-[2.6rem] leading-none text-crimson">Rights Rush</h1>}
      <div className="ml-auto flex items-end gap-3">
        {children && <div inert={inert}>{children}</div>}
        <button type="button" onClick={toggleFullscreen} className={SECONDARY}>Full screen (F)</button>
        {canQuit && <button type="button" onClick={quit} className={SECONDARY}>Quit</button>}
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
  // Keep Tab on the card (plus the header buttons) while a card or feedback covers the board.
  const covered = !!showCard || !!feedback;
  return (
    <div className="flex h-dvh flex-col overflow-hidden p-4">
      <Header canQuit inert={covered}>
        <p className="pb-1 text-right leading-tight">Win: reach Ratified with <b>5 different</b> Amendments</p>
      </Header>
      <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,7fr)_minmax(0,3fr)] grid-rows-[minmax(0,1fr)] gap-4 pt-2">
        <main className="relative flex min-h-0 flex-col">
          <div inert={covered} className="flex min-h-0 flex-1 flex-col"><Board /></div>
          {/* Keyed by log length so every new card remounts with a fresh timer and shuffle. */}
          {showCard && (pending.kind === 'right' || pending.kind === 'whoSaid'
            ? <QuestionModal key={game.log.length} />
            : <CardReveal key={game.log.length} />)}
          <Feedback />
        </main>
        {/* Only the Roll button is inert under a card; the log stays live so screen readers still hear each move. */}
        <aside className="flex min-h-0 flex-col gap-3">
          <div inert={covered}><Dice covered={covered} /></div>
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

  if (screen === 'play') return <GameErrorBoundary><Play /></GameErrorBoundary>;
  return (
    <div className="min-h-dvh p-4">
      <Header title={screen !== 'setup'} canQuit={screen !== 'setup'} />
      {screen === 'setup' ? <Setup onPlay={() => setPlaying(true)} /> : <EndScreen />}
    </div>
  );
}
