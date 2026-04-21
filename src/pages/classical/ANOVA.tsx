import { useMemo, useState } from 'react';
import { Plot } from '../../components/Plot';
import { Slider } from '../../components/Slider';
import { MathBlock } from '../../components/MathBlock';
import { CodeBlock } from '../../components/CodeBlock';
import { StatCard } from '../../components/StatCard';
import { mulberry32, sampleNormal } from '../../lib/random';
import { df as dfPdf, linspace, oneWayAnova } from '../../lib/stats';

export function ANOVA() {
  const [n, setN] = useState(20);
  const [mu1, setMu1] = useState(0);
  const [mu2, setMu2] = useState(0.5);
  const [mu3, setMu3] = useState(1.0);
  const [sigma, setSigma] = useState(1.0);
  const [seed, setSeed] = useState(1);

  const { groups, result } = useMemo(() => {
    const rng = mulberry32(seed);
    const g = [
      sampleNormal(rng, n, mu1, sigma),
      sampleNormal(rng, n, mu2, sigma),
      sampleNormal(rng, n, mu3, sigma),
    ];
    return { groups: g, result: oneWayAnova(g) };
  }, [n, mu1, mu2, mu3, sigma, seed]);

  const xs = useMemo(() => linspace(0.001, 8, 200), []);
  const fPdfCurve = useMemo(
    () => xs.map((x) => dfPdf(x, result.df1, result.df2)),
    [xs, result.df1, result.df2],
  );

  return (
    <>
      <h1>
        分散分析 (ANOVA) <span className="tag classical">古典</span>
      </h1>
      <p className="lede">
        3 群以上の平均に差があるかを F 統計量で一括検定します。
        <span className="tooltip" data-tip="全てのペア比較の t 検定を繰り返すと偽陽性率が膨らむ (多重比較問題)">
          多重比較問題
        </span>
        を回避するための基本道具です。
      </p>

      <h2>モデル</h2>
      <MathBlock
        tex={String.raw`F = \frac{\text{群間分散}}{\text{群内分散}} = \frac{\text{SS}_{B} / (k-1)}{\text{SS}_{W} / (N-k)}, \quad F \sim F_{k-1, N-k}`}
      />
      <p>
        各群の効果が等しい (<code>H₀</code>) とき、F は自由度{' '}
        <code>(k−1, N−k)</code> の F 分布に従います。観測 F が右裾に入れば群間差が有意。
      </p>

      <h2>パラメータ操作</h2>
      <div className="panel">
        <div className="controls">
          <Slider label="群あたりサンプルサイズ n" value={n} min={5} max={200} step={1} onChange={setN} />
          <Slider label="群 1 の真の平均 μ₁" value={mu1} min={-2} max={2} step={0.05} onChange={setMu1} />
          <Slider label="群 2 の真の平均 μ₂" value={mu2} min={-2} max={2} step={0.05} onChange={setMu2} />
          <Slider label="群 3 の真の平均 μ₃" value={mu3} min={-2} max={2} step={0.05} onChange={setMu3} />
          <Slider label="共通標準偏差 σ" value={sigma} min={0.2} max={3} step={0.05} onChange={setSigma} />
          <Slider label="乱数シード" value={seed} min={1} max={999} step={1} onChange={setSeed} />
        </div>
        <div className="stats-grid">
          <StatCard label="F 統計量" value={result.f.toFixed(3)} />
          <StatCard label="自由度" value={`${result.df1}, ${result.df2}`} />
          <StatCard
            label="p 値"
            value={result.pValue.toFixed(4)}
            tone={result.pValue < 0.05 ? 'good' : 'warn'}
          />
          <StatCard label="SS 群間" value={result.ssBetween.toFixed(2)} />
          <StatCard label="SS 群内" value={result.ssWithin.toFixed(2)} />
          <StatCard label="総平均" value={result.grandMean.toFixed(3)} />
        </div>
      </div>

      <h2>グラフ 1: 群ごとの箱ひげ</h2>
      <Plot
        data={groups.map((g, i) => ({
          y: g,
          type: 'box',
          name: `群 ${i + 1}`,
          boxmean: true,
          marker: { color: ['#38bdf8', '#a78bfa', '#34d399'][i] },
        }))}
        layout={{ yaxis: { title: '値' } }}
      />

      <h2>グラフ 2: 帰無分布 (F) と観測 F</h2>
      <Plot
        data={[
          {
            x: xs,
            y: fPdfCurve,
            type: 'scatter',
            mode: 'lines',
            name: `F(${result.df1}, ${result.df2})`,
            line: { color: '#e6edf7' },
          },
          {
            x: [result.f, result.f],
            y: [0, Math.max(...fPdfCurve) * 1.05],
            type: 'scatter',
            mode: 'lines',
            name: '観測 F',
            line: { color: '#f87171', dash: 'dash' },
          },
        ]}
        layout={{ xaxis: { title: 'F' }, yaxis: { title: '密度' } }}
      />

      <h2>サンプルコード</h2>
      <CodeBlock
        code={`import numpy as np
from scipy import stats

rng = np.random.default_rng(${seed})
g1 = rng.normal(${mu1.toFixed(2)}, ${sigma.toFixed(2)}, size=${n})
g2 = rng.normal(${mu2.toFixed(2)}, ${sigma.toFixed(2)}, size=${n})
g3 = rng.normal(${mu3.toFixed(2)}, ${sigma.toFixed(2)}, size=${n})

F, p = stats.f_oneway(g1, g2, g3)
print(f"F = {F:.3f}, p = {p:.4f}")

# statsmodels で ANOVA 表を詳細に見る場合
import pandas as pd
import statsmodels.api as sm
from statsmodels.formula.api import ols

df = pd.DataFrame({
    'y': np.concatenate([g1, g2, g3]),
    'group': np.repeat(['A', 'B', 'C'], ${n}),
})
model = ols('y ~ C(group)', data=df).fit()
print(sm.stats.anova_lm(model, typ=2))`}
      />
    </>
  );
}
