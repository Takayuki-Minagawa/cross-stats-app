import { Link } from 'react-router-dom';
import { useLang } from '../i18n';
import { t as commonT } from '../i18n/common';

type CardKey =
  | 'tTest'
  | 'anova'
  | 'regression'
  | 'coinFlip'
  | 'mcmc'
  | 'hierarchical'
  | 'irt'
  | 'survival'
  | 'hmm';

type Card = {
  key: CardKey;
  to: string;
  tag: 'classical' | 'bayes' | 'discovery';
};

const cards: Card[] = [
  { key: 'tTest', to: '/classical/t-test', tag: 'classical' },
  { key: 'anova', to: '/classical/anova', tag: 'classical' },
  { key: 'regression', to: '/classical/regression', tag: 'classical' },
  { key: 'coinFlip', to: '/bayesian/coin-flip', tag: 'bayes' },
  { key: 'mcmc', to: '/bayesian/mcmc', tag: 'bayes' },
  { key: 'hierarchical', to: '/bayesian/hierarchical', tag: 'bayes' },
  { key: 'irt', to: '/discovery/irt', tag: 'discovery' },
  { key: 'survival', to: '/discovery/survival', tag: 'discovery' },
  { key: 'hmm', to: '/discovery/hmm', tag: 'discovery' },
];

const text = {
  ja: {
    heading: 'Cross Stats — インタラクティブ統計学習',
    lede:
      '古典統計（頻度論）・ベイズ統計・他分野の統計手法を、スライダーとインタラクティブグラフで学ぶ学習用 Web アプリです。各ページには【解説】【数式】【パラメータ操作】【グラフ】【サンプルコード (Python)】が含まれます。',
    howHeading: 'このアプリの読み方',
    bullet1: 'スライダーを動かすとグラフが即時に再計算されます。',
    bullet2:
      'サンプルコード欄には Python (NumPy / SciPy / PyMC 等) での等価な実装を載せています。手元の Jupyter で再現可能です。',
    bullet3: 'このアプリ自体は静的な SPA (React + Plotly.js) で、GitHub Pages にデプロイできます。',
    themeLangTip:
      'サイドバー左上のトグルでテーマ（ダーク / ライト）と言語（日本語 / English）を切り替えられます。',
    pagesHeading: 'ページ一覧',
    descriptions: {
      tTest: 't 検定 — 2 群平均の差を検定。サンプルサイズと効果量で p 値がどう変わるかを体感。',
      anova: '分散分析 (ANOVA) — 3 群以上の平均差を F 統計量で一括検定。群内・群間分散の分解を可視化。',
      regression: '重回帰分析 — 最小二乗法で係数を推定。共線性やノイズが信頼区間に与える影響を観察。',
      coinFlip: 'コインのベイズ更新 — ベータ分布 + 二項尤度で事後分布を逐次更新。',
      mcmc: 'MCMC ベイズ回帰 — Metropolis-Hastings 法で事後分布をサンプリング。トレースプロット付。',
      hierarchical: '階層ベイズ — グループ差をプーリングで正則化。3 手法の比較。',
      irt: '項目応答理論 (IRT) — 難易度・識別力・能力を分離し、アイテム特性曲線で可視化。',
      survival: '生存時間分析 — Kaplan–Meier 推定量と比例ハザード。打ち切りデータの扱い方を学ぶ。',
      hmm: '隠れマルコフモデル (HMM) — 観測から潜在状態列をビタビで復号。',
    },
  },
  en: {
    heading: 'Cross Stats — Interactive Statistics Learning',
    lede:
      'A web app for learning classical (frequentist), Bayesian, and domain-specific statistics with sliders and interactive plots. Each page contains explanation, formulas, parameter controls, graphs, and Python sample code.',
    howHeading: 'How to read this app',
    bullet1: 'Move the sliders and the plots recalculate in real time.',
    bullet2:
      'Sample code is provided in Python (NumPy / SciPy / PyMC, etc.) so you can reproduce the analyses in your own Jupyter environment.',
    bullet3:
      'The app itself is a fully static SPA (React + Plotly.js) suitable for GitHub Pages deployment.',
    themeLangTip:
      'Use the toggles at the top of the sidebar to switch between dark / light themes and Japanese / English.',
    pagesHeading: 'Pages',
    descriptions: {
      tTest: "t-test — test difference in two group means. See how sample size and effect size affect the p-value.",
      anova: 'ANOVA — one-way F test for three or more groups. Visualize the between/within variance decomposition.',
      regression:
        'Multiple Regression — OLS coefficient estimation. Observe how collinearity and noise inflate confidence intervals.',
      coinFlip: 'Bayesian Coin Flip — conjugate beta-binomial posterior updating.',
      mcmc: 'MCMC Regression — Metropolis-Hastings posterior sampling with trace plots.',
      hierarchical:
        'Hierarchical Bayes — regularize group differences with partial pooling. Compare no/partial/complete pooling.',
      irt: 'Item Response Theory (IRT) — separate difficulty, discrimination, and ability with item characteristic curves.',
      survival: 'Survival Analysis — Kaplan–Meier and proportional hazards; learn how to handle censored data.',
      hmm: 'Hidden Markov Model — decode latent state sequences from observations with Viterbi.',
    },
  },
} as const;

export function Home() {
  const { lang } = useLang();
  const tr = text[lang];
  const cmn = commonT(lang);
  return (
    <>
      <h1>{tr.heading}</h1>
      <p className="lede">{tr.lede}</p>

      <div className="panel">
        <h3 style={{ marginTop: 0 }}>{tr.howHeading}</h3>
        <ul>
          <li>{tr.bullet1}</li>
          <li>{tr.bullet2}</li>
          <li>{tr.bullet3}</li>
          <li>{tr.themeLangTip}</li>
        </ul>
      </div>

      <h2>{tr.pagesHeading}</h2>
      <div className="home-cards">
        {cards.map((c) => {
          const desc = tr.descriptions[c.key];
          const title = cmn.nav[c.key];
          return (
            <Link key={c.to} to={c.to} className="home-card">
              <h4>
                {title}
                <span className={`tag ${c.tag}`}>{cmn.tags[c.tag]}</span>
              </h4>
              <p>{desc}</p>
            </Link>
          );
        })}
      </div>
    </>
  );
}
