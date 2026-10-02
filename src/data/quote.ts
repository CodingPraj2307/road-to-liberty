const base = (s: string) =>
  s.replace(/[‘’]/g, "'").replace(/[“”]/g, '"')
   .replace(/[–—]/g, '-').replace(/\s+/g, ' ').trim();

// Only the source gets line-break hyphens joined; quotes are matched as written.
export const normalizeSource = (s: string) => base(s.replace(/(\w)-[ \t]*\r?\n\s*(\w)/g, '$1$2'));
export const quoteFound = (quote: string, sourceText: string) => normalizeSource(sourceText).includes(base(quote));
