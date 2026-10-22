import { Link } from 'react-router-dom';
import { useLang } from '../i18n';
import { rankIndex, t as commonT } from '../i18n/common';
import { categories, topics, totalMissions } from '../topics';
import { useProgress } from '../contexts/ProgressContext';

const text = {
  ja: {
    heroTitle: '統計を、さわって学ぶ。',
    heroSub:
      'スライダーを動かすとグラフが即座に変化。t 検定から MCMC・隠れマルコフモデルまで、9 つの手法を「遊びながら」理解できる学習アプリです。',
    start: '学習をはじめる',
    resume: (name: string) => `続きから: ${name}`,
    playGame: '🎯 相関当てゲームで遊ぶ',
    features: [
      { icon: '🎚️', title: 'さわる', body: 'パラメータをスライダーで自由に操作' },
      { icon: '📊', title: 'みる', body: 'グラフと統計量がリアルタイムに変化' },
      { icon: '🎯', title: 'ためす', body: 'ミッションをクリアして理解を確認' },
      { icon: '🐍', title: 'つかう', body: '同じ分析を Python コードで再現' },
    ],
    bestScore: (s: number) => `ゲームのベストスコア: ${s}`,
    statusCleared: 'クリア',
    statusVisited: '学習中',
    statusNew: 'NEW',
    descriptions: {
      tTest: '2 群平均の差を検定。サンプルサイズと効果量で p 値がどう変わるかを体感。',
      anova: '3 群以上の平均差を F 統計量で一括検定。群内・群間分散の分解を可視化。',
      regression: '最小二乗法で係数を推定。共線性やノイズが信頼区間に与える影響を観察。',
      coinFlip: 'ベータ分布 + 二項尤度で事後分布を逐次更新。',
      mcmc: 'Metropolis-Hastings 法で事後分布をサンプリング。トレースプロット付。',
      hierarchical: 'グループ差をプーリングで正則化。3 手法の比較。',
      irt: '難易度・識別力・能力を分離し、アイテム特性曲線で可視化。',
      survival: 'Kaplan–Meier 推定量と比例ハザード。打ち切りデータの扱い方を学ぶ。',
      hmm: '観測から潜在状態列をビタビで復号。',
    },
  },
  en: {
    heroTitle: 'Learn statistics by touching it.',
    heroSub:
      'Move a slider and the plots respond instantly. From t-tests to MCMC and hidden Markov models, explore nine methods while playing with them.',
    start: 'Start learning',
    resume: (name: string) => `Continue: ${name}`,
    playGame: '🎯 Play Guess the Correlation',
    features: [
      { icon: '🎚️', title: 'Touch', body: 'Tweak parameters freely with sliders' },
      { icon: '📊', title: 'See', body: 'Plots and statistics update in real time' },
      { icon: '🎯', title: 'Try', body: 'Clear missions to check your understanding' },
      { icon: '🐍', title: 'Use', body: 'Reproduce each analysis in Python' },
    ],
    bestScore: (s: number) => `Game best score: ${s}`,
    statusCleared: 'Cleared',
    statusVisited: 'In progress',
    statusNew: 'NEW',
    descriptions: {
      tTest: "Test difference in two group means. See how sample size and effect size affect the p-value.",
      anova: 'One-way F test for three or more groups. Visualize the between/within variance decomposition.',
      regression:
        'OLS coefficient estimation. Observe how collinearity and noise inflate confidence intervals.',
      coinFlip: 'Conjugate beta-binomial posterior updating.',
      mcmc: 'Metropolis-Hastings posterior sampling with trace plots.',
      hierarchical:
        'Regularize group differences with partial pooling. Compare no/partial/complete pooling.',
      irt: 'Separate difficulty, discrimination, and ability with item characteristic curves.',
      survival: 'Kaplan–Meier and proportional hazards; learn how to handle censored data.',
      hmm: 'Decode latent state sequences from observations with Viterbi.',
    },
  },
} as const;

