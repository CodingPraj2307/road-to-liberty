export type SourceId =
  | 'henry' | 'common-sense' | 'declaration' | 'constitution' | 'bill-of-rights'
  | 'fed10' | 'fed51' | 'fed55' | 'brutus1' | 'centinel1';
export type Amendment = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
export type FounderEffect = 'forward2' | 'reroll' | 'check' | 'stealDuplicate' | 'collectMissing' | 'shield';

export interface Source { id: SourceId; title: string; url: string }
export interface Quoted { quote: string; source: SourceId; section: string }
export interface AmendmentCard extends Quoted { n: Amendment; title: string; summary: string }
export interface Clause extends Quoted { title: string; explain: string }
export interface Grievance extends Quoted { answers: Amendment[]; explain: string }
export interface FounderCard extends Quoted { speaker: string; effect: FounderEffect; explain: string }
export interface WhoSaid extends Quoted { choices: [SourceId, SourceId, SourceId] }
export interface Scenario { amendment: Amendment; prompt: string; choices: [Amendment, Amendment, Amendment]; source: 'bill-of-rights' }
