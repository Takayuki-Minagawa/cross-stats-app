import { useMemo, useState } from 'react';
import { Plot } from '../../components/Plot';
import { Slider } from '../../components/Slider';
import { MathBlock } from '../../components/MathBlock';
import { CodeBlock } from '../../components/CodeBlock';
import { StatCard } from '../../components/StatCard';
import { dbeta, linspace, qbeta } from '../../lib/stats';
import { useLang } from '../../i18n';
import { t as commonT } from '../../i18n/common';

const text = {
  ja: {
    title: 'コインのベイズ更新',
    ledePrefix: 'ベータ分布を事前分布、二項分布を尤度としたベイズ更新の古典的例題です。',
    conjugate: '共役事前分布',
    conjugateTip: '尤度の形と同じ分布族になる事前分布。計算が閉形式で済む',
    ledeSuffix: 'ゆえ事後分布は再びベータ分布になり、更新が極めてシンプルに定式化できます。',
    slA: '事前 α (表に期待する数)',
    slB: '事前 β (裏に期待する数)',
    slH: '観測された表の回数',
    slT: '観測された裏の回数',
    stA: '事後 α',
    stB: '事後 β',
    stMean: '事後平均 E[θ|x]',
    stSd: '事後 SD',
    stLo: '95% 下限',
    stHi: '95% 上限',
    chart: 'グラフ: 事前分布 → 事後分布',
    axisTheta: 'θ (表が出る確率)',
    axisDensity: '密度',
    legPrior: (a: number, b: number) => `事前 Beta(${a}, ${b})`,
    legPost: (a: number, b: number) => `事後 Beta(${a.toFixed(1)}, ${b.toFixed(1)})`,
  },
  en: {
    title: 'Bayesian Coin Flip',
    ledePrefix: 'A classical example of Bayesian updating with a Beta prior and binomial likelihood. Because it uses a ',
    conjugate: 'conjugate prior',
    conjugateTip: 'A prior whose functional form matches the likelihood, giving closed-form updates',
    ledeSuffix: ', the posterior is again Beta and the update is expressed very simply.',
    slA: 'Prior α (expected heads)',
    slB: 'Prior β (expected tails)',
    slH: 'Observed heads',
    slT: 'Observed tails',
    stA: 'Posterior α',
    stB: 'Posterior β',
    stMean: 'Posterior mean E[θ|x]',
    stSd: 'Posterior SD',
    stLo: '95% lower',
    stHi: '95% upper',
    chart: 'Graph: Prior → Posterior',
    axisTheta: 'θ (probability of heads)',
    axisDensity: 'Density',
    legPrior: (a: number, b: number) => `Prior Beta(${a}, ${b})`,
    legPost: (a: number, b: number) => `Posterior Beta(${a.toFixed(1)}, ${b.toFixed(1)})`,
  },
} as const;

export function CoinFlip() {
  const { lang } = useLang();
  const tr = text[lang];
  const cmn = commonT(lang);

  const [alpha, setAlpha] = useState(2);
  const [beta, setBeta] = useState(2);
  const [heads, setHeads] = useState(7);
  const [tails, setTails] = useState(3);

  const xs = useMemo(() => linspace(0.001, 0.999, 200), []);
  const prior = useMemo(() => xs.map((x) => dbeta(x, alpha, beta)), [xs, alpha, beta]);
  const posterior = useMemo(
    () => xs.map((x) => dbeta(x, alpha + heads, beta + tails)),
    [xs, alpha, beta, heads, tails],
  );

  const postA = alpha + heads;
  const postB = beta + tails;
  const postMean = postA / (postA + postB);
  const postVar = (postA * postB) / ((postA + postB) ** 2 * (postA + postB + 1));
  const ci95: [number, number] = [qbeta(0.025, postA, postB), qbeta(0.975, postA, postB)];

  return (
    <>
      <h1>
        {tr.title} <span className="tag bayes">{cmn.tags.bayes}</span>
      </h1>
      <p className="lede">
        {tr.ledePrefix}
        <span className="tooltip" data-tip={tr.conjugateTip}>
          {tr.conjugate}
        </span>
        {tr.ledeSuffix}
      </p>

      <h2>{cmn.sections.model}</h2>
      <MathBlock tex={String.raw`\theta \sim \mathrm{Beta}(\alpha, \beta)`} />
      <MathBlock tex={String.raw`X \mid \theta \sim \mathrm{Binomial}(N, \theta)`} />
      <MathBlock
        tex={String.raw`\theta \mid X \sim \mathrm{Beta}(\alpha + \text{heads}, \beta + \text{tails})`}
      />

      <h2>{cmn.sections.parameters}</h2>
      <div className="panel">
        <div className="controls">
          <Slider label={tr.slA} value={alpha} min={0.5} max={30} step={0.5} onChange={setAlpha} />
          <Slider label={tr.slB} value={beta} min={0.5} max={30} step={0.5} onChange={setBeta} />
          <Slider label={tr.slH} value={heads} min={0} max={200} step={1} onChange={setHeads} />
          <Slider label={tr.slT} value={tails} min={0} max={200} step={1} onChange={setTails} />
        </div>
        <div className="stats-grid">
          <StatCard label={tr.stA} value={postA.toFixed(2)} />
          <StatCard label={tr.stB} value={postB.toFixed(2)} />
          <StatCard label={tr.stMean} value={postMean.toFixed(4)} tone="good" />
          <StatCard label={tr.stSd} value={Math.sqrt(postVar).toFixed(4)} />
          <StatCard label={tr.stLo} value={ci95[0].toFixed(4)} />
          <StatCard label={tr.stHi} value={ci95[1].toFixed(4)} />
        </div>
      </div>

      <h2>{tr.chart}</h2>
      <Plot
        data={[
          {
            x: xs,
            y: prior,
            type: 'scatter',
            mode: 'lines',
            name: tr.legPrior(alpha, beta),
            line: { color: '#8aa0c5', dash: 'dot' },
          },
          {
            x: xs,
            y: posterior,
            type: 'scatter',
            mode: 'lines',
            fill: 'tozeroy',
            name: tr.legPost(postA, postB),
            line: { color: '#a78bfa' },
            fillcolor: 'rgba(167, 139, 250, 0.15)',
          },
        ]}
        layout={{ xaxis: { title: tr.axisTheta }, yaxis: { title: tr.axisDensity } }}
      />

      <h2>{cmn.sections.sampleCode}</h2>
      <CodeBlock
        code={`import numpy as np
from scipy import stats
import matplotlib.pyplot as plt

# Prior: Beta(alpha, beta)
alpha, beta_p = ${alpha}, ${beta}
heads, tails = ${heads}, ${tails}

# Posterior (conjugate, closed form)
post_a = alpha + heads
post_b = beta_p + tails

theta = np.linspace(0, 1, 200)
prior = stats.beta.pdf(theta, alpha, beta_p)
post = stats.beta.pdf(theta, post_a, post_b)

plt.plot(theta, prior, '--', label=f"Prior Beta({alpha},{beta_p})")
plt.plot(theta, post, label=f"Posterior Beta({post_a},{post_b})")
plt.xlabel("theta"); plt.ylabel("density"); plt.legend(); plt.show()

print("posterior mean:", post_a / (post_a + post_b))
print("95% CI:", stats.beta.ppf([0.025, 0.975], post_a, post_b))`}
      />
    </>
  );
}