export function Home() {
  const { lang } = useLang();
  const tr = text[lang];
  const cmn = commonT(lang);
  const { visited, missionCount, best, reset } = useProgress();

  const done = missionCount();
  const rank = rankIndex(done, totalMissions);
  // 未クリアのうち最初のトピックを「続きから」の行き先にする
  const nextTopic = topics.find((tp) => missionCount(tp.key) < tp.missions) ?? topics[0];
  const started = visited.length > 0;

  return (
    <>
      <section className="hero">
        <div className="hero-text">
          <span className="hero-badge">📊 {cmn.brandSub}</span>
          <h1>{tr.heroTitle}</h1>
          <p>{tr.heroSub}</p>
          <div className="btn-row">
            <Link to={nextTopic.path} className="btn primary big">
              {started ? tr.resume(cmn.nav[nextTopic.key]) : tr.start} →
            </Link>
            <Link to="/play/correlation" className="btn big">
              {tr.playGame}
            </Link>
          </div>
        </div>
        <HeroArt />
      </section>

      <section className="feature-row">
        {tr.features.map((f) => (
          <div key={f.title} className="feature">
            <span className="feature-icon" aria-hidden="true">
              {f.icon}
            </span>
            <strong>{f.title}</strong>
            <span>{f.body}</span>
          </div>
        ))}
      </section>

      <section className="panel progress-panel">
        <div className="progress-main">
          <div className="ring" style={{ ['--pct' as string]: `${(done / totalMissions) * 100}%` }}>
            <span>{Math.round((done / totalMissions) * 100)}%</span>
          </div>
          <div>
            <div className="progress-label">{cmn.progress.title}</div>
            <div className="progress-rank">🏅 {cmn.ranks[rank]}</div>
            <div className="progress-sub">
              {cmn.progress.missions} {done}/{totalMissions} ・ {cmn.progress.visited} {visited.length}/
              {topics.length}
              {best.correlation ? ` ・ ${tr.bestScore(best.correlation)}` : ''}
            </div>
          </div>
        </div>
        {(done > 0 || started) && (
          <button
            type="button"
            className="btn ghost small"
            onClick={() => {
              if (window.confirm(cmn.progress.resetConfirm)) reset();
            }}
          >
            ↺ {cmn.progress.reset}
          </button>
        )}
      </section>

      {categories.map((cat) => (
        <section key={cat}>
          <h2 className={`cat-heading cat-${cat}`}>{cmn.categoryLong[cat]}</h2>
          <div className="home-cards">
            {topics
              .filter((tp) => tp.category === cat)
              .map((tp) => {
                const cnt = missionCount(tp.key);
                const cleared = cnt >= tp.missions;
                const status = cleared ? 'cleared' : visited.includes(tp.key) ? 'visited' : 'new';
                return (
                  <Link key={tp.key} to={tp.path} className={`home-card cat-${cat}`}>
                    <div className="home-card-top">
                      <span className="home-card-icon" aria-hidden="true">
                        {tp.icon}
                      </span>
                      <span className={`status status-${status}`}>
                        {status === 'cleared'
                          ? `✓ ${tr.statusCleared}`
                          : status === 'visited'
                            ? tr.statusVisited
                            : tr.statusNew}
                      </span>
                    </div>
                    <h4>{cmn.nav[tp.key]}</h4>
                    <p>{tr.descriptions[tp.key]}</p>
                    <div className="home-card-foot">
                      <span className="level">
                        {'●'.repeat(tp.level)}
                        <span className="level-off">{'●'.repeat(3 - tp.level)}</span>
                        <span className="level-label">{cmn.levels[tp.level]}</span>
                      </span>
                      <span className="mini-progress">
                        🎯 {cnt}/{tp.missions}
                      </span>
                    </div>
                    <div className="progress-bar thin" aria-hidden="true">
                      <span style={{ width: `${(cnt / tp.missions) * 100}%` }} />
                    </div>
                  </Link>
                );
              })}
          </div>
        </section>
      ))}
    </>
  );
}

// ヒーロー右側のアニメーション: 正規分布の曲線と、降ってきて積み上がる標本点
function HeroArt() {
  const bars = [2, 5, 9, 14, 18, 20, 18, 14, 9, 5, 2];
  return (
    <svg className="hero-art" viewBox="0 0 240 180" aria-hidden="true">
      <defs>
        <linearGradient id="heroGrad" x1="0" x2="1">
          <stop offset="0%" stopColor="var(--accent)" />
          <stop offset="100%" stopColor="var(--accent-2)" />
        </linearGradient>
      </defs>
      {bars.map((h, i) => (
        <rect
          key={i}
          className="hero-bar"
          x={18 + i * 19}
          y={160 - h * 6}
          width={15}
          height={h * 6}
          rx={3}
          style={{ animationDelay: `${i * 70}ms` }}
        />
      ))}
      <path
        className="hero-curve"
        d="M10 158 C 60 158, 80 30, 120 30 C 160 30, 180 158, 230 158"
        fill="none"
        stroke="url(#heroGrad)"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <circle className="hero-dot d1" cx="120" cy="12" r="5" />
      <circle className="hero-dot d2" cx="90" cy="12" r="4" />
      <circle className="hero-dot d3" cx="150" cy="12" r="4" />
      <line x1="8" y1="161" x2="232" y2="161" className="hero-axis" />
    </svg>
  );
}
