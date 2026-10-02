import type { FounderCard } from './types.ts';

// Quotes copied from sources-cache/<source>.txt (checked by npm run verify-quotes).
export const FOUNDERS: FounderCard[] = [
  { source: 'henry', section: 'Speech to the Second Virginia Convention', speaker: 'Patrick Henry', effect: 'forward2',
    quote: 'give me liberty, or give me death!',
    explain: 'Henry rallied Virginia to defend freedom at any cost. His courage fires you up, so move forward 2 spaces.' },
  { source: 'declaration', section: 'Preamble', speaker: 'Thomas Jefferson', effect: 'forward2',
    quote: 'Life, Liberty and the pursuit of Happiness',
    explain: 'Jefferson named three rights that belong to everyone. Big ideas move people, so move forward 2 spaces.' },
  { source: 'common-sense', section: 'Thoughts on the Present State of American Affairs', speaker: 'Thomas Paine', effect: 'reroll',
    quote: 'O! receive the fugitive, and prepare in time an asylum for mankind.',
    explain: 'Paine said America could be a safe home for freedom. Take a fresh start and roll again.' },
  { source: 'fed51', section: 'Federalist No. 51', speaker: 'James Madison', effect: 'check',
    quote: 'Ambition must be made to counteract ambition',
    explain: 'Madison wanted each branch of government to keep the others in check. Cancel the next amendment your opponent would collect.' },
  { source: 'fed10', section: 'Federalist No. 10', speaker: 'James Madison', effect: 'stealDuplicate',
    quote: 'Liberty is to faction what air is to fire',
    explain: 'Madison worried that powerful groups could crush other people\'s rights. Take a duplicate amendment from your opponent, or move forward 1.' },
  { source: 'centinel1', section: 'Centinel No. 1', speaker: 'Centinel', effect: 'collectMissing',
    quote: 'All the blessings of liberty and the dearest privileges of freemen are now at stake',
    explain: 'This Antifederalist feared the Constitution left rights unprotected. Worries like his pushed leaders to add a Bill of Rights. Pick any missing amendment.' },
  { source: 'brutus1', section: 'Brutus No. 1', speaker: 'Brutus', effect: 'collectMissing',
    quote: 'In a republic, the manners, sentiments, and interests of the people should be similar.',
    explain: 'This Antifederalist doubted one big government could represent everyone. Worries like his pushed leaders to add a Bill of Rights. Pick any missing amendment.' },
  { source: 'fed55', section: 'Federalist No. 55', speaker: 'James Madison', effect: 'shield',
    quote: 'I am unable to conceive that the people of America, in their present temper, or under any circumstances which can speedily happen, will choose, and every second year repeat the choice of, sixty-five or a hundred men who would be disposed to form and pursue a scheme of tyranny or treachery.',
    explain: 'Madison trusted voters to pick honest leaders. That trust shields you, so your next grievance is blocked.' },
];
