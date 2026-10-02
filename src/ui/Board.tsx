import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useGame } from '../store/game.ts';
import { BOARD } from '../engine/board.ts';
import type { GameState, SpaceKind } from '../engine/types.ts';
import { DICE_MS, LABEL, STEP_MS, animMs, cellOf, useRollEvent } from './motion.ts';

const ERAS = [
  { year: '1775', title: "Henry's Speech" },
  { year: '1776', title: 'Independence' },
  { year: '1787', title: 'The Constitution' },
  { year: '1787–88', title: 'The Great Debate' },
  { year: '1789–91', title: 'Bill of Rights' },
];
const ERA_BG = ['bg-era-1', 'bg-era-2', 'bg-era-3', 'bg-era-4', 'bg-era-5'];
const ERA_BORDER = ['border-era-1', 'border-era-2', 'border-era-3', 'border-era-4', 'border-era-5'];
const ERA_TEXT = ['text-era-1', 'text-era-2', 'text-era-3', 'text-era-4', 'text-era-5'];

const ICON: Record<SpaceKind, ReactNode> = {
  start: <path d="M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.6l-5.4 2.9 1.2-6-4.5-4.2 6.1-.7z" />,
  right: <><path d="M8 4h10v13a3 3 0 0 1-3 3H6a3 3 0 0 1 0-6h2z" /><path d="M8 4a2 2 0 0 0-4 0v1h4M11 9h4M11 13h4" /></>,
  grievance: <><path d="M3 18h18l-1.5-10-4.5 4-3-7-3 7-4.5-4z" /><path d="M3 21h18" /></>,
  founder: <><path d="M20 3C12 4 7 9 5 19c4-5 8-8 15-16z" /><path d="M5 19l-2 2M9 14h4" /></>,
  whoSaid: <><path d="M4 5h16v11h-9l-5 4v-4H4z" /><path d="M10.2 8.8a1.8 1.8 0 1 1 2.4 1.7c-.6.2-.6.7-.6 1.2M12 13.5v.2" /></>,
  unfinished: <><rect x="1.5" y="8.5" width="9" height="7" rx="3.5" /><rect x="13.5" y="8.5" width="9" height="7" rx="3.5" /><path d="M12 3.5v2.5M12 18v2.5M8.5 5l1.5 2M15.5 19l-1.5-2" /></>,
  finish: <><path d="M6 17v-6a6 6 0 0 1 12 0v6l2 2H4z" /><path d="M10 21a2 2 0 0 0 4 0M12 3v2" /></>,
};

export function Icon({ kind, className }: { kind: SpaceKind; className: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      {ICON[kind]}
    </svg>
  );
}

// The route line threads through every space centre in path order.
const ROUTE = BOARD.map((_, i) => { const { row, col } = cellOf(i); return `${col + 0.5},${row + 0.5}`; }).join(' ');

/**
 * One token's position as shown on screen: it walks one space at a time toward the real position.
 * Each token walks on its own clock, so one player's long walk never holds up the other's.
 */
function useShownPos(game: GameState, who: 0 | 1): number {
  const target = game.players[who].pos;
  const roll = useRollEvent();
  const seenRoll = useRef(roll?.id);
  const [shown, setShown] = useState(target);
  useEffect(() => {
    if (shown === target) return;
    const ms = animMs(STEP_MS, useGame.getState().game!.players[who].isBot);
    let wait = ms;
    // This player's roll moves the token once the die has landed.
    if (roll && roll.id !== seenRoll.current) {
      seenRoll.current = roll.id;
      if (roll.who === who) wait = animMs(DICE_MS, roll.bot);
    }
    const t = setTimeout(() => setShown(n => (ms ? n + Math.sign(target - n) : target)), wait);
    return () => clearTimeout(t);
  }, [shown, target, roll, who]);
  return shown;
}

/** Both tokens as shown, and the store's `animating` flag kept in step (the bot waits on it before rolling). */
function useShownPositions(game: GameState): [number, number] {
  const shown: [number, number] = [useShownPos(game, 0), useShownPos(game, 1)];
  const moving = shown[0] !== game.players[0].pos || shown[1] !== game.players[1].pos;
  const setAnimating = useGame(s => s.setAnimating);
  useEffect(() => setAnimating(moving), [moving, setAnimating]);
  useEffect(() => () => setAnimating(false), [setAnimating]);
  return shown;
}

