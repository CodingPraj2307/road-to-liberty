import { useEffect } from 'react';
import { useGame } from '../store/game.ts';
import { ALL, grievanceBlocker, ord } from '../engine/game.ts';
import { GRIEVANCES } from '../data/grievances.ts';
import { FOUNDERS } from '../data/founders.ts';
import { CLAUSES } from '../data/clauses.ts';
import { AMENDMENTS } from '../data/amendments.ts';
import { SOURCES } from '../data/sources.ts';
import type { FounderEffect, SourceId } from '../data/types.ts';
import { Dialog } from './QuestionModal.tsx';

const UNFINISHED_MS = 5000;

const EFFECT: Record<FounderEffect, string> = {
  forward2: 'Move forward 2 spaces.',
  reroll: 'Roll again.',
  check: "Your opponent's next gain is cancelled.",
  stealDuplicate: 'Take a duplicate amendment from your opponent. No duplicates? Move forward 1.',
  collectMissing: 'Collect any amendment you are missing.',
  shield: 'Your next grievance is blocked.',
};

const sourceTitle = (id: SourceId) => SOURCES.find(s => s.id === id)!.title;

/** Verified text in quotation marks, with where it comes from. */
function Quote({ text, cite, big = false }: { text: string; cite: string; big?: boolean }) {
  return (
    <figure>
      <blockquote className={`border-l-4 border-current pl-4 italic leading-snug ${big ? 'text-[1.4rem]' : ''}`}>&ldquo;{text}&rdquo;</blockquote>
      <figcaption className="mt-1 pl-5">{cite}</figcaption>
    </figure>
  );
}

const Summary = ({ text }: { text: string }) => <p className="mt-3"><b>Summary:</b> {text}</p>;

/** A GRIEVANCE, FOUNDER or UNFINISHED LIBERTY card. The bot's cards are shown without buttons; its driver acknowledges them. */
export function CardReveal() {
  const game = useGame(s => s.game)!;
  const acknowledge = useGame(s => s.acknowledge);
  const { kind, card } = game.pending!;
  const player = game.players[game.current];
  const whose = player.isBot ? `${player.name}'s card` : 'Your card';

  useEffect(() => {
    if (kind !== 'unfinished' || player.isBot) return;
    const t = setTimeout(() => acknowledge(), UNFINISHED_MS);
    return () => clearTimeout(t);
  }, [kind, player.isBot, acknowledge]);

  const cont = !player.isBot && (
    <button type="button" autoFocus onClick={() => acknowledge()}
      className="mt-5 cursor-pointer self-end rounded-md border-2 border-navy bg-navy px-5 py-2 text-lg font-bold text-cream shadow-[0_3px_0_var(--color-ink)] active:translate-y-[2px] active:shadow-[0_1px_0_var(--color-ink)]">
      Continue (Enter)
    </button>
  );

  if (kind === 'unfinished') {
    const c = CLAUSES[card];
    return (
      <Dialog kind={kind} whose={c.title} muted>
        <Quote text={c.quote} cite={`${sourceTitle(c.source)}, ${c.section}`} />
        <Summary text={c.explain} />
      </Dialog>
    );
  }

  if (kind === 'grievance') {
    const g = GRIEVANCES[card];
    const by = grievanceBlocker(player, card);
    const you = player.isBot ? player.name : 'you';
    return (
      <Dialog kind={kind} whose={whose}>
        <Quote big text={g.quote} cite={sourceTitle(g.source)} />
        <div className={`mt-3 rounded-md border-2 px-4 py-2 ${by ? 'border-navy' : 'border-crimson'}`}>
          {typeof by === 'number' ? <>
            <p className="mb-1 font-display text-[1.7rem] leading-tight text-navy">The Bill of Rights fixed this!</p>
            <Quote text={AMENDMENTS[by - 1].quote} cite={`${sourceTitle('bill-of-rights')}, ${ord(by)} Amendment`} />
          </> : by === 'shield'
            ? <p className="font-display text-[1.7rem] leading-tight text-navy">Federalist 55 protects {you}</p>
            : <p className="font-display text-[1.7rem] leading-tight text-crimson">No right to block it: back 2 spaces</p>}
        </div>
        <Summary text={g.explain} />
        {cont}
      </Dialog>
    );
  }

  const f = FOUNDERS[card];
  const missing = ALL.filter(a => !player.hand.includes(a));
  return (
    <Dialog kind={kind} whose={whose}>
      <p className="font-display text-[1.7rem] leading-none">{f.speaker}</p>
      <div className="mt-2"><Quote big text={f.quote} cite={sourceTitle(f.source)} /></div>
      <Summary text={f.explain} />
      <p className="mt-3 text-[1.25rem] font-bold text-crimson">{EFFECT[f.effect]}</p>
      {f.effect === 'collectMissing' && !player.isBot ? (
        <fieldset className="mt-3">
          <legend className="mb-2">Pick an amendment you are missing:</legend>
          <div className="flex justify-between gap-2">
            {ALL.map(a => {
              const can = missing.includes(a);
              return (
                <button key={a} type="button" disabled={!can} autoFocus={a === missing[0]} onClick={() => acknowledge(a)}
                  aria-label={`${ord(a)} Amendment${can ? '' : ' (already held)'}`}
                  className="grid size-12 cursor-pointer place-items-center rounded-full border-2 border-navy bg-navy text-lg font-bold text-cream shadow-[0_3px_0_var(--color-ink)] active:translate-y-[2px] disabled:cursor-not-allowed disabled:border-dashed disabled:border-ink/50 disabled:bg-transparent disabled:text-ink/60 disabled:shadow-none">
                  {a}
                </button>
              );
            })}
          </div>
        </fieldset>
      ) : cont}
    </Dialog>
  );
}
