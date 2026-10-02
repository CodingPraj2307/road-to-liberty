# Task 13 report: Deploy + README

Status: DONE

Commit (worktree branch worktree-agent-a0f914744810aa80e): 5788c6f chore: GitHub Pages deploy + README

## Implemented
- .github/workflows/deploy.yml: the brief's workflow (push to main + workflow_dispatch; npm ci, test, verify-quotes, build, upload-pages-artifact, deploy-pages). Node 22 (no .nvmrc or engines field exists). I added one line: concurrency { group: pages, cancel-in-progress: true }.
- README.md: what it teaches, how to play, keys table, presenter tips (Fast Bot, F fullscreen, about 8 min), dev commands (sources-cache committed), editing content in src/data (file table; every quote must pass verify-quotes), deploy steps (push main, Settings -> Pages -> Source: GitHub Actions; repo and site URLs), Sources table (10 sources, note that several pages are excerpts).
- Spec: Founder table rows for common-sense (Paine reroll) and fed55 (shield) now match src/data/founders.ts exactly. Added a finding bullet: Fed 55 and Common Sense pages are excerpts lacking "esteem and confidence" and "begin the world over again".

## Verification
- npm ci: OK, 0 vulnerabilities.
- npm run build: OK (tsc -b and vite build).
- vite preview --port 4173: GET /road-to-liberty/ 200; /road-to-liberty/assets/index-CxnVBOSc.js 200; CSS asset 200. HTML references assets under /road-to-liberty/. Preview stopped; port 4173 returned 000 afterwards.
- Did not run npm test or verify-quotes; this task changes no code or data.

## Notes and concerns
- The worktree was created from main (221be25, docs only), not from feat/rights-rush. I ran git reset --hard feat/rights-rush (7f02571) on the worktree branch before starting, so my commit sits on top of feat/rights-rush.
- The README says the Centinel 1 page is an excerpt (the spec already says so) and names only Fed 55 and Common Sense for the missing lines. I did not check whether Henry or Brutus 1 are excerpts.
- Commit trailer: used "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>" per the rules file. The session attribution reminder says "Claude Sonnet 5.5" instead; amend if you want that.
- Google Fonts load from a CDN in index.html, so the deployed site needs internet. Not part of this task.
