import { BOARD, FINISH, ERA4_START, clauseAt } from './board.ts';
import { random } from './rng.ts';
import { SCENARIOS } from '../data/scenarios.ts';
import { GRIEVANCES } from '../data/grievances.ts';
import { FOUNDERS } from '../data/founders.ts';
import { WHO_SAID } from '../data/whoSaid.ts';
import type { GameState, Player } from './types.ts';
import type { Amendment } from '../data/types.ts';

export const ALL: Amendment[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
export const distinct = (hand: Amendment[]) => new Set(hand).size;
const ORD = ['', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th'];
export const ord = (a: Amendment) => ORD[a];
const cur = (g: GameState) => g.players[g.current];
const opp = (g: GameState) => g.players[1 - g.current];
const DECK_SIZE = { right: SCENARIOS.length, grievance: GRIEVANCES.length, founder: FOUNDERS.length, whoSaid: WHO_SAID.length };

export function newGame(name: string, seed: number): GameState {
  const p = (name: string, isBot: boolean): Player => ({ name, isBot, pos: 0, hand: [], blockNextGain: false, shielded: false });
  return {
    seed, players: [p(name, false), p('Computer', true)], current: 0, phase: 'roll',
    lastRoll: null, pending: null, winner: null, grievancesDrawn: [], unfinishedSeen: [], log: [],
  };
}

function endTurn(g: GameState, extraTurn = false) {
  g.pending = null;
  if (g.winner !== null) { g.phase = 'over'; return; }
  g.phase = 'roll';
  if (!extraTurn) g.current = (1 - g.current) as 0 | 1;
}

function finish(g: GameState) {
  const p = cur(g);
  if (distinct(p.hand) >= 5) {
    g.winner = g.current;
    g.log.push(`${p.name} reached Bill of Rights Ratified and wins!`);
  } else {
    p.pos = ERA4_START;
    g.log.push(`${p.name} needs 5 different Amendments. Back to the start of Era 4!`);
  }
}

// Forced moves never resolve the space they end on; only FINISH is checked.
function moveBy(g: GameState, n: number) {
  const p = cur(g);
  p.pos = Math.max(0, Math.min(FINISH, p.pos + n));
  if (p.pos === FINISH) finish(g);
}

function gain(g: GameState, who: 0 | 1, a: Amendment) {
  const p = g.players[who];
  if (p.blockNextGain) {
    p.blockNextGain = false;
    g.log.push(`Checked! ${p.name} does not get the ${ord(a)} Amendment.`);
    return;
  }
  p.hand.push(a);
  g.log.push(`${p.name} collects the ${ord(a)} Amendment.`);
  if (distinct(p.hand) === 10) g.winner = who;
}

export function roll(s: GameState): GameState {
  if (s.phase !== 'roll') throw new Error('Not the roll phase');
  const g = structuredClone(s);
  const p = cur(g);
  const d = 1 + Math.floor(random(g) * 6);
  g.lastRoll = d;
  p.pos = Math.min(FINISH, p.pos + d);
  g.log.push(`${p.name} rolled a ${d}.`);
  if (p.pos === FINISH) { finish(g); endTurn(g); return g; }
  const kind = BOARD[p.pos].kind as 'right' | 'grievance' | 'founder' | 'whoSaid' | 'unfinished';
  g.pending = { kind, card: kind === 'unfinished' ? clauseAt(p.pos) : Math.floor(random(g) * DECK_SIZE[kind]) };
  g.phase = 'resolve';
  return g;
}

export function answer(s: GameState, correct: boolean): GameState {
  const pd = s.pending;
  if (s.phase !== 'resolve' || !pd || (pd.kind !== 'right' && pd.kind !== 'whoSaid')) throw new Error('No question pending');
  const g = structuredClone(s);
  if (pd.kind === 'right') {
    if (correct) gain(g, g.current, SCENARIOS[pd.card].amendment);
    else g.log.push(`${cur(g).name} missed it. The answer was the ${ord(SCENARIOS[pd.card].amendment)} Amendment.`);
  } else if (correct) {
    g.log.push(`${cur(g).name} knew who said it! Forward 1 space.`);
    moveBy(g, 1);
  } else {
    g.log.push(`${cur(g).name} guessed wrong on Who Said It.`);
  }
  endTurn(g);
  return g;
}

export function grievanceBlocker(p: Player, card: number): Amendment | 'shield' | null {
  const held = GRIEVANCES[card].answers.find(a => p.hand.includes(a));
  return held ?? (p.shielded ? 'shield' : null);
}

export function acknowledge(s: GameState, pick?: Amendment): GameState {
  const pd = s.pending;
  if (s.phase !== 'resolve' || !pd || pd.kind === 'right' || pd.kind === 'whoSaid') throw new Error('Nothing to acknowledge');
  const g = structuredClone(s);
  const p = cur(g);
  let extraTurn = false;

  if (pd.kind === 'unfinished') {
    if (!g.unfinishedSeen.includes(pd.card)) g.unfinishedSeen.push(pd.card);
  } else if (pd.kind === 'grievance') {
    if (!g.grievancesDrawn.includes(pd.card)) g.grievancesDrawn.push(pd.card);
    const by = grievanceBlocker(p, pd.card);
    if (by === 'shield') { p.shielded = false; g.log.push(`${p.name} was protected by Federalist 55.`); }
    else if (by) g.log.push(`Blocked! The ${ord(by)} Amendment fixed this grievance.`);
    else { g.log.push(`${p.name} has no amendment to block it. Back 2 spaces.`); moveBy(g, -2); }
  } else {
    const f = FOUNDERS[pd.card];
    g.log.push(`${p.name} drew ${f.speaker}.`);
    switch (f.effect) {
      case 'forward2': moveBy(g, 2); break;
      case 'reroll': extraTurn = true; break;
      case 'check': opp(g).blockNextGain = true; break;
      case 'shield': p.shielded = true; break;
      case 'stealDuplicate': {
        const o = opp(g);
        const dup = ALL.find(a => o.hand.filter(x => x === a).length >= 2);
        if (dup && p.blockNextGain) { p.blockNextGain = false; g.log.push(`Checked! ${p.name} cannot steal the ${ord(dup)} Amendment.`); }
        else if (dup) { o.hand.splice(o.hand.indexOf(dup), 1); gain(g, g.current, dup); }
        else moveBy(g, 1);
        break;
      }
      case 'collectMissing': {
        const missing = ALL.filter(a => !p.hand.includes(a));
        gain(g, g.current, pick && missing.includes(pick) ? pick : missing[0]);
        break;
      }
    }
  }
  endTurn(g, extraTurn);
  return g;
}
