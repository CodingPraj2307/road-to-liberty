import { useEffect, useState, type ReactNode } from 'react';
import { useGame, type Feedback as Fb } from '../store/game.ts';
import { grievanceBlocker, ord } from '../engine/game.ts';
import { SCENARIOS } from '../data/scenarios.ts';
import { WHO_SAID } from '../data/whoSaid.ts';
import { FOUNDERS } from '../data/founders.ts';
import { AMENDMENTS } from '../data/amendments.ts';
import { sourceTitle } from '../data/sources.ts';
import type { GameState, Player } from '../engine/types.ts';
import { feedbackMs } from './motion.ts';
import { Dialog } from './QuestionModal.tsx';
import { Quote } from './CardReveal.tsx';
import { useEnter, useFocusOnMount } from './useKeys.ts';
import { PRIMARY } from './Setup.tsx';

/** `ms`: how long it stays up, or null until the player presses Continue. */
type Snap = { fb: Fb; before: GameState; after: GameState; ms: number | null };
type Outcome = { good: boolean; title: string; body?: ReactNode };

const subj = (p: Player) => (p.isBot ? p.name : 'You');
const poss = (p: Player) => (p.isBot ? `${p.name}'s` : 'Your');
const isQuestion = (fb: Fb) => fb.pending.kind === 'right' || fb.pending.kind === 'whoSaid';

/** What a GRIEVANCE or FOUNDER card did, read off the acting player before and after it. */
function outcome({ fb, before, after }: Snap): Outcome {
  const { kind, card } = fb.pending;
  const b = before.players[fb.who], a = after.players[fb.who], opp = after.players[1 - fb.who];
  const gained = a.hand.length > b.hand.length ? a.hand[a.hand.length - 1] : null;
  const checked = b.blockNextGain && !a.blockNextGain;
  const checkedOut: Outcome = { good: false, title: 'Checked!', body: "Madison's check cancelled this amendment." };

  if (kind === 'grievance') {
    const by = grievanceBlocker(b, card);
    if (by === 'shield') return { good: true, title: 'Shielded!', body: 'Federalist 55 blocked this grievance.' };
    if (by) return { good: true, title: 'Blocked!', body: `The ${ord(by)} Amendment blocked this grievance.` };
    return { good: false, title: 'Back 2 spaces', body: `${subj(b)} had no amendment to block it.` };
  }
  switch (FOUNDERS[card].effect) {
    case 'forward2': return { good: true, title: 'Forward 2 spaces' };
    case 'reroll': return { good: true, title: 'Roll again!' };
    case 'check': return { good: true, title: 'Check!', body: `${poss(opp)} next amendment is cancelled.` };
    case 'shield': return { good: true, title: 'Shield up', body: `${poss(b)} next grievance is blocked.` };
    case 'stealDuplicate':
      if (gained) return { good: true, title: `Took the ${ord(gained)} Amendment`, body: `${subj(b)} took it from ${subj(opp)}.` };
      return checked ? checkedOut : { good: true, title: 'Forward 1 space', body: 'No duplicates to take.' };
    case 'collectMissing':
      return gained ? { good: true, title: 'Collected!', body: `${subj(b)} collected the ${ord(gained)} Amendment.` } : checkedOut;
  }
}

