import { useMemo, useState } from 'react';
import { Plot } from '../../components/Plot';
import { Slider } from '../../components/Slider';
import { MathBlock } from '../../components/MathBlock';
import { CodeBlock } from '../../components/CodeBlock';
import { StatCard } from '../../components/StatCard';
import { mulberry32, randn } from '../../lib/random';
import { ols } from '../../lib/stats';
import { useLang } from '../../i18n';
import { t as commonT } from '../../i18n/common';

const text = {
  ja: {
    title: '重回帰分析 (最小二乗法)',
    ledePrefix: '2 つの説明変数で目的変数を予測する重回帰。',
    collinTerm: '多重共線性',
    collinTip: '説明変数同士の相関が強い状態。係数の SE が膨らみ推定が不安定になる',
    ledeSuffix: 'をスライダーで誘起し、推定の安定性がどう変化するかを観察してみましょう。',
    slN: 'サンプルサイズ n',
    slB0: '真 β₀ (切片)',
    slB1: '真 β₁',
    slB2: '真 β₂',
    slNoise: 'ノイズ σ',
    slRho: 'x₁ と x₂ の相関 ρ',
    slRhoTip: '|ρ| が 1 に近いほど多重共線性が強くなる',
    stB0: '推定 β₀',
    stB1: '推定 β₁',
    stB2: '推定 β₂',
    stSe1: 'β₁ SE',
    stSe2: 'β₂ SE',
    stR2: 'R²',
    stSigma: '残差 σ',
    stP1: 'β₁ p 値',
    stP2: 'β₂ p 値',
    chart1: 'グラフ 1: 観測値 vs 予測値',
    chart2: 'グラフ 2: 係数の 95% 信頼区間',
    axisFitted: '予測 ŷ',
    axisObs: '観測 y',
    axisCoef: '係数値',
    legData: 'データ',
    legIdent: 'y = ŷ',
    legEst: '推定±95%CI',
    legTrue: '真値',
  },
  en: {
    title: 'Multiple Regression (OLS)',
    ledePrefix: 'Multiple regression predicting an outcome from two predictors. Induce ',
    collinTerm: 'multicollinearity',
    collinTip: 'Strong correlation between predictors inflates coefficient SE and destabilizes estimates',
    ledeSuffix: ' with the slider and observe how estimation stability changes.',
    slN: 'Sample size n',
    slB0: 'True β₀ (intercept)',
    slB1: 'True β₁',
    slB2: 'True β₂',
    slNoise: 'Noise σ',
    slRho: 'Correlation ρ between x₁ and x₂',
    slRhoTip: 'Stronger |ρ| implies stronger multicollinearity',
    stB0: 'Estimated β₀',
    stB1: 'Estimated β₁',
    stB2: 'Estimated β₂',
    stSe1: 'β₁ SE',
    stSe2: 'β₂ SE',
    stR2: 'R²',
    stSigma: 'Residual σ',
    stP1: 'β₁ p value',
    stP2: 'β₂ p value',
    chart1: 'Graph 1: Observed vs. fitted',
    chart2: 'Graph 2: 95% CI for each coefficient',
    axisFitted: 'Fitted ŷ',
    axisObs: 'Observed y',
    axisCoef: 'Coefficient',
    legData: 'Data',
    legIdent: 'y = ŷ',
    legEst: 'Estimate ± 95% CI',
    legTrue: 'True value',
  },
} as const;