export function Board() {
  const game = useGame(s => s.game)!;
  const shown = useShownPositions(game);

  return (
    // A size container, so icons scale with the board's height (cqh) and every row fits at 1280x720 whatever the font.
    <div className="grid min-h-0 flex-1 grid-cols-[7.75rem_minmax(0,1fr)] grid-rows-[minmax(0,1fr)] @container-size">
      <ol className="grid h-full min-h-0 grid-rows-5" aria-label="Eras">
        {ERAS.map((e, k) => (
          <li key={e.year} className="min-h-0 py-[5px]">
            <div className={`${ERA_BG[k]} flex h-full flex-col justify-center overflow-hidden rounded-l-md py-1 pr-2 pl-5 text-cream [clip-path:polygon(0_0,100%_0,100%_100%,0_100%,0.75rem_50%)]`}>
              <span className="font-display text-[1.5rem] leading-none whitespace-nowrap">{e.year}</span>
              <span className="mt-1 line-clamp-2 leading-tight">{e.title}</span>
            </div>
          </li>
        ))}
      </ol>

      <div className="relative h-full min-h-0">
        <svg viewBox="0 0 6 5" preserveAspectRatio="none" aria-hidden="true" className="absolute inset-0 h-full w-full">
          <polyline points={ROUTE} fill="none" stroke="var(--color-ink)" strokeWidth="5"
            strokeDasharray="2 7" strokeLinecap="round" vectorEffect="non-scaling-stroke" opacity="0.55" />
        </svg>

        <ol className="relative grid h-full min-h-0 grid-cols-6 grid-rows-5" aria-label="Board">
          {BOARD.map((s, i) => {
            const { row, col } = cellOf(i);
            const special = s.kind === 'start' || s.kind === 'finish';
            // The tokens are drawn aria-hidden, so the space itself says who is on it.
            const here = game.players.filter((_, p) => shown[p] === i).map(p => p.name);
            return (
              <li key={i} aria-label={`Space ${i}, Era ${s.era}, ${LABEL[s.kind]}${here.length ? `: ${here.join(' and ')} here` : ''}`}
                style={{ gridRow: row + 1, gridColumn: col + 1 }} className="min-h-0 p-[5px]">
                <div
                  className={`flex h-full min-h-0 flex-col items-center overflow-hidden rounded-md border-2 px-1 pt-0.5 pb-1 text-center shadow-[0_2px_0_color-mix(in_oklab,var(--color-ink)_35%,transparent)] ${
                    special
                      ? `${s.kind === 'start' ? 'bg-navy border-navy' : 'bg-crimson border-crimson'} text-cream`
                      : `${ERA_BORDER[s.era - 1]} border-t-[6px] text-ink`}`}
                  style={special ? undefined : { background: `color-mix(in oklab, var(--color-era-${s.era}) 14%, var(--color-parchment-light))` }}
                >
                  {!special && <span aria-hidden="true" className="self-start pl-0.5 font-bold leading-none tabular-nums">{i}</span>}
                  <Icon kind={s.kind} className={`my-auto shrink ${special ? 'size-[clamp(1rem,4cqh,2rem)]' : `size-[clamp(1.25rem,6cqh,2.25rem)] ${ERA_TEXT[s.era - 1]}`}`} />
                  <span className={`font-bold leading-[1.1] ${s.kind === 'finish' ? 'line-clamp-3 font-display text-[1.15rem] font-normal' : 'line-clamp-2'}`}>
                    {LABEL[s.kind]}
                  </span>
                </div>
              </li>
            );
          })}
        </ol>

        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          {game.players.map((p, i) => {
            const { row, col } = cellOf(shown[i]);
            const ms = animMs(STEP_MS, p.isBot);
            return (
              <div key={i} className="absolute top-0 left-0 h-1/5 w-1/6"
                style={{ transform: `translate(${col * 100}%, ${row * 100}%)`, transition: `transform ${ms}ms linear` }}>
                <span className={`absolute top-0.5 grid size-9 place-items-center border-[3px] border-cream font-display text-xl text-cream shadow-[0_3px_0_color-mix(in_oklab,var(--color-ink)_55%,transparent)] ${
                  i === 0 ? 'right-1 rounded-full bg-navy' : `${shown[0] === shown[1] ? 'right-[2.6rem]' : 'right-1'} rounded-md bg-crimson`} ${
                  game.current === i && game.phase !== 'over' ? 'ring-[3px] ring-ink' : ''}`}>
                  {p.name.charAt(0).toUpperCase()}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
