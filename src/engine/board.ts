import type { Era, Space, SpaceKind } from './types.ts';

const KINDS = (
  'start right founder whoSaid right grievance ' +
  'right grievance whoSaid right founder right ' +
  'unfinished right grievance unfinished founder unfinished ' +
  'right founder grievance whoSaid right founder ' +
  'right grievance right whoSaid right finish'
).split(' ') as SpaceKind[];

export const BOARD: Space[] = KINDS.map((kind, i) => ({ kind, era: (Math.floor(i / 6) + 1) as Era }));
export const FINISH = 29;
export const ERA4_START = 18;
export const clauseAt = (pos: number) => BOARD.slice(0, pos).filter(s => s.kind === 'unfinished').length;
