import { describe, it, expect } from 'vitest';
import { AMENDMENTS } from './amendments.ts';
import { GRIEVANCES } from './grievances.ts';
import { FOUNDERS } from './founders.ts';
import { WHO_SAID } from './whoSaid.ts';
import { SCENARIOS } from './scenarios.ts';
import { CLAUSES } from './clauses.ts';
import { SOURCES } from './sources.ts';

describe('content', () => {
  it('has the required counts', () => {
    expect(AMENDMENTS.map(a => a.n)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(CLAUSES).toHaveLength(3);
    expect(GRIEVANCES).toHaveLength(5);
    expect(FOUNDERS).toHaveLength(8);
    expect(WHO_SAID).toHaveLength(15);
    expect(SCENARIOS).toHaveLength(30);
  });
  it('has 3 scenarios per amendment, each with 3 distinct choices including the answer', () => {
    for (let n = 1; n <= 10; n++) expect(SCENARIOS.filter(s => s.amendment === n)).toHaveLength(3);
    for (const s of SCENARIOS) {
      expect(new Set(s.choices).size).toBe(3);
      expect(s.choices).toContain(s.amendment);
    }
  });
  it('Who Said It: choices distinct, include the answer, and cover all 10 sources', () => {
    for (const w of WHO_SAID) { expect(new Set(w.choices).size).toBe(3); expect(w.choices).toContain(w.source); }
    expect(new Set(WHO_SAID.map(w => w.source))).toEqual(new Set(SOURCES.map(s => s.id)));
  });
  it('uses every founder effect', () => {
    expect(new Set(FOUNDERS.map(f => f.effect)).size).toBe(6);
  });
  it('never puts quotation marks in kid-friendly text', () => {
    const kid = [...AMENDMENTS.map(a => a.summary), ...CLAUSES.map(c => c.explain), ...GRIEVANCES.map(g => g.explain),
                 ...FOUNDERS.map(f => f.explain), ...SCENARIOS.map(s => s.prompt)];
    for (const t of kid) {
      expect(t).not.toMatch(/["“”]/);
      expect(t.split(/\s+/).length).toBeLessThanOrEqual(25);
    }
  });
});
