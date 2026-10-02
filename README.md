# Rights Rush

A board game for 8th graders about how the Bill of Rights came to be. You race a computer player across 30 spaces, from Patrick Henry in 1775 to ratification in 1791. Play it at https://codingpraj2307.github.io/road-to-liberty/.

## What it teaches

- **The ten amendments.** On a Right space you read a real-life scenario and pick which amendment protects it. Right answers earn that amendment.
- **Why the Bill of Rights exists.** Grievance spaces use complaints from the Declaration of Independence. An amendment that answers the grievance blocks it.
- **Who said what.** Founder cards and Who Said It? questions use words from Henry, Paine, Jefferson, Madison, Brutus and Centinel.
- **What stayed unfinished.** Unfinished Liberty spaces show Constitution clauses on slavery, in plain words. The end screen lists the ones you landed on.

The game is purely educational. It takes no side.

## How to play

1. Roll, move, and resolve the space you land on. Each question has a 20 second timer.
2. Reach the FINISH with at least 5 different amendments to win. With fewer, you go back to Era 4. Collecting all 10 amendments wins on the spot.
3. The end screen shows both players' amendments, the grievances you drew and the amendments that answer them, and all 10 amendments with their exact text.

| Key | Action |
|---|---|
| Space | Roll |
| Enter | Confirm / continue |
| 1, 2, 3 | Choose an answer |
| F | Fullscreen |

## Presenter tips

- A full game takes about 8 minutes.
- Press **F** for fullscreen. The game is built for a 1280x720 projector.
- Turn on **Fast Bot** to skip the computer player's animations and reveals. Its moves still show in the log.
- The computer answers correctly 70% of the time, so the game stays close.

## Develop

```bash
npm i
npm run dev            # local dev server
npm test               # engine, data and pacing tests
npm run verify-quotes  # check every quote against the sources
npm run fetch-sources  # re-download the source texts
```

`sources-cache/` holds the source texts and is committed, so you only need `fetch-sources` to refresh it. After a refresh, run `verify-quotes` again.

### Editing content

All game content lives in `src/data/`:

| File | Content |
|---|---|
| `amendments.ts` | The 10 amendments: summary, explanation and verified text |
| `scenarios.ts` | Right-space scenarios with explanations, 5 per amendment |
| `grievances.ts` | Grievance cards and the amendments that answer them |
| `founders.ts` | Founder cards and their effects |
| `whoSaid.ts` | Who Said It? questions with explanations |
| `clauses.ts` | Unfinished Liberty clauses |
| `sources.ts` | The 10 allowed sources |

Every item has a `source` id. Every `quote` must be an unbroken substring of `sources-cache/<source>.txt`, with no ellipses. `npm run verify-quotes` checks this, fails if any quote is not found, and rewrites `docs/sources.md`. CI runs it too, so a bad quote blocks the deploy. Kid-friendly text goes in `summary` or `explain` (about 35–70 words, 8th-grade level; the content test allows 20–80) and is never shown in quotation marks.

## Deploy

The site is served from GitHub Pages at `/road-to-liberty/` (set as the Vite `base`).

1. Create the GitHub repo `road-to-liberty` (https://github.com/CodingPraj2307/road-to-liberty).
2. Push `main` to it.
3. In the repo, go to Settings → Pages → Source and choose **GitHub Actions**.
4. The `Deploy` workflow runs on every push to `main` and can be started by hand from the Actions tab (`workflow_dispatch`). It runs tests, `verify-quotes` and the build, then publishes `dist/`.

## Sources

Only these 10 sources are used. Text is cached in `sources-cache/`, and `docs/sources.md` lists every quote with its verification result.

| id | Document |
|---|---|
| henry | [Patrick Henry, "Give Me Liberty" (1775)](https://www.gilderlehrman.org/sites/default/files/2024-01/Speeches.pdf) |
| common-sense | [Thomas Paine, Common Sense (1776)](https://billofrightsinstitute.org/primary-sources/common-sense/) |
| declaration | [Declaration of Independence](https://www.archives.gov/founding-docs/declaration-transcript) |
| constitution | [Constitution](https://constitutioncenter.org/the-constitution/full-text) |
| bill-of-rights | [Bill of Rights](https://www.archives.gov/founding-docs/bill-of-rights-transcript) |
| fed10 | [Federalist 10](https://avalon.law.yale.edu/18th_century/fed10.asp) |
| fed51 | [Federalist 51](https://constitutioncenter.org/the-constitution/historic-document-library/detail/james-madison-federalist-no-51-1788) |
| fed55 | [Federalist 55](https://constitutioncenter.org/the-constitution/historic-document-library/detail/james-madison-federalist-no-55-1788) |
| brutus1 | [Brutus 1](https://minio.la.utexas.edu/webeditor-files/coretexts/pdf/178720brutus201.pdf) |
| centinel1 | [Centinel 1](https://teachingamericanhistory.org/document/centinel-i-2/) |

Several of these pages are excerpts, not full texts. The Federalist 55 and Common Sense pages lack some well-known lines (for example "esteem and confidence" and "begin the world over again"), and the Centinel 1 page is an excerpt. Quotes are verified against the page text as published at these URLs.