export function Regression() {
  const { lang } = useLang();
  const tr = text[lang];
  const cmn = commonT(lang);

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
        {tr.title} <span className="tag classical">{cmn.tags.classical}</span>
      </h1>
      <p className="lede">
        {tr.ledePrefix}
        <span className="tooltip" data-tip={tr.collinTip}>
          {tr.collinTerm}
        </span>
        {tr.ledeSuffix}
      </p>

      <h2>{cmn.sections.model}</h2>
      <MathBlock
        tex={String.raw`y_i = \beta_0 + \beta_1 x_{i1} + \beta_2 x_{i2} + \varepsilon_i, \quad \varepsilon_i \sim N(0, \sigma^2)`}
      />
      <MathBlock tex={String.raw`\hat{\beta} = (X^\top X)^{-1} X^\top y`} />

      <h2>{cmn.sections.parameters}</h2>
      <div className="panel">
        <div className="controls">
          <Slider label={tr.slN} value={n} min={20} max={500} step={1} onChange={setN} />
          <Slider label={tr.slB0} value={beta0} min={-3} max={3} step={0.05} onChange={setBeta0} />
          <Slider label={tr.slB1} value={beta1} min={-3} max={3} step={0.05} onChange={setBeta1} />
          <Slider label={tr.slB2} value={beta2} min={-3} max={3} step={0.05} onChange={setBeta2} />
          <Slider label={tr.slNoise} value={noise} min={0.1} max={3} step={0.05} onChange={setNoise} />
          <Slider
            label={tr.slRho}
            value={collinearity}
            min={-0.98}
            max={0.98}
            step={0.02}
            onChange={setCollinearity}
            tooltip={tr.slRhoTip}
          />
          <Slider label={cmn.seed} value={seed} min={1} max={999} step={1} onChange={setSeed} />
        </div>
        <div className="stats-grid">
          <StatCard label={tr.stB0} value={result.coef[0].toFixed(3)} />
          <StatCard label={tr.stB1} value={result.coef[1].toFixed(3)} />
          <StatCard label={tr.stB2} value={result.coef[2].toFixed(3)} />
          <StatCard label={tr.stSe1} value={result.se[1].toFixed(3)} />
          <StatCard label={tr.stSe2} value={result.se[2].toFixed(3)} />
          <StatCard label={tr.stR2} value={result.r2.toFixed(3)} tone="good" />
          <StatCard label={tr.stSigma} value={result.sigma.toFixed(3)} />
          <StatCard
            label={tr.stP1}
            value={result.pValues[1].toFixed(4)}
            tone={result.pValues[1] < 0.05 ? 'good' : 'warn'}
          />
          <StatCard
            label={tr.stP2}
            value={result.pValues[2].toFixed(4)}
            tone={result.pValues[2] < 0.05 ? 'good' : 'warn'}
          />
        </div>
      </div>

      <h2>{tr.chart1}</h2>
      <Plot
        data={[
          {
            x: result.fitted,
            y,
            mode: 'markers',
            type: 'scatter',
            name: tr.legData,
            marker: { color: '#38bdf8', size: 6 },
          },
          {
            x: [Math.min(...result.fitted), Math.max(...result.fitted)],
            y: [Math.min(...result.fitted), Math.max(...result.fitted)],
            mode: 'lines',
            type: 'scatter',
            name: tr.legIdent,
            line: { dash: 'dash' },
          },
        ]}
        layout={{ xaxis: { title: tr.axisFitted }, yaxis: { title: tr.axisObs } }}
      />

      <h2>{tr.chart2}</h2>
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
            name: tr.legEst,
          },
          {
            x: ['β₀', 'β₁', 'β₂'],
            y: [beta0, beta1, beta2],
            mode: 'markers',
            type: 'scatter',
            marker: { size: 12, color: '#34d399', symbol: 'cross' },
            name: tr.legTrue,
          },
        ]}
        layout={{ yaxis: { title: tr.axisCoef } }}
      />

      <h2>{cmn.sections.sampleCode}</h2>
      <CodeBlock
        code={`import numpy as np
import statsmodels.api as sm

rng = np.random.default_rng(${seed})
n = ${n}
x1 = rng.standard_normal(n)
x2 = ${collinearity.toFixed(2)} * x1 + np.sqrt(1 - ${collinearity.toFixed(2)}**2) * rng.standard_normal(n)
y = ${beta0.toFixed(2)} + ${beta1.toFixed(2)} * x1 + ${beta2.toFixed(2)} * x2 + ${noise.toFixed(2)} * rng.standard_normal(n)

X = sm.add_constant(np.column_stack([x1, x2]))
model = sm.OLS(y, X).fit()
print(model.summary())
print(model.conf_int(alpha=0.05))`}
      />
    </>
  );
}
