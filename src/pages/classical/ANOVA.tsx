import { useMemo, useState } from 'react';
import { Plot } from '../../components/Plot';
import { Slider, SeedSlider } from '../../components/Slider';
import { PageHeader } from '../../components/PageHeader';
import { PageNav } from '../../components/PageNav';
import { Missions } from '../../components/Missions';
import { Verdict } from '../../components/Verdict';
import { MathBlock } from '../../components/MathBlock';
import { CodeBlock } from '../../components/CodeBlock';
import { StatCard } from '../../components/StatCard';
import { mulberry32, sampleNormal } from '../../lib/random';
import { df as dfPdf, linspace, oneWayAnova } from '../../lib/stats';
import { useLang } from '../../i18n';
import { t as commonT } from '../../i18n/common';

const text = {
  ja: {
    title: '分散分析 (ANOVA)',
    ledePrefix: '3 群以上の平均に差があるかを F 統計量で一括検定します。',
    multiCompare: '多重比較問題',
    multiCompareTip: '全てのペア比較の t 検定を繰り返すと偽陽性率が膨らむ (多重比較問題)',
    ledeSuffix: 'を回避するための基本道具です。',
    modelP:
      '各群の効果が等しい (H₀) とき、F は自由度 (k−1, N−k) の F 分布に従います。観測 F が右裾に入れば群間差が有意。',
    slN: '群あたりサンプルサイズ n',
    slMu1: '群 1 の真の平均 μ₁',
    slMu2: '群 2 の真の平均 μ₂',
    slMu3: '群 3 の真の平均 μ₃',
    slSigma: '共通標準偏差 σ',
    stF: 'F 統計量',
    stDf: '自由度',
    stP: 'p 値',
    stSsB: 'SS 群間',
    stSsW: 'SS 群内',
    stGm: '総平均',
    chart1: 'グラフ 1: 群ごとの箱ひげ',
    chart2: 'グラフ 2: 帰無分布 (F) と観測 F',
    axisValue: '値',
    axisDensity: '密度',
    legGroup: (i: number) => `群 ${i}`,
    legObs: '観測 F',
    verdictSig: (p: string) => `p = ${p} < 0.05 → 少なくとも 1 つの群の平均が他と異なります (有意)`,
    verdictNs: (p: string) => `p = ${p} ≥ 0.05 → 群間の差は偶然の範囲内かもしれません (有意でない)`,
    m1: 'F 統計量を 15 より大きくしよう',
    m2: '3 群の真の平均をすべて同じにしたまま有意になるシードを探そう',
    m3: '真の平均の最大差が 0.3 以下なのに有意 (p < 0.05) にしよう',
  },
  en: {
    title: 'ANOVA',
    ledePrefix:
      'Test mean differences across three or more groups in one shot with the F statistic. It is the basic tool to avoid the ',
    multiCompare: 'multiple-comparison problem',
    multiCompareTip: 'Repeating pairwise t-tests inflates the false-positive rate',
    ledeSuffix: '.',
    modelP:
      'Under H₀ (equal group effects), F follows an F distribution with (k−1, N−k) degrees of freedom. A right-tail observed F indicates a significant group difference.',
    slN: 'Sample size per group n',
    slMu1: 'True mean μ₁ of group 1',
    slMu2: 'True mean μ₂ of group 2',
    slMu3: 'True mean μ₃ of group 3',
    slSigma: 'Common SD σ',
    stF: 'F statistic',
    stDf: 'df',
    stP: 'p value',
    stSsB: 'SS between',
    stSsW: 'SS within',
    stGm: 'Grand mean',
    chart1: 'Graph 1: Box plot per group',
    chart2: 'Graph 2: Null distribution (F) and observed F',
    axisValue: 'Value',
    axisDensity: 'Density',
    legGroup: (i: number) => `Group ${i}`,
    legObs: 'Observed F',
    verdictSig: (p: string) => `p = ${p} < 0.05 → at least one group mean differs (significant)`,
    verdictNs: (p: string) => `p = ${p} ≥ 0.05 → differences may be due to chance (not significant)`,
    m1: 'Push the F statistic above 15',
    m2: 'Set all true means equal and find a seed that is still significant',
    m3: 'Reach p < 0.05 while the largest true mean gap is ≤ 0.3',
  },
} as const;

