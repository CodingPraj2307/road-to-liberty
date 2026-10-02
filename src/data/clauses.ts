import type { Clause } from './types.ts';

// Order: three-fifths, slave trade, fugitive. Quotes copied from sources-cache/constitution.txt.
export const CLAUSES: Clause[] = [
  { title: 'The Three-Fifths Clause', source: 'constitution', section: 'Article I, Section 2',
    quote: 'Representatives and direct Taxes shall be apportioned among the several States which may be included within this Union, according to their respective Numbers, which shall be determined by adding to the whole Number of free Persons, including those bound to Service for a Term of Years, and excluding Indians not taxed, three fifths of all other Persons.',
    explain: 'Here, other Persons meant enslaved people. The Constitution never used the word slave, but this clause counted each enslaved person as three-fifths of a person when dividing up seats in the House and taxes. That gave slaveholding states more power in Congress, while enslaved people had no vote and no rights. The 14th Amendment replaced this rule in 1868.' },
  { title: 'The Slave Trade Clause', source: 'constitution', section: 'Article I, Section 9',
    quote: 'The Migration or Importation of such Persons as any of the States now existing shall think proper to admit, shall not be prohibited by the Congress prior to the Year one thousand eight hundred and eight, but a Tax or duty may be imposed on such Importation, not exceeding ten dollars for each Person.',
    explain: 'Here, Persons meant enslaved Africans brought into the country. This clause stopped Congress from banning the slave trade for twenty years, until 1808. Congress did ban bringing in enslaved people starting in 1808, but slavery itself went on inside the country until the 13th Amendment ended it in 1865.' },
  { title: 'The Fugitive Service Clause', source: 'constitution', section: 'Article IV, Section 2',
    quote: 'No Person held to Service or Labour in one State, under the Laws thereof, escaping into another, shall, in Consequence of any Law or Regulation therein, be discharged from such Service or Labour, but shall be delivered up on Claim of the Party to whom such Service or Labour may be due.',
    explain: 'Here, a Person held to Service or Labour meant an enslaved person. Under this clause, a person who escaped slavery into a free state was not free and could be captured and returned. Later laws, like the Fugitive Slave Act of 1850, made this even harsher. The 13th Amendment ended slavery in 1865.' },
];
