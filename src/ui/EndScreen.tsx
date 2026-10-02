import { useEffect, useRef, type ReactNode } from 'react';
import { useGame } from '../store/game.ts';
import { ALL, ord } from '../engine/game.ts';
import { GRIEVANCES } from '../data/grievances.ts';
import { CLAUSES } from '../data/clauses.ts';
import { AMENDMENTS } from '../data/amendments.ts';
import { Quote, Summary } from './CardReveal.tsx';
import { sourceTitle } from '../data/sources.ts';
import { Icon } from './Board.tsx';
import { PRIMARY } from './Setup.tsx';
import { FINISH } from '../engine/board.ts';

const FILL = ['bg-navy border-navy', 'bg-crimson border-crimson'];

function Section({ title, muted = false, children }: { title: string; muted?: boolean; children: ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className={`flex items-end gap-3 pb-1 font-display text-[2.2rem] leading-none ${muted ? 'border-b-2 border-ink/50 text-ink/85'
        : 'border-b-[4px] border-ink shadow-[0_3px_0_var(--color-parchment),0_4px_0_var(--color-ink)]'}`}>
        {muted && <Icon kind="unfinished" className="size-9 shrink-0 text-ink/70" />}
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

/** The recap after someone wins: who won, what each grievance was answered by, the unfinished clauses, and all ten amendments (each opens to its explanation and text). */
export function EndScreen() {
  const game = useGame(s => s.game)!;
  const quit = useGame(s => s.quit);
  const banner = useRef<HTMLHeadingElement>(null);
  // Start keyboard users at the top of the recap; nothing here acts on Enter until they move to a button.
  useEffect(() => { banner.current?.focus(); }, []);

  const winner = game.players[game.winner!];
  const unfinished = game.unfinishedSeen.length ? game.unfinishedSeen : CLAUSES.map((_, i) => i);

  return (
    <main className="mx-auto w-full max-w-[60rem] pb-12">
      <div className={`mt-6 rounded-md border-[3px] border-cream px-8 py-5 text-center text-cream shadow-[0_0_0_3px_var(--color-ink),0_8px_0_3px_var(--color-ink)] ${winner.isBot ? 'bg-crimson' : 'bg-navy'}`}>
        <h2 ref={banner} tabIndex={-1} className="font-display text-[4rem] leading-none outline-none">{winner.name} wins!</h2>
        <p className="mt-2 text-[1.2rem]">{winner.pos === FINISH ? 'Reached Bill of Rights Ratified first.' : 'Collected all 10 Amendments.'}</p>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-6">
        {game.players.map((p, i) => {
          const held = ALL.filter(a => p.hand.includes(a));
          return (
            <section key={i} aria-label={`${p.name}'s amendments`} className="rounded-md border-2 border-ink/40 bg-parchment-light px-4 py-3">
              <h3 className="text-[1.25rem] font-bold">{p.name}</h3>
              {held.length ? (
                <ol className="mt-2 flex flex-wrap gap-3" aria-label="Amendments held">
                  {held.map(a => (
                    <li key={a} title={AMENDMENTS[a - 1].title}
                      className={`grid size-12 place-items-center rounded-full border-2 text-[1.3rem] font-bold text-cream shadow-[0_0_0_2px_var(--color-parchment-light),0_0_0_4px_var(--color-ink)] ${FILL[i]}`}>
                      <span aria-hidden="true">{a}</span>
                      <span className="sr-only">{`${ord(a)} Amendment: ${AMENDMENTS[a - 1].title}`}</span>
                    </li>
                  ))}
                </ol>
              ) : <p className="mt-2">No amendments collected.</p>}
            </section>
          );
        })}
      </div>

      <Section title="Grievances → Rights">
        {game.grievancesDrawn.length ? (
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b-2 border-ink">
                <th scope="col" className="w-3/5 py-1 pr-4">Grievance ({sourceTitle('declaration')})</th>
                <th scope="col" className="py-1">Answered by</th>
              </tr>
            </thead>
            <tbody>
              {game.grievancesDrawn.map(i => (
                <tr key={i} className="border-b border-ink/30 align-top">
                  <td className="py-2 pr-4 italic">&ldquo;{GRIEVANCES[i].quote}&rdquo;</td>
                  <td className="py-2">
                    {GRIEVANCES[i].answers.map(a => (
                      <p key={a}><b>{ord(a)} Amendment</b>: {AMENDMENTS[a - 1].title}</p>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <p>No grievances were drawn this game.</p>}
      </Section>

      <Section title="Unfinished Liberty" muted>
        {!game.unfinishedSeen.length && <h3 className="mb-3 text-[1.25rem] font-bold">Clauses you didn't land on</h3>}
        <div className="flex flex-col gap-4">
          {unfinished.map(i => (
            <article key={i} className="rounded-md border-2 border-ink/50 bg-parchment-light px-5 py-4">
              <h3 className="mb-2 font-display text-[1.6rem] leading-none">{CLAUSES[i].title}</h3>
              <Quote text={CLAUSES[i].quote} cite={`${sourceTitle(CLAUSES[i].source)}, ${CLAUSES[i].section}`} />
              <Summary text={CLAUSES[i].explain} />
            </article>
          ))}
        </div>
      </Section>

      <Section title="Your Bill of Rights">
        <div className="flex flex-col gap-2">
          {AMENDMENTS.map(am => (
            <details key={am.n} className="group rounded-md border-2 border-ink/40 bg-cream open:border-ink">
              <summary className="flex cursor-pointer list-none items-start gap-4 px-4 py-3 [&::-webkit-details-marker]:hidden">
                <span aria-hidden="true" className="grid size-10 shrink-0 place-items-center rounded-full border-2 border-navy bg-navy font-bold text-cream">{am.n}</span>
                <span className="flex-1">
                  <b>{ord(am.n)} Amendment: {am.title}</b>
                  <span className="block"><b>Summary:</b> {am.summary}</span>
                </span>
                <span aria-hidden="true" className="pt-1 font-bold transition-transform group-open:rotate-90">▸</span>
              </summary>
              <div className="px-4 pb-4 pl-[4.5rem]">
                <p className="mb-3 leading-snug"><b>Why it matters:</b> {am.explain}</p>
                <Quote text={am.quote} cite={`${sourceTitle(am.source)}, Amendment ${am.n}`} />
              </div>
            </details>
          ))}
        </div>
      </Section>

      <div className="mt-10 flex justify-center">
        <button type="button" onClick={quit} className={PRIMARY}>Play again</button>
      </div>
    </main>
  );
}
