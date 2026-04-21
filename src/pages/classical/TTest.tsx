import { useMemo, useState } from 'react';
import { Plot } from '../../components/Plot';
import { Slider } from '../../components/Slider';
import { MathBlock } from '../../components/MathBlock';
import { CodeBlock } from '../../components/CodeBlock';
import { StatCard } from '../../components/StatCard';
import { mulberry32, sampleNormal } from '../../lib/random';
import { dt, linspace, welchTTest } from '../../lib/stats';
import { useLang } from '../../i18n';
import { t as commonT } from '../../i18n/common';

const text = {
  ja: {
    title: 't 検定',
    lede: '2 群の平均が等しいか否かを検定します。Welch の t 検定は等分散を仮定せず、サンプルサイズと群内分散から自由度を補正します。A/B テストの最も基礎的な道具です。',
    modelDesc:
      '各群が独立に正規分布 X_i ∼ N(μ_A, σ_A²)、Y_j ∼ N(μ_B, σ_B²) に従うとき、帰無仮説 H₀: μ_A = μ_B のもとで次の統計量が近似的に t 分布に従います。',
    slN: '各群のサンプルサイズ n',
    slNTip: 'サンプルが増えるほど推定の分散が減り、p 値は小さくなりやすくなる',
    slDelta: '真の平均差 μ_B − μ_A',
    slDeltaTip: '効果量。0 に近いほど帰無仮説が真に近い',
    slSigma: '各群の標準偏差 σ',
    stT: 't 統計量',
    stDf: '自由度',
    stP: 'p 値',
    stDiff: '平均差',
    stCiLo: '95% CI 下限',
    stCiHi: '95% CI 上限',
    chart1: 'グラフ 1: 2 群のサンプル分布',
    chart2: 'グラフ 2: 帰無分布 (t) と観測 t',
    axisValue: '値',
    axisFreq: '頻度',
    axisDensity: '密度',
    legGroup: (s: string) => `群 ${s}`,
    legObs: '観測 t',
  },
  en: {
    title: 't-test',
    lede: "Test whether two group means differ. Welch's t-test does not assume equal variances and adjusts the degrees of freedom from each group's sample size and variance. It is the most fundamental tool for A/B testing.",
    modelDesc:
      'When each group independently follows a normal distribution X_i ~ N(μ_A, σ_A²), Y_j ~ N(μ_B, σ_B²), the statistic below approximately follows a t distribution under H₀: μ_A = μ_B.',
    slN: 'Sample size per group n',
    slNTip: 'Larger samples reduce estimation variance and tend to produce smaller p-values',
    slDelta: 'True mean difference μ_B − μ_A',
    slDeltaTip: 'Effect size. Values near 0 correspond to the null hypothesis being true',
    slSigma: 'Standard deviation per group σ',
    stT: 't statistic',
    stDf: 'df',
    stP: 'p value',
    stDiff: 'Mean diff.',
    stCiLo: '95% CI lower',
    stCiHi: '95% CI upper',
    chart1: 'Graph 1: Sample distributions of the two groups',
    chart2: 'Graph 2: Null distribution (t) and observed t',
    axisValue: 'Value',
    axisFreq: 'Frequency',
    axisDensity: 'Density',
    legGroup: (s: string) => `Group ${s}`,
    legObs: 'Observed t',
  },
} as const;

export function TTest() {
  const { lang } = useLang();
  const tr = text[lang];
  const cmn = commonT(lang);
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
        {tr.title} <span className="tag classical">{cmn.tags.classical}</span>
      </h1>
      <p className="lede">{tr.lede}</p>

      <h2>{cmn.sections.model}</h2>
      <p>{tr.modelDesc}</p>
      <MathBlock
        tex={String.raw`t = \frac{\bar{X} - \bar{Y}}{\sqrt{s_A^2/n_A + s_B^2/n_B}}, \quad \mathrm{df} = \frac{(s_A^2/n_A + s_B^2/n_B)^2}{\frac{(s_A^2/n_A)^2}{n_A - 1} + \frac{(s_B^2/n_B)^2}{n_B - 1}}`}
      />

      <h2>{cmn.sections.parameters}</h2>
      <div className="panel">
        <div className="controls">
          <Slider label={tr.slN} value={n} min={5} max={500} step={1} onChange={setN} tooltip={tr.slNTip} />
          <Slider
            label={tr.slDelta}
            value={delta}
            min={-2}
            max={2}
            step={0.05}
            onChange={setDelta}
            tooltip={tr.slDeltaTip}
          />
          <Slider label={tr.slSigma} value={sigma} min={0.2} max={3} step={0.05} onChange={setSigma} />
          <Slider label={cmn.seed} value={seed} min={1} max={999} step={1} onChange={setSeed} />
        </div>
        <div className="stats-grid">
          <StatCard label={tr.stT} value={result.t.toFixed(3)} />
          <StatCard label={tr.stDf} value={result.df.toFixed(1)} />
          <StatCard
            label={tr.stP}
            value={result.pValue.toFixed(4)}
            tone={result.pValue < 0.05 ? 'good' : 'warn'}
          />
          <StatCard label={tr.stDiff} value={result.meanDiff.toFixed(3)} />
          <StatCard label={tr.stCiLo} value={result.ci[0].toFixed(3)} />
          <StatCard label={tr.stCiHi} value={result.ci[1].toFixed(3)} />
        </div>
      </div>

      <h2>{tr.chart1}</h2>
      <Plot
        data={[
          {
            x: sampleA,
            type: 'histogram',
            name: tr.legGroup('A'),
            opacity: 0.6,
            marker: { color: '#38bdf8' },
            nbinsx: 25,
          },
          {
            x: sampleB,
            type: 'histogram',
            name: tr.legGroup('B'),
            opacity: 0.6,
            marker: { color: '#a78bfa' },
            nbinsx: 25,
          },
        ]}
        layout={{
          barmode: 'overlay',
          xaxis: { title: tr.axisValue },
          yaxis: { title: tr.axisFreq },
        }}
      />

      <h2>{tr.chart2}</h2>
      <Plot
        data={[
          {
            x: xs,
            y: tPdf,
            type: 'scatter',
            mode: 'lines',
            name: `t(df=${result.df.toFixed(1)})`,
          },
          {
            x: [result.t, result.t],
            y: [0, Math.max(...tPdf) * 1.05],
            type: 'scatter',
            mode: 'lines',
            name: tr.legObs,
            line: { color: '#f87171', dash: 'dash' },
          },
        ]}
        layout={{ xaxis: { title: 't' }, yaxis: { title: tr.axisDensity } }}
      />

      <h2>{cmn.sections.sampleCode}</h2>
      <CodeBlock
        code={`import numpy as np
from scipy import stats

rng = np.random.default_rng(${seed})
a = rng.normal(loc=0.0, scale=${sigma.toFixed(2)}, size=${n})
b = rng.normal(loc=${delta.toFixed(2)}, scale=${sigma.toFixed(2)}, size=${n})

# Welch's t-test (does not assume equal variances)
t, p = stats.ttest_ind(a, b, equal_var=False)
print(f"t = {t:.3f}, p = {p:.4f}")

# 95% CI for the mean difference
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
