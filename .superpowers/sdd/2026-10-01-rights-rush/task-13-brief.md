### Task 13: Deploy + README

**Files:** Create `.github/workflows/deploy.yml`, `README.md`

- [ ] **Step 1: Workflow:**

```yaml
name: Deploy
on: { push: { branches: [main] }, workflow_dispatch: {} }
permissions: { contents: read, pages: write, id-token: write }
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: npm }
      - run: npm ci
      - run: npm test
      - run: npm run verify-quotes
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with: { path: dist }
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment: { name: github-pages, url: '${{ steps.d.outputs.page_url }}' }
    steps:
      - id: d
        uses: actions/deploy-pages@v4
```

- [ ] **Step 2: README** (engineering:documentation): what the game teaches, how to play, keys, presenter tips (Fast Bot, fullscreen), `npm i`, `npm run dev`, `npm test`, `npm run verify-quotes`, `npm run fetch-sources` (and that the cache is committed), how to edit content in `src/data`, and the deploy steps (create the GitHub repo `road-to-liberty`, push `main`, Settings → Pages → Source: GitHub Actions; site at `https://<user>.github.io/road-to-liberty/`).
- [ ] **Step 3: Verify** with `npm run build && npx vite preview`, and open `/road-to-liberty/` to check that assets load.
- [ ] **Step 4: Commit** with `chore: GitHub Pages deploy + README`.

---

