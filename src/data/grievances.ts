import type { Grievance } from './types.ts';

// Pairings checked against the Declaration text (spec: Grievance -> Right pairings).
const s = { source: 'declaration', section: 'List of grievances' } as const;
export const GRIEVANCES: Grievance[] = [
  { ...s, quote: 'For Quartering large bodies of armed troops among us', answers: [3],
    explain: 'The colonists hated housing British soldiers, so the Third Amendment bans forced quartering in peacetime.' },
  { ...s, quote: 'For depriving us in many cases, of the benefits of Trial by Jury', answers: [6, 7],
    explain: 'The king took away jury trials, so the Sixth and Seventh Amendments protect the right to a jury.' },
  { ...s, quote: 'For transporting us beyond Seas to be tried for pretended offences', answers: [6],
    explain: 'Colonists were shipped overseas for trial, so the Sixth Amendment promises a trial by a jury from the state and district where the crime happened.' },
  { ...s, quote: 'Our repeated Petitions have been answered only by repeated injury', answers: [1],
    explain: 'The king ignored the colonists when they asked for help, so the First Amendment protects the right to petition the government.' },
  { ...s, quote: 'For protecting them, by a mock Trial, from punishment for any Murders', answers: [6],
    explain: 'Soldiers got fake trials that let them avoid punishment, so the Sixth Amendment demands a speedy, public, and impartial trial.' },
];
