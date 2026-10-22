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

// 本番ビルドのみ Service Worker を登録し、オフライン利用とホーム画面へのインストールに対応する
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => {
      /* 登録失敗時も通常の Web アプリとして動作する */
    });
  });
}
