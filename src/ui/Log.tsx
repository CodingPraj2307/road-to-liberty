import { useGame } from '../store/game.ts';

export function Log() {
  const log = useGame(s => s.game!.log);
  const shown = log.slice(-12).reverse();
  return (
    <section aria-label="Game log" className="flex min-h-0 flex-1 flex-col rounded-md border-2 border-ink/40 bg-parchment-light px-3 py-2">
      <h2 className="font-display text-[1.35rem] leading-none">Game log</h2>
      <div aria-hidden="true" className="mt-1 h-1.5 border-t-[3px] border-b border-ink/70" />
      {/* Keys are absolute log indexes so a new line is inserted, not rewritten in place. */}
      <ol aria-live="polite" className="mt-1.5 min-h-0 flex-1 overflow-hidden leading-snug">
        {shown.length === 0 && <li>Press Space to roll the die.</li>}
        {shown.map((line, k) => (
          <li key={log.length - k} className={`border-b border-ink/15 py-0.5 ${k === 0 ? 'font-bold' : ''}`}>{line}</li>
        ))}
      </ol>
    </section>
  );
}
