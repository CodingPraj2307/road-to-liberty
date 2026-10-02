export type SourceId =
  | 'henry' | 'common-sense' | 'declaration' | 'constitution' | 'bill-of-rights'
  | 'fed10' | 'fed51' | 'fed55' | 'brutus1' | 'centinel1';
export type Amendment = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
export type FounderEffect = 'forward2' | 'reroll' | 'check' | 'stealDuplicate' | 'collectMissing' | 'shield';

export interface Source { id: SourceId; title: string; url: string }
export interface Quoted { quote: string; source: SourceId; section: string }
/** `summary`: one short title-like line. `explain`: what it protects, why the founders wanted it, and a modern example. */
export interface AmendmentCard extends Quoted { n: Amendment; title: string; summary: string; explain: string }
export interface Clause extends Quoted { title: string; explain: string }
export interface Grievance extends Quoted { answers: Amendment[]; explain: string }
export interface FounderCard extends Quoted { speaker: string; effect: FounderEffect; explain: string }
/** `explain`: who wrote it, when, why, and what it means in plain words. */
export interface WhoSaid extends Quoted { choices: [SourceId, SourceId, SourceId]; explain: string }
/** `explain`: why this amendment protects the person, tied to its words, and why a tempting wrong choice does not fit. */
export interface Scenario { amendment: Amendment; prompt: string; choices: [Amendment, Amendment, Amendment]; source: 'bill-of-rights'; explain: string }
