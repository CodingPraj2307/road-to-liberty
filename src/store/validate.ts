import { FINISH } from '../engine/board.ts';
import { SCENARIOS } from '../data/scenarios.ts';
import { GRIEVANCES } from '../data/grievances.ts';
import { FOUNDERS } from '../data/founders.ts';
import { WHO_SAID } from '../data/whoSaid.ts';
import { CLAUSES } from '../data/clauses.ts';
import type { GameState } from '../engine/types.ts';

const DECK_SIZE: Record<string, number> = {
  right: SCENARIOS.length, grievance: GRIEVANCES.length, founder: FOUNDERS.length,
  whoSaid: WHO_SAID.length, unfinished: CLAUSES.length,
};

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;
const isInt = (v: unknown, min: number, max: number) => Number.isInteger(v) && (v as number) >= min && (v as number) <= max;
const isIntList = (v: unknown, min: number, max: number) => Array.isArray(v) && v.every(x => isInt(x, min, max));

function isPlayer(p: unknown): boolean {
  return isObj(p) && typeof p.name === 'string' && typeof p.isBot === 'boolean' && isInt(p.pos, 0, FINISH)
    && isIntList(p.hand, 1, 10) && typeof p.blockNextGain === 'boolean' && typeof p.shielded === 'boolean';
}

/** True if a game loaded from storage has a shape the engine and UI can safely run. */
export function isValidGame(g: unknown): g is GameState {
  if (!isObj(g)) return false;
  const { players, phase, pending, winner } = g;
  if (!Array.isArray(players) || players.length !== 2 || !players.every(isPlayer)) return false;
  if (phase !== 'roll' && phase !== 'resolve' && phase !== 'over') return false;
  if (!isInt(g.current, 0, 1) || !Array.isArray(g.log) || !g.log.every(l => typeof l === 'string')) return false;
  if (!Number.isInteger(g.seed) || !(g.lastRoll === null || isInt(g.lastRoll, 1, 6))) return false;
  if (!isIntList(g.grievancesDrawn, 0, GRIEVANCES.length - 1) || !isIntList(g.unfinishedSeen, 0, CLAUSES.length - 1)) return false;
  if (phase === 'over' ? !isInt(winner, 0, 1) : winner !== null) return false;
  if (phase === 'resolve') {
    if (!isObj(pending) || typeof pending.kind !== 'string' || !Object.hasOwn(DECK_SIZE, pending.kind)) return false;
    return isInt(pending.card, 0, DECK_SIZE[pending.kind] - 1);
  }
  return pending === null;
}
