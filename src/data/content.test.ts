import { describe, it, expect } from 'vitest';
import { AMENDMENTS } from './amendments.ts';
import { GRIEVANCES } from './grievances.ts';
import { FOUNDERS } from './founders.ts';
import { WHO_SAID } from './whoSaid.ts';
import { SCENARIOS } from './scenarios.ts';
import { CLAUSES } from './clauses.ts';
import { SOURCES } from './sources.ts';

const words = (t: string) => t.trim().split(/\s+/).length;

describe('content', () => {
  it('has the required counts', () => {
    expect(AMENDMENTS.map(a => a.n)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(CLAUSES).toHaveLength(3);
    expect(GRIEVANCES).toHaveLength(5);
    expect(FOUNDERS).toHaveLength(8);
    expect(WHO_SAID).toHaveLength(25);
    expect(SCENARIOS).toHaveLength(50);
  });
  it('has 5 scenarios per amendment, each with 3 distinct choices including the answer', () => {
    for (let n = 1; n <= 10; n++) expect(SCENARIOS.filter(s => s.amendment === n)).toHaveLength(5);
    for (const s of SCENARIOS) {
      expect(new Set(s.choices).size).toBe(3);
      expect(s.choices).toContain(s.amendment);
    }
  });
  it('rotates the correct choice through all three slots', () => {
    const slots = [0, 1, 2].map(i => SCENARIOS.filter(s => s.choices.indexOf(s.amendment) === i).length);
    for (const n of slots) expect(n).toBeGreaterThanOrEqual(15);
  });
  it('Who Said It: choices distinct, include the answer, and cover all 10 sources', () => {
    for (const w of WHO_SAID) { expect(new Set(w.choices).size).toBe(3); expect(w.choices).toContain(w.source); }
    expect(new Set(WHO_SAID.map(w => w.source))).toEqual(new Set(SOURCES.map(s => s.id)));
    expect(new Set(WHO_SAID.map(w => w.quote)).size).toBe(WHO_SAID.length);
  });
  it('uses every founder effect', () => {
    expect(new Set(FOUNDERS.map(f => f.effect)).size).toBe(6);
  });
  it('never puts quotation marks in kid-friendly text', () => {
    const kid = [...AMENDMENTS.flatMap(a => [a.summary, a.explain]), ...CLAUSES.map(c => c.explain), ...GRIEVANCES.map(g => g.explain),
                 ...FOUNDERS.map(f => f.explain), ...SCENARIOS.flatMap(s => [s.prompt, s.explain]), ...WHO_SAID.map(w => w.explain)];
    for (const t of kid) expect(t).not.toMatch(/["“”]/);
  });
  it('keeps summaries and prompts short', () => {
    for (const a of AMENDMENTS) expect(words(a.summary), a.summary).toBeLessThanOrEqual(25);
    for (const s of SCENARIOS) expect(words(s.prompt), s.prompt).toBeLessThanOrEqual(30);
  });
  it('gives every card a full explanation of 20 to 80 words', () => {
    const explains = [...AMENDMENTS, ...CLAUSES, ...GRIEVANCES, ...FOUNDERS, ...SCENARIOS, ...WHO_SAID].map(x => x.explain);
    for (const t of explains) {
      expect(words(t), t).toBeGreaterThanOrEqual(20);
      expect(words(t), t).toBeLessThanOrEqual(80);
    }
  });
  it('ends each founder explanation with the card power', () => {
    const power = { forward2: /move forward 2 spaces\.$/, reroll: /roll again\.$/, check: /your opponent would collect\.$/,
      stealDuplicate: /or move forward 1\.$/, collectMissing: /Pick any missing amendment\.$/, shield: /next grievance is blocked\.$/ };
    for (const f of FOUNDERS) expect(f.explain).toMatch(power[f.effect]);
  });
});
