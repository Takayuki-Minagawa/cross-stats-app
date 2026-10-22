import type { Lang } from './index';

export const common = {
  ja: {
    brand: 'Cross Stats',
    brandSub: 'インタラクティブ統計学習',
    nav: {
      home: 'ホーム',
      guide: '使い方ガイド',
      play: '相関当てゲーム',
      playSection: 'あそぶ',
      classical: '古典統計',
      bayesian: 'ベイズ統計',
      discovery: 'ディスカバリー',
      tTest: 't 検定',
      anova: '分散分析 (ANOVA)',
      regression: '重回帰分析',
      coinFlip: 'コインのベイズ更新',
      mcmc: 'MCMC ベイズ回帰',
      hierarchical: '階層ベイズ',
      irt: '項目応答理論 (IRT)',
      survival: '生存時間分析',
      hmm: '隠れマルコフモデル',
    },
    tags: {
      classical: '古典',
      bayes: 'ベイズ',
      discovery: '他分野',
    },
    categoryLong: {
      classical: '古典統計 (頻度論)',
      bayes: 'ベイズ統計',
      discovery: 'ディスカバリー (分野特化)',
    },
    levels: ['', '入門', '基礎', '応用'],
    sections: {
      model: 'モデル',
      parameters: 'パラメータ操作',
      sampleCode: 'サンプルコード',
    },
    toggles: {
      switchToLight: 'ライトモードに切替',
      switchToDark: 'ダークモードに切替',
      darkLabel: 'ダーク',
      lightLabel: 'ライト',
      langLabel: 'EN',
      langAria: '英語に切替',
    },
    missions: {
      title: 'ミッション',
      hint: 'スライダーを動かして条件を満たそう！',
      cleared: 'ミッション達成！',
      allCleared: 'このページを完全クリア！🎉',
      allClearedBody: 'すべてのミッションを達成しました',
    },
    progress: {
      title: 'あなたの進捗',
      missions: 'ミッション',
      visited: '訪問済み',
      reset: '進捗をリセット',
      resetConfirm: '進捗 (訪問履歴・ミッション・ハイスコア) をすべてリセットしますか？',
    },
    ranks: ['統計ビギナー', 'データ探検家', '推定マイスター', '検定ハンター', '統計マスター'],
    palette: {
      open: '検索',
      placeholder: 'トピックを検索… (例: 回帰, MCMC)',
      empty: '一致するページがありません',
      hint: '↑↓ で選択 / Enter で移動 / Esc で閉じる',
    },
    pageNav: { prev: '前へ', next: '次へ' },
    menu: 'メニュー',
    install: 'アプリとしてインストール',
    copy: 'コピー',
    copied: 'コピー済',
    seed: '乱数シード',
    dice: 'ランダムなシードで再生成',
    loading: '読み込み中…',
    pageError: {
      title: 'ページを読み込めませんでした',
      body: 'アプリが更新されたか、オフラインの可能性があります。再読み込みしてください。',
      reload: '再読み込み',
    },
  },
  en: {
    brand: 'Cross Stats',
    brandSub: 'Interactive Statistics Learning',
    nav: {
      home: 'Home',
      guide: 'User Guide',
      play: 'Guess the Correlation',
      playSection: 'Play',
      classical: 'Classical',
      bayesian: 'Bayesian',
      discovery: 'Discovery',
      tTest: 't-test',
      anova: 'ANOVA',
      regression: 'Multiple Regression',
      coinFlip: 'Bayesian Coin Flip',
      mcmc: 'MCMC Regression',
      hierarchical: 'Hierarchical Bayes',
      irt: 'Item Response Theory (IRT)',
      survival: 'Survival Analysis',
      hmm: 'Hidden Markov Model',
    },
    tags: {
      classical: 'Classical',
      bayes: 'Bayesian',
      discovery: 'Other Fields',
    },
    categoryLong: {
      classical: 'Classical (Frequentist)',
      bayes: 'Bayesian Statistics',
      discovery: 'Discovery (Domain-specific)',
    },
    levels: ['', 'Intro', 'Core', 'Advanced'],
    sections: {
      model: 'Model',
      parameters: 'Parameters',
      sampleCode: 'Sample Code',
    },
    toggles: {
      switchToLight: 'Switch to light mode',
      switchToDark: 'Switch to dark mode',
      darkLabel: 'Dark',
      lightLabel: 'Light',
      langLabel: 'JA',
      langAria: 'Switch to Japanese',
    },
    missions: {
      title: 'Missions',
      hint: 'Move the sliders to meet each condition!',
      cleared: 'Mission complete!',
      allCleared: 'Page fully cleared! 🎉',
      allClearedBody: 'You completed every mission on this page',
    },
    progress: {
      title: 'Your progress',
      missions: 'Missions',
      visited: 'Visited',
      reset: 'Reset progress',
      resetConfirm: 'Reset all progress (visited pages, missions, high scores)?',
    },
    ranks: ['Stats Beginner', 'Data Explorer', 'Estimation Adept', 'Hypothesis Hunter', 'Stats Master'],
    palette: {
      open: 'Search',
      placeholder: 'Search topics… (e.g. regression, MCMC)',
      empty: 'No matching pages',
      hint: '↑↓ to select / Enter to open / Esc to close',
    },
    pageNav: { prev: 'Previous', next: 'Next' },
    menu: 'Menu',
    install: 'Install as app',
    copy: 'Copy',
    copied: 'Copied',
    seed: 'Random seed',
    dice: 'Regenerate with a random seed',
    loading: 'Loading…',
    pageError: {
      title: 'This page failed to load',
      body: 'The app may have been updated, or you may be offline. Please reload.',
      reload: 'Reload',
    },
  },
} as const;

export function t(lang: Lang) {
  return common[lang];
}

// 達成ミッション数 (0..total) から称号を決める
export function rankIndex(done: number, total: number): number {
  if (total === 0) return 0;
  const r = done / total;
  if (r >= 1) return 4;
  if (r >= 0.66) return 3;
  if (r >= 0.33) return 2;
  if (done > 0) return 1;
  return 0;
}
