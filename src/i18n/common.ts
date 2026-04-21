import type { Lang } from './index';

export const common = {
  ja: {
    brand: 'Cross Stats',
    brandSub: 'インタラクティブ統計学習',
    nav: {
      home: 'ホーム',
      guide: '使い方ガイド',
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
    copy: 'コピー',
    copied: 'コピー済',
    seed: '乱数シード',
  },
  en: {
    brand: 'Cross Stats',
    brandSub: 'Interactive Statistics Learning',
    nav: {
      home: 'Home',
      guide: 'User Guide',
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
    copy: 'Copy',
    copied: 'Copied',
    seed: 'Random seed',
  },
} as const;

export function t(lang: Lang) {
  return common[lang];
}
