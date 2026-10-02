import { useState } from 'react';
import { useGame } from '../store/game.ts';

const ERAS = ['bg-era-1', 'bg-era-2', 'bg-era-3', 'bg-era-4', 'bg-era-5'];
export const PRIMARY = 'cursor-pointer rounded-md border-2 border-navy bg-navy px-5 py-2 text-lg font-bold text-cream shadow-[0_3px_0_var(--color-ink)] active:translate-y-[2px] active:shadow-[0_1px_0_var(--color-ink)]';
export const SECONDARY = 'cursor-pointer rounded-md border-2 border-ink bg-parchment-light px-4 py-1.5 font-bold shadow-[0_3px_0_var(--color-ink)] hover:bg-parchment active:translate-y-[2px] active:shadow-[0_1px_0_var(--color-ink)]';

/** Title screen: name, Fast Bot, and start (or resume a saved game). `onPlay` shows the board. */
export function Setup({ onPlay }: { onPlay: () => void }) {
  const saved = useGame(s => !!s.game && s.game.phase !== 'over');
  const fastBot = useGame(s => s.fastBot);
  const setFastBot = useGame(s => s.setFastBot);
  const [name, setName] = useState('');

  return (
    <main className="mx-auto flex w-full max-w-[52rem] flex-col items-center pt-6 text-center">
      <h1 className="font-display text-[6rem] leading-[0.9] text-crimson">Rights Rush</h1>
      <div aria-hidden="true" className="mt-3 flex h-2.5 w-full max-w-[26rem]">
        {ERAS.map(c => <span key={c} className={`flex-1 ${c}`} />)}
      </div>
      <p className="mt-5 text-[1.2rem] leading-snug">Roll the die (Space) and play your card. Answer Right cards to collect Amendments.</p>
      <p className="mt-1 text-[1.2rem] leading-snug">Reach Bill of Rights Ratified with <b>5 different</b> Amendments before the Computer to win.</p>

      <form className="mt-6 flex w-full max-w-[32rem] flex-col gap-4 rounded-md border-[3px] border-ink bg-cream px-7 py-5 text-left shadow-[0_6px_0_var(--color-ink)]"
        onSubmit={e => { e.preventDefault(); useGame.getState().start(name); onPlay(); }}>
        <label className="flex flex-col gap-1 font-bold">
          Your name
          <input value={name} onChange={e => setName(e.target.value)} maxLength={20} placeholder="Player" autoComplete="off"
            autoFocus={!saved} className="rounded-md border-2 border-ink bg-parchment-light px-3 py-1.5 text-[1.2rem] font-normal placeholder:text-ink/55" />
        </label>
        <label className="flex cursor-pointer items-center gap-3">
          <input type="checkbox" checked={fastBot} onChange={e => setFastBot(e.target.checked)} className="size-5 accent-navy" />
          <span><b>Fast Bot</b>: the Computer's turns play instantly</span>
        </label>
        <div className="flex flex-wrap items-center justify-end gap-3">
          {saved && (
            <button type="button" autoFocus onClick={onPlay} className={PRIMARY}>Resume game</button>
          )}
          <button type="submit" className={saved ? SECONDARY : PRIMARY}>{saved ? 'New game' : 'Start (Enter)'}</button>
        </div>
      </form>
    </main>
  );
}
