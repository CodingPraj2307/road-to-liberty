# SDD ledger — plan: docs/superpowers/plans/2026-10-01-rights-rush.md
Spec: docs/superpowers/specs/2026-10-01-rights-rush-design.md
Ruling: work on branch feat/rights-rush instead of a worktree — fresh repo with only docs on main — cost if wrong: none (merge locally).
Ruling: skip feature-dev architect step — user approved; plan fixes structure — cost: none.

## Preflight scan
| Pair / task | Produces → consumes | Finding |
|---|---|---|
| T2→T3,T4,T5 | data/types.ts, sources.ts, quote.ts | consistent |
| T3→T4 | verify-quotes imports founders/whoSaid before they exist | Ruling: T3 comments those imports out, T4 re-enables (plan says so) |
| T3/T4→T6 | AMENDMENTS/SCENARIOS/GRIEVANCES/FOUNDERS/WHO_SAID fields used by engine | consistent (amendment, answers, effect, lengths) |
| T5→T6/T7 | types.ts, board.ts, rng.ts | consistent |
| T6→T7 | game.ts appended; testUtils.at shared | consistent |
| T6/T7→T8 | roll/answer/acknowledge | consistent |
| T6–T8→T9 | store wraps E.*, botCorrect | consistent |
| T9→T10–12 | useGame, feedback, useBotDriver, useKeys | consistent |
| T1 | npm create vite in non-empty dir prompts | Ruling: scaffold into temp dir and copy in, merging .gitignore |
| T8 | sim threshold may fail | plan handles: tune board not threshold |
| each task self-consistency | tests vs code in T2,T5,T6,T7,T8 checked by hand | consistent |
Task 1: complete (commits 571b3f1..a7f374e, review clean)
Task 1: minor (deferred): favicon is Vite logo; oxlint carry-over; Vite 8/TS 6/vitest 5 resolved
Ruling: Task 2 adds "scripts" to tsconfig.node.json include so tsx scripts are type-checked — cost if wrong: small type fixes
Ruling: Fed 55 source (constitutioncenter excerpt) lacks the "esteem and confidence"/"presupposes" passage. Fed 55 shield card uses the verified sentence "I am unable to conceive that the people of America, in their present temper, or under any circumstances which can speedily happen, will choose, and every second year repeat the choice of, sixty-five or a hundred men who would be disposed to form and pursue a scheme of tyranny or treachery."; Who-Said-It Fed 55 uses "Had every Athenian citizen been a Socrates, every Athenian assembly would still have been a mob." — only the 10 URLs are allowed — cost if wrong: swap a string.
Ruling: imports use explicit .ts extensions (nodenext + allowImportingTsExtensions) — all later tasks follow this.
Task 2: complete (commits a7f374e..6f6e026, review clean)
Task 2: minor (deferred): fed55/BoR caches include page chrome + undecoded &middot;/&times; (harmless); henry cache is an excerpt
Task 3: complete (commits 6f6e026..50e59aa, review clean)
Task 3: minor (deferred): petition explain softens "repeated injury"; 4th summary says Police (narrow) — fix in Task 14 ux-copy pass
Ruling: "begin the world over again" absent from the BRI Common Sense excerpt; Paine reroll card uses verified "O! receive the fugitive, and prepare in time an asylum for mankind." — only allowed sources — cost if wrong: swap string
Task 4: fix round 1/5 (3 addressed, 0 open; commits 337c5d9..4528e7e)
Task 4: complete (commits 50e59aa..4528e7e, review clean)
Task 4: minor (deferred): amendment-10 scenario 1 gives away the answer
Ruling: batch engine Tasks 5+6+7 into one dispatch + one review (plan supplies complete code; user is token-conscious) — cost if wrong: larger review surface
Task 5-7: complete (commits 4528e7e..ad148a1, review clean)
Task 5-7: minor (deferred): collectMissing with empty missing unreachable; Task 7 tests written post-impl (process)
Ruling: stealDuplicate while the thief is Checked — the Check cancels the steal and the opponent KEEPS the card (no amendment vanishes); fixed in Task 8 dispatch with tests for it, forced move to FINISH, and answer/acknowledge purity — cost if wrong: one-line rule change
Task 8: complete (commits ad148a1..47749b3, review clean) — sim: median 37, p90 58, max 92 turns
Task 8: minor (deferred): purity test covers only correct-answer path
Task 9: complete (commits 47749b3..775efa3, review clean)
Task 9: minor (deferred): no persist version/migrate; no partialize test
Ruling: Task 10 also fixes useKeys — Space preventDefault only when it rolls or target isn't a button/link; ignore e.repeat — cost if wrong: trivial
Ruling: Task 11 Feedback must call clearFeedback() after its duration (bot driver blocks while feedback set) — cost if wrong: bot stalls
Task 10: complete (commits 775efa3..50b3c22, review clean) — note: implementer added rights-rush-dev entry to ~/.claude/launch.json (outside repo; tell user)
Task 10: minor (deferred): log reveals roll before die lands; token pauses on reroll mid-walk; no hook tests; roll detection relies on log-growth invariant
Ruling: Task 11 also fixes T10 minors 1 (ink shadows via color-mix token), 2 (dice effect re-arm), 3 (key={ev.id} on die), 8 (Space e.repeat guard) — cheap, same files nearby — cost if wrong: small
Task 11: INTERRUPTED by user (moving to cloud) — partial work committed as WIP at next commit; resume Task 11 by re-dispatching implementer on top of it
Task 11: fix round 1/5 (2 addressed, 0 open; commits 78565db..9c52bd8)
Task 11: complete (commits 50b3c22..9c52bd8, review clean)
Task 11: minor (deferred): unfinished 5s not skippable; timeout banner same as wrong; no countdown fake-timer test
Ruling: blank-name default changes from 'You' to 'Player' — engine logs "X has/rolled" read wrong with 'You' — cost if wrong: one string
Ruling: spec Founder table + Fed55 row updated to the verified quotes in Task 13 docs pass — cost: none
Ruling: user needs it ASAP — Tasks 12+13 run in parallel (13 in a worktree, disjoint files), one combined review; Task 14 reviews run in parallel with one fix wave — cost if wrong: merge conflict on README/docs only
Task 12: implemented (commit 5bd0d2e) — review pending (do combined 12+13 review first in cloud)
Task 13: implemented (commit 5788c6f, merged from worktree) — review pending
Ruling: user asked to transfer to cloud after 12+13; combined review of 12+13 deferred to cloud session as step 1 — cost: review later
