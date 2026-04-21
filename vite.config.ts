import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages: base は `/<repo-name>/`。環境変数 VITE_BASE で上書き可。
declare const process: { env: Record<string, string | undefined> };
const base = process.env.VITE_BASE ?? '/cross-stats-app/';

export default defineConfig({
  base,
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 2000,
  },
});
