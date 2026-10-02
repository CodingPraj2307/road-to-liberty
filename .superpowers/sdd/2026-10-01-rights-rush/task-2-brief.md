### Task 2: Content types, quote matcher, source cache

**Files:** Create `src/data/types.ts`, `src/data/sources.ts`, `src/data/quote.ts`, `src/data/quote.test.ts`, `scripts/fetch-sources.ts`, `sources-cache/*.txt`

**Interfaces — Produces:** all types below; `SOURCES: Source[]`; `quoteFound(quote, sourceText): boolean`.

- [ ] **Step 1: Types** `src/data/types.ts`:

```ts
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
```

- [ ] **Step 2: Sources** `src/data/sources.ts`: export `SOURCES: Source[]` with the 10 ids, titles and URLs, copied exactly from the spec table.

- [ ] **Step 3: Failing test** `src/data/quote.test.ts`:

```ts
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
```

Run `npx vitest run src/data/quote.test.ts`. Expected: FAIL (module not found).

- [ ] **Step 4: Implement** `src/data/quote.ts`:

```ts
const base = (s: string) =>
  s.replace(/[‘’]/g, "'").replace(/[“”]/g, '"')
   .replace(/[–—]/g, '-').replace(/\s+/g, ' ').trim();

// Only the source gets line-break hyphens joined; quotes are matched as written.
export const normalizeSource = (s: string) => base(s.replace(/(\w)-[ \t]*\r?\n\s*(\w)/g, '$1$2'));
export const quoteFound = (quote: string, sourceText: string) => normalizeSource(sourceText).includes(base(quote));
```

Run the test again. Expected: PASS.

- [ ] **Step 5: Fetch script** `scripts/fetch-sources.ts`:

```ts
import { mkdirSync, writeFileSync } from 'node:fs';
import { extractText, getDocumentProxy } from 'unpdf';
import { SOURCES } from '../src/data/sources';

const ENT: Record<string, string> = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', rsquo: '’', lsquo: '‘',
  rdquo: '”', ldquo: '“', mdash: '—', ndash: '–', hellip: '…', sect: '§',
};
const decode = (s: string) => s
  .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n))
  .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
  .replace(/&(\w+);/g, (m, n) => ENT[n] ?? m);
const htmlToText = (h: string) => decode(h
  .replace(/<(script|style|noscript)[\s\S]*?<\/\1>/gi, '')
  .replace(/<br\s*\/?>|<\/(p|div|h\d|li)>/gi, '\n')
  .replace(/<[^>]+>/g, ' '));

mkdirSync('sources-cache', { recursive: true });
for (const s of SOURCES) {
  const res = await fetch(s.url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  if (!res.ok) throw new Error(`${s.id}: HTTP ${res.status}`);
  const buf = new Uint8Array(await res.arrayBuffer());
  const text = s.url.endsWith('.pdf')
    ? (await extractText(await getDocumentProxy(buf), { mergePages: true })).text
    : htmlToText(new TextDecoder().decode(buf));
  writeFileSync(`sources-cache/${s.id}.txt`, text);
  console.log(`${s.id}: ${text.length} chars`);
}
```

- [ ] **Step 6: Run** `npm run fetch-sources`. Expected: 10 lines, each over 2,000 chars. Spot-check with `grep -c "Quartering" sources-cache/declaration.txt` (≥1) and `grep -c "give me death" sources-cache/henry.txt` (≥1). If a site returns 403, read the page with the in-app browser (`get_page_text`) and save the text into that cache file. Note this in the README.
- [ ] **Step 7: Commit** with `feat: content types, quote matcher, cached source texts`.

---

