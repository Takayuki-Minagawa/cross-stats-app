import { useMemo, useState } from 'react';
import { Plot } from '../../components/Plot';
import { Slider } from '../../components/Slider';
import { MathBlock } from '../../components/MathBlock';
import { CodeBlock } from '../../components/CodeBlock';
import { StatCard } from '../../components/StatCard';
import { dbeta, linspace, qbeta } from '../../lib/stats';

export function CoinFlip() {
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
  const ci95: [number, number] = [
    qbeta(0.025, postA, postB),
    qbeta(0.975, postA, postB),
  ];

  return (
    <>
      <h1>
        コインのベイズ更新 <span className="tag bayes">ベイズ</span>
      </h1>
      <p className="lede">
        ベータ分布を事前分布、二項分布を尤度としたベイズ更新の古典的例題です。
        <span className="tooltip" data-tip="尤度の形と同じ分布族になる事前分布。計算が閉形式で済む">
          共役事前分布
        </span>
        ゆえ事後分布は再びベータ分布になり、更新が極めてシンプルに定式化できます。
      </p>

      <h2>モデル</h2>
      <MathBlock tex={String.raw`\theta \sim \mathrm{Beta}(\alpha, \beta)`} />
      <MathBlock tex={String.raw`X \mid \theta \sim \mathrm{Binomial}(N, \theta)`} />
      <MathBlock
        tex={String.raw`\theta \mid X \sim \mathrm{Beta}(\alpha + \text{表}, \beta + \text{裏})`}
      />

      <h2>パラメータ操作</h2>
      <div className="panel">
        <div className="controls">
          <Slider
            label="事前 α (表に期待する数)"
            value={alpha}
            min={0.5}
            max={30}
            step={0.5}
            onChange={setAlpha}
          />
          <Slider
            label="事前 β (裏に期待する数)"
            value={beta}
            min={0.5}
            max={30}
            step={0.5}
            onChange={setBeta}
          />
          <Slider
            label="観測された表の回数"
            value={heads}
            min={0}
            max={200}
            step={1}
            onChange={setHeads}
          />
          <Slider
            label="観測された裏の回数"
            value={tails}
            min={0}
            max={200}
            step={1}
            onChange={setTails}
          />
        </div>
        <div className="stats-grid">
          <StatCard label="事後 α" value={postA.toFixed(2)} />
          <StatCard label="事後 β" value={postB.toFixed(2)} />
          <StatCard label="事後平均 E[θ|x]" value={postMean.toFixed(4)} tone="good" />
          <StatCard label="事後 SD" value={Math.sqrt(postVar).toFixed(4)} />
          <StatCard label="95% 下限" value={ci95[0].toFixed(4)} />
          <StatCard label="95% 上限" value={ci95[1].toFixed(4)} />
        </div>
      </div>

      <h2>グラフ: 事前分布 → 事後分布</h2>
      <Plot
        data={[
          {
            x: xs,
            y: prior,
            type: 'scatter',
            mode: 'lines',
            name: `事前 Beta(${alpha}, ${beta})`,
            line: { color: '#8aa0c5', dash: 'dot' },
          },
          {
            x: xs,
            y: posterior,
            type: 'scatter',
            mode: 'lines',
            fill: 'tozeroy',
            name: `事後 Beta(${postA.toFixed(1)}, ${postB.toFixed(1)})`,
            line: { color: '#a78bfa' },
            fillcolor: 'rgba(167, 139, 250, 0.15)',
          },
        ]}
        layout={{ xaxis: { title: 'θ (表が出る確率)' }, yaxis: { title: '密度' } }}
      />

      <h2>サンプルコード</h2>
      <CodeBlock
        code={`import numpy as np
from scipy import stats
import matplotlib.pyplot as plt

# 事前分布 Beta(alpha, beta)
alpha, beta_p = ${alpha}, ${beta}
heads, tails = ${heads}, ${tails}

# 事後分布 (共役事前分布のため閉形式)
post_a = alpha + heads
post_b = beta_p + tails

theta = np.linspace(0, 1, 200)
prior = stats.beta.pdf(theta, alpha, beta_p)
post = stats.beta.pdf(theta, post_a, post_b)

plt.plot(theta, prior, '--', label=f"Prior Beta({alpha},{beta_p})")
plt.plot(theta, post, label=f"Posterior Beta({post_a},{post_b})")
plt.xlabel("θ"); plt.ylabel("density"); plt.legend(); plt.show()

# 要約統計
print("posterior mean:", post_a / (post_a + post_b))
print("95% CI:", stats.beta.ppf([0.025, 0.975], post_a, post_b))`}
      />
    </>
  );
}
