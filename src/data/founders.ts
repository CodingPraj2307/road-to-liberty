import type { FounderCard } from './types.ts';

// Quotes copied from sources-cache/<source>.txt (checked by npm run verify-quotes).
// The last sentence of each explain is the card's power.
export const FOUNDERS: FounderCard[] = [
  { source: 'henry', section: 'Speech to the Second Virginia Convention', speaker: 'Patrick Henry', effect: 'forward2',
    quote: 'give me liberty, or give me death!',
    explain: 'In March 1775, Patrick Henry urged Virginia leaders to prepare their militia for war with Britain. He said petitions had failed and that living without freedom was worse than dying. Less than a month later, fighting began at Lexington and Concord. His courage fires you up, so move forward 2 spaces.' },
  { source: 'declaration', section: 'Preamble', speaker: 'Thomas Jefferson', effect: 'forward2',
    quote: 'Life, Liberty and the pursuit of Happiness',
    explain: 'In the Declaration of Independence in 1776, Thomas Jefferson wrote that all people are born with rights no government can take away, including life, liberty, and the pursuit of happiness. He said governments exist to protect those rights. Big ideas move people, so move forward 2 spaces.' },
  { source: 'common-sense', section: 'Thoughts on the Present State of American Affairs', speaker: 'Thomas Paine', effect: 'reroll',
    quote: 'O! receive the fugitive, and prepare in time an asylum for mankind.',
    explain: 'In Common Sense in 1776, Thomas Paine wrote that freedom was being chased out of the rest of the world. Here the fugitive is freedom itself, and an asylum is a safe place. He urged Americans to give it a home by declaring independence. Take a fresh start and roll again.' },
  { source: 'fed51', section: 'Federalist No. 51', speaker: 'James Madison', effect: 'check',
    quote: 'Ambition must be made to counteract ambition',
    explain: 'In Federalist 51, James Madison explained checks and balances. Congress, the President, and the courts each get tools to stop the others from grabbing too much power, so one branch\'s ambition blocks another\'s. Cancel the next amendment your opponent would collect.' },
  { source: 'fed10', section: 'Federalist No. 10', speaker: 'James Madison', effect: 'stealDuplicate',
    quote: 'Liberty is to faction what air is to fire',
    explain: 'In Federalist 10, Madison said factions, groups that work against other people\'s rights, grow from liberty the way fire needs air. Ending liberty to stop them would be worse than the problem, so a large republic should control their effects instead. Take a duplicate amendment from your opponent, or move forward 1.' },
  { source: 'centinel1', section: 'Centinel No. 1', speaker: 'Centinel', effect: 'collectMissing',
    quote: 'All the blessings of liberty and the dearest privileges of freemen are now at stake',
    explain: 'Centinel was Samuel Bryan of Pennsylvania, an Antifederalist writing in October 1787. He told readers to judge the new Constitution for themselves instead of trusting famous names, because their freedom was on the line. Worries like his pushed leaders to add a Bill of Rights. Pick any missing amendment.' },
  { source: 'brutus1', section: 'Brutus No. 1', speaker: 'Brutus', effect: 'collectMissing',
    quote: 'In a republic, the manners, sentiments, and interests of the people should be similar.',
    explain: 'Brutus, probably New York judge Robert Yates, argued in 1787 that one huge republic could not fairly represent people with such different ways of life, and its leaders might escape the people\'s control. Worries like his pushed leaders to add a Bill of Rights. Pick any missing amendment.' },
  { source: 'fed55', section: 'Federalist No. 55', speaker: 'James Madison', effect: 'shield',
    quote: 'I am unable to conceive that the people of America, in their present temper, or under any circumstances which can speedily happen, will choose, and every second year repeat the choice of, sixty-five or a hundred men who would be disposed to form and pursue a scheme of tyranny or treachery.',
    explain: 'Critics said a House of Representatives with only sixty-five members could become a small group of tyrants. In Federalist 55, Madison answered that American voters, who choose again every two years, would never keep electing people plotting tyranny. That trust shields you, so your next grievance is blocked.' },
];
