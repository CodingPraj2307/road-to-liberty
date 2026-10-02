import { describe, it, expect } from 'vitest';
import { quoteFound } from './quote';

describe('quoteFound', () => {
  it('matches across whitespace and quote/dash styles', () => {
    expect(quoteFound("give me liberty, or give me death!", "his voice ‘give me  liberty,\nor give me death!’")).toBe(true);
    expect(quoteFound('a — b', 'x a - b y')).toBe(true);
  });
  it('joins words hyphenated across a line break in the source', () => {
    expect(quoteFound('the Blessings of Liberty', 'the Bless-\nings of Liberty')).toBe(true);
  });
  it('is case-sensitive and rejects paraphrase', () => {
    expect(quoteFound('Give me liberty', 'give me liberty')).toBe(false);
    expect(quoteFound('give me freedom', 'give me liberty')).toBe(false);
  });
});
