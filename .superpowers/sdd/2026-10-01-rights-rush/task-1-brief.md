### Task 1: Scaffold

**Files:** project root config, `src/main.tsx`, `src/index.css`, `vite.config.ts`, `package.json`

- [ ] **Step 1: Scaffold and install** (if npm hits EACCES, set `npm_config_cache` to a writable folder; see memory)

```bash
cd ~/road-to-liberty
npm create vite@latest . -- --template react-ts
npm i zustand
npm i -D tailwindcss @tailwindcss/vite vitest tsx unpdf @types/node
```

- [ ] **Step 2: Configure** `vite.config.ts`:

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  base: '/road-to-liberty/',
  plugins: [react(), tailwindcss()],
  test: { environment: 'node' },
});
```

Add `/// <reference types="vitest/config" />` at the top. Replace `src/index.css` with `@import "tailwindcss";`. Delete the template demo content in `App.tsx` (render `<h1>Rights Rush</h1>`). Add these scripts to `package.json`:

```json
"test": "vitest run",
"fetch-sources": "tsx scripts/fetch-sources.ts",
"verify-quotes": "tsx scripts/verify-quotes.ts"
```

- [ ] **Step 3: Verify** with `npm run build`. Expected: success.
- [ ] **Step 4: Commit** with `chore: scaffold Vite React TS + Tailwind + Vitest` (include `docs/`).

---

