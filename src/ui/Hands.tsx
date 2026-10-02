import { useGame } from '../store/game.ts';
import { ALL, distinct, ord } from '../engine/game.ts';

export function Hands() {
  const game = useGame(s => s.game)!;
  return (
    <div className="flex flex-col gap-3">
      {game.players.map((p, i) => {
        const fill = i === 0 ? 'bg-navy border-navy' : 'bg-crimson border-crimson';
        const active = game.current === i && game.phase !== 'over';
        return (
          <section key={i} aria-label={`${p.name}'s amendments`}
            className={`rounded-md border-2 bg-parchment-light px-3 py-2 ${active ? (i === 0 ? 'border-navy shadow-[inset_6px_0_0_var(--color-navy)]' : 'border-crimson shadow-[inset_6px_0_0_var(--color-crimson)]') : 'border-ink/40'}`}>
            <h2 className="flex items-center gap-2 text-lg font-bold leading-tight">
              <span aria-hidden="true" className={`size-4 border-2 ${fill} ${i === 0 ? 'rounded-full' : 'rounded-sm'}`} />
              <span className="truncate">{p.name}</span>
            </h2>
            <ol className="mt-1.5 flex justify-between" aria-label="Amendments held">
              {ALL.map(a => {
                const n = p.hand.filter(x => x === a).length;
                return (
                  <li key={a} className={`relative grid size-[1.95rem] place-items-center rounded-full border-2 font-bold leading-none tabular-nums ${
                    n ? `${fill} text-cream` : 'border-dashed border-ink/50 text-ink'}`}>
                    <span aria-hidden="true">{a}</span>
                    <span className="sr-only">{`${ord(a)} Amendment: ${n ? (n > 1 ? `held ${n} times` : 'held') : 'not held'}`}</span>
                    {n > 1 && (
                      <span aria-hidden="true" className="absolute -top-3 -right-2.5 z-10 rounded-full border border-ink bg-cream px-1 leading-none font-bold text-ink">
                        ×{n}
                      </span>
                    )}
                  </li>
                );
              })}
            </ol>
            <div className="mt-1.5 flex min-h-7 items-center gap-2">
              <span className="mr-auto">Different: <b className="tabular-nums">{distinct(p.hand)}/5</b></span>
              {p.shielded && <span className="rounded-full border-2 border-navy px-2 leading-tight font-bold text-navy">Shield</span>}
              {p.blockNextGain && <span className="rounded-full border-2 border-crimson px-2 leading-tight font-bold text-crimson">Checked</span>}
            </div>
          </section>
        );
      })}
    </div>
  );
}
