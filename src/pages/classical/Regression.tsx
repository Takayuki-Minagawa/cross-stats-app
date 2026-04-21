import { useMemo, useState } from 'react';
import { Plot } from '../../components/Plot';
import { Slider } from '../../components/Slider';
import { MathBlock } from '../../components/MathBlock';
import { CodeBlock } from '../../components/CodeBlock';
import { StatCard } from '../../components/StatCard';
import { mulberry32, randn } from '../../lib/random';
import { ols } from '../../lib/stats';

export function Regression() {
  const [n, setN] = useState(80);
  const [beta0, setBeta0] = useState(1.0);
  const [beta1, setBeta1] = useState(2.0);
  const [beta2, setBeta2] = useState(-1.5);
  const [noise, setNoise] = useState(1.0);
  const [collinearity, setCollinearity] = useState(0.0);
  const [seed, setSeed] = useState(7);

  const { y, result } = useMemo(() => {
    const rng = mulberry32(seed);
    const Xs: number[][] = [];
    const ys: number[] = [];
    for (let i = 0; i < n; i++) {
      const x1 = randn(rng);
      const x2 = collinearity * x1 + Math.sqrt(1 - collinearity * collinearity) * randn(rng);
      const yi = beta0 + beta1 * x1 + beta2 * x2 + noise * randn(rng);
      Xs.push([1, x1, x2]);
      ys.push(yi);
    }
    return { y: ys, result: ols(Xs, ys) };
  }, [n, beta0, beta1, beta2, noise, collinearity, seed]);

  return (
    <>
      <h1>
        重回帰分析 (最小二乗法) <span className="tag classical">古典</span>
      </h1>
      <p className="lede">
        2 つの説明変数で目的変数を予測する重回帰。
        <span className="tooltip" data-tip="説明変数同士の相関が強い状態。係数の SE が膨らみ推定が不安定になる">
          多重共線性
        </span>
        をスライダーで誘起し、推定の安定性がどう変化するかを観察してみましょう。
      </p>

      <h2>モデル</h2>
      <MathBlock
        tex={String.raw`y_i = \beta_0 + \beta_1 x_{i1} + \beta_2 x_{i2} + \varepsilon_i, \quad \varepsilon_i \sim N(0, \sigma^2)`}
      />
      <MathBlock tex={String.raw`\hat{\beta} = (X^\top X)^{-1} X^\top y`} />

      <h2>パラメータ操作</h2>
      <div className="panel">
        <div className="controls">
          <Slider label="サンプルサイズ n" value={n} min={20} max={500} step={1} onChange={setN} />
          <Slider label="真 β₀ (切片)" value={beta0} min={-3} max={3} step={0.05} onChange={setBeta0} />
          <Slider label="真 β₁" value={beta1} min={-3} max={3} step={0.05} onChange={setBeta1} />
          <Slider label="真 β₂" value={beta2} min={-3} max={3} step={0.05} onChange={setBeta2} />
          <Slider label="ノイズ σ" value={noise} min={0.1} max={3} step={0.05} onChange={setNoise} />
          <Slider
            label="x₁ と x₂ の相関 ρ"
            value={collinearity}
            min={-0.98}
            max={0.98}
            step={0.02}
            onChange={setCollinearity}
            tooltip="|ρ| が 1 に近いほど多重共線性が強くなる"
          />
          <Slider label="乱数シード" value={seed} min={1} max={999} step={1} onChange={setSeed} />
        </div>
        <div className="stats-grid">
          <StatCard label="推定 β₀" value={result.coef[0].toFixed(3)} />
          <StatCard label="推定 β₁" value={result.coef[1].toFixed(3)} />
          <StatCard label="推定 β₂" value={result.coef[2].toFixed(3)} />
          <StatCard label="β₁ SE" value={result.se[1].toFixed(3)} />
          <StatCard label="β₂ SE" value={result.se[2].toFixed(3)} />
          <StatCard label="R²" value={result.r2.toFixed(3)} tone="good" />
          <StatCard label="残差 σ" value={result.sigma.toFixed(3)} />
          <StatCard
            label="β₁ p 値"
            value={result.pValues[1].toFixed(4)}
            tone={result.pValues[1] < 0.05 ? 'good' : 'warn'}
          />
          <StatCard
            label="β₂ p 値"
            value={result.pValues[2].toFixed(4)}
            tone={result.pValues[2] < 0.05 ? 'good' : 'warn'}
          />
        </div>
      </div>

      <h2>グラフ 1: 観測値 vs 予測値</h2>
      <Plot
        data={[
          {
            x: result.fitted,
            y,
            mode: 'markers',
            type: 'scatter',
            name: 'データ',
            marker: { color: '#38bdf8', size: 6 },
          },
          {
            x: [Math.min(...result.fitted), Math.max(...result.fitted)],
            y: [Math.min(...result.fitted), Math.max(...result.fitted)],
            mode: 'lines',
            type: 'scatter',
            name: 'y = ŷ',
            line: { color: '#e6edf7', dash: 'dash' },
          },
        ]}
        layout={{ xaxis: { title: '予測 ŷ' }, yaxis: { title: '観測 y' } }}
      />

      <h2>グラフ 2: 係数の 95% 信頼区間</h2>
      <Plot
        data={[
          {
            x: ['β₀', 'β₁', 'β₂'],
            y: result.coef,
            error_y: {
              type: 'data',
              symmetric: false,
              array: result.ci.map((c, i) => c[1] - result.coef[i]),
              arrayminus: result.ci.map((c, i) => result.coef[i] - c[0]),
            },
            mode: 'markers',
            type: 'scatter',
            marker: { size: 10, color: '#a78bfa' },
            name: '推定±95%CI',
          },
          {
            x: ['β₀', 'β₁', 'β₂'],
            y: [beta0, beta1, beta2],
            mode: 'markers',
            type: 'scatter',
            marker: { size: 12, color: '#34d399', symbol: 'cross' },
            name: '真値',
          },
        ]}
        layout={{ yaxis: { title: '係数値' } }}
      />

      <h2>サンプルコード</h2>
      <CodeBlock
        code={`import numpy as np
import pandas as pd
import statsmodels.api as sm

rng = np.random.default_rng(${seed})
n = ${n}
x1 = rng.standard_normal(n)
x2 = ${collinearity.toFixed(2)} * x1 + np.sqrt(1 - ${collinearity.toFixed(2)}**2) * rng.standard_normal(n)
y = ${beta0.toFixed(2)} + ${beta1.toFixed(2)} * x1 + ${beta2.toFixed(2)} * x2 + ${noise.toFixed(2)} * rng.standard_normal(n)

X = sm.add_constant(np.column_stack([x1, x2]))
model = sm.OLS(y, X).fit()
print(model.summary())

# 95% 信頼区間
print(model.conf_int(alpha=0.05))`}
      />
    </>
  );
}
