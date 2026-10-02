import { useEffect, useState, type ReactNode } from 'react';
import { useGame, type Feedback as Fb } from '../store/game.ts';
import { grievanceBlocker, ord } from '../engine/game.ts';
import { SCENARIOS } from '../data/scenarios.ts';
import { WHO_SAID } from '../data/whoSaid.ts';
import { FOUNDERS } from '../data/founders.ts';
import { AMENDMENTS } from '../data/amendments.ts';
import { SOURCES } from '../data/sources.ts';
import type { GameState, Player } from '../engine/types.ts';
import { readMs } from './motion.ts';

type Snap = { fb: Fb; before: GameState; after: GameState; ms: number };
type Outcome = { good: boolean; title: string; body?: ReactNode };

const subj = (p: Player) => (p.isBot ? p.name : 'You');
const poss = (p: Player) => (p.isBot ? `${p.name}'s` : 'Your');

/** How long each result stays up for the human; the bot gets half, and none with Fast Bot. */
function baseMs({ pending: { kind }, correct }: Fb) {
  if (kind === 'right') return correct ? 1000 : 3000;
  if (kind === 'whoSaid') return correct ? 1000 : 1500;
  return kind === 'unfinished' ? 0 : 1500;
}

/** What happened, read off the acting player before and after the action. */
function outcome({ fb, before, after }: Snap): Outcome {
  const { kind, card } = fb.pending;
  const b = before.players[fb.who], a = after.players[fb.who], opp = after.players[1 - fb.who];
  const gained = a.hand.length > b.hand.length ? a.hand[a.hand.length - 1] : null;
  const checked = b.blockNextGain && !a.blockNextGain;
  const checkedOut: Outcome = { good: false, title: 'Checked!', body: "Madison's check cancelled this amendment." };

  if (kind === 'right') {
    if (!fb.correct) {
      const am = AMENDMENTS[SCENARIOS[card].amendment - 1];
      return {
        good: false, title: `The answer was the ${ord(am.n)} Amendment`,
        body: <figure className="mt-2 text-left">
          <blockquote className="border-l-4 border-cream pl-4 italic leading-snug">&ldquo;{am.quote}&rdquo;</blockquote>
          <figcaption className="mt-1 pl-5">Bill of Rights, {am.section}</figcaption>
        </figure>,
      };
    }
    return gained ? { good: true, title: 'Collected!', body: `${subj(b)} collected the ${ord(gained)} Amendment.` } : checkedOut;
  }
  if (kind === 'whoSaid') {
    const src = `It's from ${SOURCES.find(s => s.id === WHO_SAID[card].source)!.title}.`;
    return fb.correct ? { good: true, title: 'Correct! Forward 1', body: src } : { good: false, title: 'Not this time', body: src };
  }
  if (kind === 'grievance') {
    const by = grievanceBlocker(b, card);
    if (by === 'shield') return { good: true, title: 'Shielded!', body: 'Federalist 55 blocked this grievance.' };
    if (by) return { good: true, title: 'Blocked!', body: `The ${ord(by)} Amendment fixed this.` };
    return { good: false, title: 'Back 2 spaces', body: `${subj(b)} had no right to block it.` };
  }
  switch (FOUNDERS[card].effect) {
    case 'forward2': return { good: true, title: 'Forward 2 spaces' };
    case 'reroll': return { good: true, title: 'Roll again!' };
    case 'check': return { good: true, title: 'Check!', body: `${poss(opp)} next gain is cancelled.` };
    case 'shield': return { good: true, title: 'Shield up', body: `${poss(b)} next grievance is blocked.` };
    case 'stealDuplicate':
      if (gained) return { good: true, title: `Took the ${ord(gained)} Amendment`, body: `${subj(b)} took it from ${subj(opp)}.` };
      return checked ? checkedOut : { good: true, title: 'Forward 1 space', body: 'No duplicates to take.' };
    case 'collectMissing':
      return gained ? { good: true, title: 'Collected!', body: `${subj(b)} collected the ${ord(gained)} Amendment.` } : checkedOut;
  }
}

/** Shows the result of the last answer or card, then clears it so play (and the bot driver) can go on. */
export function Feedback() {
  const feedback = useGame(s => s.feedback);
  const clearFeedback = useGame(s => s.clearFeedback);
  const [snap, setSnap] = useState<Snap | null>(null);

  // The store sets feedback and the new game together, so `prev.game` is the state the action started from.
  useEffect(() => useGame.subscribe((s, prev) => {
    if (s.feedback && s.feedback !== prev.feedback && prev.game && s.game) {
      const fb = s.feedback;
      setSnap({ fb, before: prev.game, after: s.game, ms: readMs(baseMs(fb), prev.game.players[fb.who].isBot) });
    }
  }), []);

  const live = snap && snap.fb === feedback ? snap : null;
  useEffect(() => {
    if (!live) return;
    const t = setTimeout(clearFeedback, live.ms);
    return () => clearTimeout(t);
  }, [live, clearFeedback]);

  const o = live && live.ms > 0 ? outcome(live) : null;
  return (
    <div role="status" className="pointer-events-none absolute inset-0 z-30 grid place-items-center p-6">
      {o && (
        <div className={`max-w-[46rem] rounded-md border-[3px] border-cream px-8 py-4 text-center text-cream shadow-[0_0_0_3px_var(--color-ink),0_8px_0_3px_var(--color-ink)] ${o.good ? 'bg-navy' : 'bg-crimson'}`}>
          <p className="font-display text-[2.4rem] leading-tight">{o.title}</p>
          {o.body && <div className="mt-1 text-[1.2rem]">{o.body}</div>}
        </div>
      )}
    </div>
  );
}
