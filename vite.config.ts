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
    rollupOptions: {
      output: {
        // 大きなライブラリは独立したチャンクにして、ブラウザキャッシュを効かせる
        // react 本体や CommonJS 変換ヘルパーも明示的に分けないと、最初に参照した plotly チャンクへ同居させられ、
        // 初回表示で巨大な plotly チャンクまで読み込まれてしまう
        manualChunks(id) {
          if (/[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/.test(id) || id.includes('commonjsHelpers')) {
            return 'react';
          }
          if (/[\\/]node_modules[\\/](plotly\.js-basic-dist-min|react-plotly\.js)[\\/]/.test(id)) return 'plotly';
          // CSS (main.tsx で読み込み) は対象外にして、数式を使わないページで katex 本体を読み込まないようにする
          if (/[\\/]node_modules[\\/]katex[\\/]/.test(id) && !id.endsWith('.css')) return 'katex';
          return undefined;
        },
      },
    },
  },
});
