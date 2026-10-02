import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { useGame } from '../store/game.ts';
import { ord } from '../engine/game.ts';
import { SCENARIOS } from '../data/scenarios.ts';
import { WHO_SAID } from '../data/whoSaid.ts';
import { AMENDMENTS } from '../data/amendments.ts';
import { SOURCES } from '../data/sources.ts';
import type { SpaceKind } from '../engine/types.ts';
import { Icon } from './Board.tsx';
import { LABEL } from './motion.ts';

const TIME_S = 20;

/** The printed card that sits over the board. Focus moves into it when it opens. */
export function Dialog({ kind, whose, aside, muted = false, children }: {
  kind: SpaceKind; whose: string; aside?: ReactNode; muted?: boolean; children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const titleId = useId(), bodyId = useId();
  useEffect(() => {
    // An autoFocus button inside has already taken focus; otherwise focus the card itself.
    if (!ref.current?.contains(document.activeElement)) ref.current?.focus();
  }, []);
  return (
    <div className="absolute inset-0 z-20 grid place-items-center bg-ink/45 p-4">
      <div ref={ref} role="dialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={bodyId} tabIndex={-1}
        className={`flex max-h-full w-full max-w-[48rem] flex-col overflow-y-auto rounded-md border-[3px] px-7 pt-4 pb-5 outline-none ${
          muted ? 'border-ink/60 bg-parchment-light' : 'border-ink bg-cream shadow-[0_6px_0_var(--color-ink)]'}`}>
        <header className={`mb-3 flex items-end gap-3 pb-2 ${muted ? 'border-b-2 border-ink/50'
          : 'border-b-[5px] border-ink shadow-[0_3px_0_var(--color-cream),0_4px_0_var(--color-ink)]'}`}>
          <Icon kind={kind} className={`size-10 shrink-0 ${muted ? 'text-ink/70' : 'text-crimson'}`} />
          <h2 id={titleId} className="font-display text-[2.2rem] leading-none">{LABEL[kind]}</h2>
          <span className="ml-auto pb-0.5 text-right leading-tight">{whose}</span>
          {aside}
        </header>
        {/* Read out with the card's name, so a screen reader hears the card even when focus lands on its button. */}
        <div id={bodyId} className="contents">{children}</div>
      </div>
    </div>
  );
}

const CHOICE_BTN = 'flex w-full cursor-pointer items-center gap-4 rounded-md border-2 border-ink bg-parchment-light px-3 py-2.5 text-left text-[1.2rem] leading-snug shadow-[0_3px_0_var(--color-ink)] hover:bg-parchment active:translate-y-[2px] active:shadow-[0_1px_0_var(--color-ink)]';

/** A RIGHT or WHO SAID IT? question. The human gets 20 seconds; the bot's card shows while it "thinks". */
export function QuestionModal() {
  const game = useGame(s => s.game)!;
  const answer = useGame(s => s.answer);
  const { kind, card } = game.pending!;
  const isBot = game.players[game.current].isBot;

  const choices = kind === 'right'
    ? SCENARIOS[card].choices.map(a => ({
        correct: a === SCENARIOS[card].amendment,
        label: <><b>{ord(a)} Amendment</b>: {AMENDMENTS[a - 1].title}</>,
      }))
    : WHO_SAID[card].choices.map(id => ({
        correct: id === WHO_SAID[card].source,
        label: <b>{SOURCES.find(s => s.id === id)!.title}</b>,
      }));
  // Display order is shuffled once per card (Fisher-Yates); the parent remounts this component for each new card.
  const [order] = useState(() => {
    const o = [0, 1, 2];
    for (let i = 2; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [o[i], o[j]] = [o[j], o[i]]; }
    return o;
  });
  const [secs, setSecs] = useState(TIME_S);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    if (isBot) return;
    if (secs === 0) { answer(false); return; }
    const t = setTimeout(() => setSecs(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secs, isBot, answer]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
      const i = ['1', '2', '3'].indexOf(e.key);
      if (i >= 0) { e.preventDefault(); buttons.current[i]?.click(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const urgent = secs <= 5;
  const timer = !isBot && (
    <div className="flex shrink-0 flex-col items-end">
      <span aria-hidden="true" className={`font-display text-[2.2rem] leading-none tabular-nums ${urgent ? 'text-crimson' : ''}`}>{secs}</span>
      <span aria-live="assertive" className="sr-only">{urgent ? '5 seconds left' : secs <= 10 ? '10 seconds left' : ''}</span>
    </div>
  );

  return (
    <Dialog kind={kind} whose={isBot ? `${game.players[game.current].name}'s question` : 'Your question'} aside={timer}>
      {!isBot && (
        <div aria-hidden="true" className="-mt-2 mb-4 h-2.5 overflow-hidden rounded-full border border-ink/50 bg-parchment">
          <div className={`h-full transition-[width] duration-1000 ease-linear ${urgent ? 'bg-crimson' : 'bg-navy'}`}
            style={{ width: `${(secs / TIME_S) * 100}%` }} />
        </div>
      )}

      {kind === 'right'
        ? <p className="text-[1.45rem] leading-snug">{SCENARIOS[card].prompt}</p>
        : <>
            <p className="mb-1 font-bold">Which document is this from?</p>
            <blockquote className="border-l-4 border-crimson pl-4 text-[1.45rem] leading-snug italic">
              &ldquo;{WHO_SAID[card].quote}&rdquo;
            </blockquote>
          </>}

      {isBot ? (
        <p className="mt-5 font-display text-[1.6rem] text-crimson">Computer is thinking…</p>
      ) : (
        <ol className="mt-5 flex flex-col gap-3">
          {order.map((c, i) => (
            <li key={c}>
              <button type="button" ref={el => { buttons.current[i] = el; }} onClick={() => answer(choices[c].correct)} className={CHOICE_BTN}>
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-navy font-bold text-cream">{i + 1}</span>
                <span>{choices[c].label}</span>
              </button>
            </li>
          ))}
        </ol>
      )}
    </Dialog>
  );
}