/** Everything a RIGHT or WHO SAID IT? result card shows, in plain strings where a screen reader also needs them. */
function questionResult({ fb, before, after }: Snap) {
  const { kind, card } = fb.pending;
  const b = before.players[fb.who], a = after.players[fb.who];
  const verdict = fb.correct ? 'Correct!' : 'Wrong';
  if (kind === 'right') {
    const am = AMENDMENTS[SCENARIOS[card].amendment - 1];
    const gained = a.hand.length > b.hand.length;
    return {
      verdict, why: 'Why', explain: SCENARIOS[card].explain,
      answerText: `the ${ord(am.n)} Amendment, ${am.title}`,
      answer: <><b>{ord(am.n)} Amendment</b>: {am.title}</>,
      quote: { text: am.quote, cite: `${sourceTitle(am.source)}, ${am.section}` },
      effect: !fb.correct ? 'No amendment this time.'
        : gained ? `${subj(b)} collected the ${ord(am.n)} Amendment.` : "Checked! Madison's check cancelled this amendment.",
    };
  }
  const w = WHO_SAID[card];
  return {
    verdict, why: 'About the quote', explain: w.explain,
    answerText: sourceTitle(w.source),
    answer: <b>{sourceTitle(w.source)}</b>,
    quote: { text: w.quote, cite: `${sourceTitle(w.source)}, ${w.section}` },
    effect: fb.correct ? `${subj(b)} ${b.isBot ? 'moves' : 'move'} forward 1 space.` : 'No move this time.',
  };
}

/**
 * The result of a RIGHT or WHO SAID IT? answer, right or wrong: the answer, why it is right, and the verified text.
 * It waits for Continue (or Enter); the bot's result also continues on its own (see feedbackMs).
 */
function ResultCard({ snap, onContinue }: { snap: Snap; onContinue: () => void }) {
  const r = questionResult(snap);
  const player = snap.before.players[snap.fb.who];
  const good = !!snap.fb.correct;
  const button = useFocusOnMount<HTMLButtonElement>();
  useEnter(onContinue);
  return (
    <Dialog kind={snap.fb.pending.kind} whose={player.isBot ? `${player.name}'s answer` : 'Your answer'}
      title={r.verdict} titleClass={good ? 'text-navy' : 'text-crimson'}>
      <p className="text-[1.3rem] leading-snug"><b>The answer:</b> {r.answer}</p>
      <p className="mt-2 text-[1.15rem] leading-snug"><b>{r.why}:</b> {r.explain}</p>
      <div className="mt-3"><Quote text={r.quote.text} cite={r.quote.cite} /></div>
      <div className="mt-4 flex items-center gap-4">
        <p className={`flex-1 text-[1.15rem] font-bold leading-snug ${good ? 'text-navy' : 'text-crimson'}`}>{r.effect}</p>
        <button type="button" ref={button} onClick={onContinue} className={`shrink-0 ${PRIMARY}`}>Continue (Enter)</button>
      </div>
    </Dialog>
  );
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
      setSnap({ fb, before: prev.game, after: s.game, ms: feedbackMs(fb.pending, prev.game.players[fb.who].isBot) });
    }
  }), []);

  const live = snap && snap.fb === feedback ? snap : null;
  useEffect(() => {
    if (!live || live.ms === null) return;
    const t = setTimeout(clearFeedback, live.ms);
    return () => clearTimeout(t);
  }, [live, clearFeedback]);

  const question = live && isQuestion(live.fb) ? live : null;
  const o = live && !question && live.ms ? outcome(live) : null;
  const q = question && questionResult(question);
  return (
    <>
      {/* Always mounted, so screen readers announce each new result. */}
      <div role="status" className="pointer-events-none absolute inset-0 z-30 grid place-items-center p-6">
        {o && (
          <div className={`max-w-[46rem] rounded-md border-[3px] border-cream px-8 py-4 text-center text-cream shadow-[0_0_0_3px_var(--color-ink),0_8px_0_3px_var(--color-ink)] ${o.good ? 'bg-navy' : 'bg-crimson'}`}>
            <p className="font-display text-[2.4rem] leading-tight">{o.title}</p>
            {o.body && <div className="mt-1 text-[1.2rem]">{o.body}</div>}
          </div>
        )}
        {q && <p className="sr-only">{`${q.verdict} The answer is ${q.answerText}. ${q.effect}`}</p>}
      </div>
      {question && <ResultCard key={question.after.log.length} snap={question} onContinue={clearFeedback} />}
    </>
  );
}
