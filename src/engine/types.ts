import type { Amendment } from '../data/types.ts';

export type Era = 1 | 2 | 3 | 4 | 5;
export type SpaceKind = 'start' | 'right' | 'grievance' | 'founder' | 'whoSaid' | 'unfinished' | 'finish';
export interface Space { kind: SpaceKind; era: Era }
export interface Player { name: string; isBot: boolean; pos: number; hand: Amendment[]; blockNextGain: boolean; shielded: boolean }
export type Pending = { kind: 'right' | 'grievance' | 'founder' | 'whoSaid' | 'unfinished'; card: number };
export interface GameState {
  seed: number;
  players: [Player, Player];
  current: 0 | 1;
  phase: 'roll' | 'resolve' | 'over';
  lastRoll: number | null;
  pending: Pending | null;
  winner: 0 | 1 | null;
  grievancesDrawn: number[];
  unfinishedSeen: number[];
  log: string[];
}
