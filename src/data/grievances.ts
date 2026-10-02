import type { Grievance } from './types.ts';

// Pairings checked against the Declaration text (spec: Grievance -> Right pairings).
const s = { source: 'declaration', section: 'List of grievances' } as const;
export const GRIEVANCES: Grievance[] = [
  { ...s, quote: 'For Quartering large bodies of armed troops among us', answers: [3],
    explain: 'British laws called Quartering Acts made colonists provide housing and supplies for British soldiers, and troops were stationed in towns like Boston. Colonists saw armed soldiers living among them as a threat. The Third Amendment answers this: no soldier may be quartered in any house in peacetime without the owner agreeing.' },
  { ...s, quote: 'For depriving us in many cases, of the benefits of Trial by Jury', answers: [6, 7],
    explain: 'Britain sent many colonial cases, like trade and smuggling cases, to special courts where a judge decided everything with no jury. A jury of ordinary neighbors was a key protection against unfair officials. The Sixth Amendment guarantees a jury in criminal trials, and the Seventh guarantees one in many lawsuits over money.' },
  { ...s, quote: 'For transporting us beyond Seas to be tried for pretended offences', answers: [6],
    explain: 'British leaders threatened to ship some colonists accused of crimes to England for trial, far from home, witnesses, and friends. Pretended offences means made-up charges. The Sixth Amendment fixes this by requiring a trial by an impartial jury of the state and district where the crime happened.' },
  { ...s, quote: 'Our repeated Petitions have been answered only by repeated injury', answers: [1],
    explain: 'The colonists asked the king again and again to fix their problems. In 1775 he would not even read their Olive Branch Petition and declared the colonies in rebellion. The First Amendment protects the right to petition the government for a redress of grievances, meaning to ask it to fix wrongs without being punished for asking.' },
  { ...s, quote: 'For protecting them, by a mock Trial, from punishment for any Murders', answers: [6],
    explain: 'A 1774 law let British officials accused of killing colonists in Massachusetts be tried in another colony or in England, where they would likely go free. Colonists called it the Murder Act. The Sixth Amendment demands a speedy and public trial by an impartial jury, so trials cannot be staged to protect the powerful.' },
];
