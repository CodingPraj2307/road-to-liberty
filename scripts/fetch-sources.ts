import { mkdirSync, writeFileSync } from 'node:fs';
import { extractText, getDocumentProxy } from 'unpdf';
import { SOURCES } from '../src/data/sources.ts';

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
