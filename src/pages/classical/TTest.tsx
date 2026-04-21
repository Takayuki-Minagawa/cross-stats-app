import { useMemo, useState } from 'react';
import { Plot } from '../../components/Plot';
import { Slider } from '../../components/Slider';
import { MathBlock } from '../../components/MathBlock';
import { CodeBlock } from '../../components/CodeBlock';
import { StatCard } from '../../components/StatCard';
import { mulberry32, sampleNormal } from '../../lib/random';
import { dt, linspace, welchTTest } from '../../lib/stats';

export function TTest() {
  const [n, setN] = useState(30);
  const [delta, setDelta] = useState(0.5);
  const [sigma, setSigma] = useState(1.0);
  const [seed, setSeed] = useState(42);

  const { sampleA, sampleB, result } = useMemo(() => {
    const rng = mulberry32(seed);
    const a = sampleNormal(rng, n, 0, sigma);
    const b = sampleNormal(rng, n, delta, sigma);
    return { sampleA: a, sampleB: b, result: welchTTest(a, b) };
  }, [n, delta, sigma, seed]);

  const xs = useMemo(() => linspace(-5, 5, 200), []);
  const tPdf = useMemo(() => xs.map((x) => dt(x, result.df)), [xs, result.df]);

  return (
    <>
      <h1>
        t 検定 <span className="tag classical">古典</span>
      </h1>
      <p className="lede">
        2 群の平均が等しいか否かを検定します。Welch の t 検定は等分散を仮定せず、サンプルサイズと群内分散から
        自由度を補正します。A/B テストの最も基礎的な道具です。
      </p>

      <h2>モデル</h2>
      <p>
        各群が独立に正規分布 <code>X_i ∼ N(μ_A, σ_A²)</code>、<code>Y_j ∼ N(μ_B, σ_B²)</code>{' '}
        に従うとき、帰無仮説 <code>H₀: μ_A = μ_B</code> のもとで次の統計量が近似的に t 分布に従います。
      </p>
      <MathBlock
        tex={String.raw`t = \frac{\bar{X} - \bar{Y}}{\sqrt{s_A^2/n_A + s_B^2/n_B}}, \quad \mathrm{df} = \frac{(s_A^2/n_A + s_B^2/n_B)^2}{\frac{(s_A^2/n_A)^2}{n_A - 1} + \frac{(s_B^2/n_B)^2}{n_B - 1}}`}
      />

      <h2>パラメータ操作</h2>
      <div className="panel">
        <div className="controls">
          <Slider
            label="各群のサンプルサイズ n"
            value={n}
            min={5}
            max={500}
            step={1}
            onChange={setN}
            tooltip="サンプルが増えるほど推定の分散が減り、p 値は小さくなりやすくなる"
          />
          <Slider
            label="真の平均差 μ_B − μ_A"
            value={delta}
            min={-2}
            max={2}
            step={0.05}
            onChange={setDelta}
            tooltip="効果量。0 に近いほど帰無仮説が真に近い"
          />
          <Slider
            label="各群の標準偏差 σ"
            value={sigma}
            min={0.2}
            max={3}
            step={0.05}
            onChange={setSigma}
          />
          <Slider
            label="乱数シード"
            value={seed}
            min={1}
            max={999}
            step={1}
            onChange={setSeed}
          />
        </div>
        <div className="stats-grid">
          <StatCard label="t 統計量" value={result.t.toFixed(3)} />
          <StatCard label="自由度" value={result.df.toFixed(1)} />
          <StatCard
            label="p 値"
            value={result.pValue.toFixed(4)}
            tone={result.pValue < 0.05 ? 'good' : 'warn'}
          />
          <StatCard label="平均差" value={result.meanDiff.toFixed(3)} />
          <StatCard
            label="95% CI 下限"
            value={result.ci[0].toFixed(3)}
          />
          <StatCard label="95% CI 上限" value={result.ci[1].toFixed(3)} />
        </div>
      </div>

      <h2>グラフ 1: 2 群のサンプル分布</h2>
      <Plot
        data={[
          {
            x: sampleA,
            type: 'histogram',
            name: '群 A',
            opacity: 0.6,
            marker: { color: '#38bdf8' },
            nbinsx: 25,
          },
          {
            x: sampleB,
            type: 'histogram',
            name: '群 B',
            opacity: 0.6,
            marker: { color: '#a78bfa' },
            nbinsx: 25,
          },
        ]}
        layout={{
          barmode: 'overlay',
          xaxis: { title: '値' },
          yaxis: { title: '頻度' },
        }}
      />

      <h2>グラフ 2: 帰無分布 (t) と観測 t</h2>
      <Plot
        data={[
          {
            x: xs,
            y: tPdf,
            type: 'scatter',
            mode: 'lines',
            name: `t(df=${result.df.toFixed(1)})`,
            line: { color: '#e6edf7' },
          },
          {
            x: [result.t, result.t],
            y: [0, Math.max(...tPdf) * 1.05],
            type: 'scatter',
            mode: 'lines',
            name: '観測 t',
            line: { color: '#f87171', dash: 'dash' },
          },
        ]}
        layout={{ xaxis: { title: 't' }, yaxis: { title: '密度' } }}
      />

      <h2>サンプルコード</h2>
      <CodeBlock
        code={`import numpy as np
from scipy import stats

rng = np.random.default_rng(${seed})
a = rng.normal(loc=0.0, scale=${sigma.toFixed(2)}, size=${n})
b = rng.normal(loc=${delta.toFixed(2)}, scale=${sigma.toFixed(2)}, size=${n})

# Welch の t 検定 (等分散を仮定しない)
t, p = stats.ttest_ind(a, b, equal_var=False)
print(f"t = {t:.3f}, p = {p:.4f}")

# 95% 信頼区間 (平均差)
se = np.sqrt(a.var(ddof=1)/len(a) + b.var(ddof=1)/len(b))
diff = a.mean() - b.mean()
df_num = (a.var(ddof=1)/len(a) + b.var(ddof=1)/len(b))**2
df_den = (a.var(ddof=1)/len(a))**2/(len(a)-1) + (b.var(ddof=1)/len(b))**2/(len(b)-1)
df = df_num / df_den
crit = stats.t.ppf(0.975, df)
print(f"95% CI: [{diff - crit*se:.3f}, {diff + crit*se:.3f}]")`}
      />
    </>
  );
}