export function ANOVA() {
  const { lang } = useLang();
  const tr = text[lang];
  const cmn = commonT(lang);

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
      <PageHeader
        topic="anova"
        title={tr.title}
        lede={
          <>
            {tr.ledePrefix}
            <span className="tooltip" data-tip={tr.multiCompareTip}>
              {tr.multiCompare}
            </span>
            {tr.ledeSuffix}
          </>
        }
      />

      <h2>{cmn.sections.model}</h2>
      <MathBlock
        tex={String.raw`F = \frac{\text{SS}_{B} / (k-1)}{\text{SS}_{W} / (N-k)}, \quad F \sim F_{k-1, N-k}`}
      />
      <p>{tr.modelP}</p>

      <h2>{cmn.sections.parameters}</h2>
      <div className="panel">
        <div className="controls">
          <Slider label={tr.slN} value={n} min={5} max={200} step={1} onChange={setN} />
          <Slider label={tr.slMu1} value={mu1} min={-2} max={2} step={0.05} onChange={setMu1} />
          <Slider label={tr.slMu2} value={mu2} min={-2} max={2} step={0.05} onChange={setMu2} />
          <Slider label={tr.slMu3} value={mu3} min={-2} max={2} step={0.05} onChange={setMu3} />
          <Slider label={tr.slSigma} value={sigma} min={0.2} max={3} step={0.05} onChange={setSigma} />
          <SeedSlider value={seed} onChange={setSeed} />
        </div>
        {result.pValue < 0.05 ? (
          <Verdict tone="good" icon="✅">
            {tr.verdictSig(result.pValue.toFixed(4))}
          </Verdict>
        ) : (
          <Verdict tone="warn" icon="🤔">
            {tr.verdictNs(result.pValue.toFixed(4))}
          </Verdict>
        )}
        <div className="stats-grid">
          <StatCard label={tr.stF} value={result.f.toFixed(3)} />
          <StatCard label={tr.stDf} value={`${result.df1}, ${result.df2}`} />
          <StatCard
            label={tr.stP}
            value={result.pValue.toFixed(4)}
            tone={result.pValue < 0.05 ? 'good' : 'warn'}
          />
          <StatCard label={tr.stSsB} value={result.ssBetween.toFixed(2)} />
          <StatCard label={tr.stSsW} value={result.ssWithin.toFixed(2)} />
          <StatCard label={tr.stGm} value={result.grandMean.toFixed(3)} />
        </div>
      </div>

      <Missions
        page="anova"
        missions={[
          { id: 'big-f', text: tr.m1, done: result.f > 15 },
          { id: 'type1', text: tr.m2, done: mu1 === mu2 && mu2 === mu3 && result.pValue < 0.05 },
          {
            id: 'small-gap',
            text: tr.m3,
            done: (() => {
              const gap = Math.max(mu1, mu2, mu3) - Math.min(mu1, mu2, mu3);
              return gap > 0 && gap <= 0.3 + 1e-9 && result.pValue < 0.05;
            })(),
          },
        ]}
      />

      <h2>{tr.chart1}</h2>
      <Plot
        data={groups.map((g, i) => ({
          y: g,
          type: 'box',
          name: tr.legGroup(i + 1),
          boxmean: true,
          marker: { color: ['#38bdf8', '#a78bfa', '#34d399'][i] },
        }))}
        layout={{ yaxis: { title: tr.axisValue } }}
      />

      <h2>{tr.chart2}</h2>
      <Plot
        data={[
          {
            x: xs,
            y: fPdfCurve,
            type: 'scatter',
            mode: 'lines',
            name: `F(${result.df1}, ${result.df2})`,
          },
          {
            x: [result.f, result.f],
            y: [0, Math.max(...fPdfCurve) * 1.05],
            type: 'scatter',
            mode: 'lines',
            name: tr.legObs,
            line: { color: '#f87171', dash: 'dash' },
          },
        ]}
        layout={{ xaxis: { title: 'F' }, yaxis: { title: tr.axisDensity } }}
      />

      <h2>{cmn.sections.sampleCode}</h2>
      <CodeBlock
        code={`import numpy as np
from scipy import stats

rng = np.random.default_rng(${seed})
g1 = rng.normal(${mu1.toFixed(2)}, ${sigma.toFixed(2)}, size=${n})
g2 = rng.normal(${mu2.toFixed(2)}, ${sigma.toFixed(2)}, size=${n})
g3 = rng.normal(${mu3.toFixed(2)}, ${sigma.toFixed(2)}, size=${n})

F, p = stats.f_oneway(g1, g2, g3)
print(f"F = {F:.3f}, p = {p:.4f}")

# More detailed ANOVA table via statsmodels
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
      <PageNav />
    </>
  );
}
