import { useEffect, useState } from 'react';
import { useGame } from '../store/game.ts';
import { DICE_MS, animMs, useRollEvent } from './motion.ts';

// Pip slots in a 3x3 grid, numbered 0-8 left-to-right, top-to-bottom.
const PIPS: Record<number, number[]> = {
  1: [4], 2: [2, 6], 3: [2, 4, 6], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8],
};

export function Dice() {
  const game = useGame(s => s.game)!;
  const roll = useGame(s => s.roll);
  const ev = useRollEvent();
  const [face, setFace] = useState(1);
  const [settled, setSettled] = useState(0); // id of the last roll that finished tumbling
  const ms = ev ? animMs(DICE_MS, ev.bot) : 0;
  const tumbling = !!ev && ms > 0 && ev.id !== settled;

  useEffect(() => {
    // Once a roll has settled, a later `ms` change (the Fast Bot toggle) must not tumble it again.
    if (!ev || ev.id === settled) return;
    const iv = ms ? setInterval(() => setFace(1 + Math.floor(Math.random() * 6)), 90) : undefined;
    const to = setTimeout(() => setSettled(ev.id), ms);
    return () => { clearInterval(iv); clearTimeout(to); };
  }, [ev, ms, settled]);

  const player = game.players[game.current];
  const canRoll = game.phase === 'roll' && !player.isBot;
  const value = tumbling ? face : game.lastRoll;
  const status = game.phase === 'over' ? `${game.players[game.winner!].name} won!`
    : player.isBot ? `${player.name}'s turn` : 'Your turn';

  return (
    <section aria-label="Dice" className="flex items-center gap-4 rounded-md border-2 border-ink bg-parchment-light p-3">
      <div
        key={ev?.id}
        role="img"
        aria-label={tumbling ? 'Rolling' : value ? `Die shows ${value}` : 'Not rolled yet'}
        className={`grid size-[5.25rem] shrink-0 grid-cols-3 grid-rows-3 gap-1 rounded-xl border-[3px] border-ink bg-cream p-2.5 shadow-[0_4px_0_var(--color-ink)] ${tumbling ? 'animate-tumble' : ''}`}
        style={tumbling ? { animationDuration: `${ms}ms` } : undefined}
      >
        {value
          ? Array.from({ length: 9 }, (_, k) => (
              <span key={k} className={`m-auto rounded-full ${!PIPS[value].includes(k) ? '' : value === 1 ? 'size-5 bg-crimson' : 'size-3.5 bg-ink'}`} />
            ))
          : <span className="col-span-3 row-span-3 m-auto font-display text-4xl text-ink">?</span>}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <p className="font-display text-[1.5rem] leading-none">{status}</p>
        <button
          type="button"
          onClick={roll}
          disabled={!canRoll}
          className="cursor-pointer rounded-md border-2 border-navy bg-navy px-4 py-2 text-lg font-bold text-cream shadow-[0_3px_0_var(--color-ink)] active:translate-y-[2px] active:shadow-[0_1px_0_var(--color-ink)] disabled:cursor-not-allowed disabled:border-ink/40 disabled:bg-transparent disabled:text-ink disabled:shadow-none"
        >
          Roll (Space)
        </button>
      </div>
    </section>
  );
}
