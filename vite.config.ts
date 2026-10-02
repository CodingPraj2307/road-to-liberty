import { defineConfig } from 'vite';
import { configDefaults } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  base: '/road-to-liberty/',
  plugins: [react(), tailwindcss()],
  // Skip agent worktrees under .claude/ so their copies of the tests don't run too.
  test: { environment: 'node', exclude: [...configDefaults.exclude, '.claude/**'] },
});
