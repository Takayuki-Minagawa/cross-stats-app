import { Link } from 'react-router-dom';

type Card = {
  to: string;
  title: string;
  desc: string;
  tag: 'classical' | 'bayes' | 'discovery';
};

const cards: Card[] = [
  {
    to: '/classical/t-test',
    title: 't 検定',
    desc: '2 群平均の差を検定。サンプルサイズと効果量で p 値がどう変わるかを体感。',
    tag: 'classical',
  },
  {
    to: '/classical/anova',
    title: '分散分析 (ANOVA)',
    desc: '3 群以上の平均差を F 統計量で一括検定。群内・群間分散の分解を可視化。',
    tag: 'classical',
  },
  {
    to: '/classical/regression',
    title: '重回帰分析',
    desc: '最小二乗法で係数を推定。共線性やノイズが信頼区間に与える影響を観察。',
    tag: 'classical',
  },
  {
    to: '/bayesian/coin-flip',
    title: 'コインのベイズ更新',
    desc: 'ベータ分布 + 二項尤度で事後分布を逐次更新するアニメーション。',
    tag: 'bayes',
  },
  {
    to: '/bayesian/mcmc',
    title: 'MCMC ベイズ回帰',
    desc: 'Metropolis-Hastings 法で事後分布をサンプリング。トレースプロット付。',
    tag: 'bayes',
  },
  {
    to: '/bayesian/hierarchical',
    title: '階層ベイズ',
    desc: 'グループ差をプーリングで正則化。完全プーリング / 部分プーリング / 無プーリング比較。',
    tag: 'bayes',
  },
  {
    to: '/discovery/irt',
    title: '項目応答理論 (IRT)',
    desc: '教育測定。難易度・識別力・能力を分離し、アイテム特性曲線 (ICC) で可視化。',
    tag: 'discovery',
  },
  {
    to: '/discovery/survival',
    title: '生存時間分析',
    desc: 'Kaplan–Meier 推定量と比例ハザード。打ち切りデータの取り扱い方を学ぶ。',
    tag: 'discovery',
  },
  {
    to: '/discovery/hmm',
    title: '隠れマルコフモデル (HMM)',
    desc: '観測から潜在状態列をビタビで復号。レジームスイッチを視覚化。',
    tag: 'discovery',
  },
];

export function Home() {
  return (
    <>
      <h1>Cross Stats — インタラクティブ統計学習</h1>
      <p className="lede">
        古典統計（頻度論）・ベイズ統計・他分野の統計手法を、スライダーとインタラクティブグラフで学ぶ学習用 Web
        アプリです。各ページには【解説】【数式】【パラメータ操作】【グラフ】【サンプルコード (Python)】が含まれます。
      </p>

      <div className="panel">
        <h3 style={{ marginTop: 0 }}>このアプリの読み方</h3>
        <ul>
          <li>
            <strong>スライダーを動かす</strong>とグラフが即時に再計算されます。サンプルサイズや分散を変えたときの
            <span className="tooltip" data-tip="サンプルから母数を推定した際の不確かさの範囲">
              {' '}信頼区間
            </span>
            の挙動を体感してください。
          </li>
          <li>
            サンプルコード欄には Python (NumPy / SciPy / PyMC 等) での等価な実装を載せています。手元の
            Jupyter で再現可能です。
          </li>
          <li>このアプリ自体は静的な SPA (React + Plotly.js) で、GitHub Pages にデプロイできます。</li>
        </ul>
      </div>

      <h2>ページ一覧</h2>
      <div className="home-cards">
        {cards.map((c) => (
          <Link key={c.to} to={c.to} className="home-card">
            <h4>
              {c.title}
              <span className={`tag ${c.tag}`}>
                {c.tag === 'classical' ? '古典' : c.tag === 'bayes' ? 'ベイズ' : '他分野'}
              </span>
            </h4>
            <p>{c.desc}</p>
          </Link>
        ))}
      </div>
    </>
  );
}
