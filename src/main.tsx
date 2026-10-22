import React from 'react';
import ReactDOM from 'react-dom/client';
import 'katex/dist/katex.min.css';
import { App } from './App';
import { ThemeProvider } from './contexts/ThemeContext';
import { ProgressProvider } from './contexts/ProgressContext';
import { ToastProvider } from './contexts/ToastContext';
import { I18nProvider } from './i18n';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <I18nProvider>
        <ProgressProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </ProgressProvider>
      </I18nProvider>
    </ThemeProvider>
  </React.StrictMode>,
);

// 再デプロイで古いチャンクが消えた場合などに動的 import が失敗したら、1 度だけ自動で再読み込みする
// (連続失敗時はループさせず、ページ側のエラー表示に任せる)
window.addEventListener('vite:preloadError', (event) => {
  try {
    if (window.sessionStorage.getItem('cross-stats:reloaded')) return;
    window.sessionStorage.setItem('cross-stats:reloaded', '1');
  } catch {
    return;
  }
  event.preventDefault();
  window.location.reload();
});
window.addEventListener('load', () => {
  window.setTimeout(() => {
    try {
      window.sessionStorage.removeItem('cross-stats:reloaded');
    } catch {
      /* noop */
    }
  }, 10000);
});

// 本番ビルドのみ Service Worker を登録し、オフライン利用とホーム画面へのインストールに対応する
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => {
      /* 登録失敗時も通常の Web アプリとして動作する */
    });
  });
}
