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
import { mulberry32, normal } from '../../lib/random';
import { mean, variance } from '../../lib/stats';
import { useLang } from '../../i18n';
import { t as commonT } from '../../i18n/common';

const text = {
  ja: {
    title: '階層ベイズ',
    ledePrefix:
      '群ごとの平均 θ_j を共通の上位分布 N(μ, τ²) から生成するモデル。完全プーリング (全群同じ) と無プーリング (各群独立) の中間として、データが少ない群ほど全体平均に「縮める」',
    shrink: 'シュリンケージ',
    shrinkTip: "Stein's paradox: 無プーリング推定量は 3 群以上で総 MSE が大きい",
    ledeSuffix: 'が働きます。',
    modelP:
      '正規-正規共役を使った閉形式近似: 事後平均 θ_j = w_j ȳ_j + (1 − w_j) μ、 w_j = (n_j/σ²) / (n_j/σ² + 1/τ²)。 w_j は群サイズが小さいほど 0 に近づき、全体平均への縮みが強くなります。',
    slJ: '群数 J',
    slMinN: '群サイズ下限',
    slMaxN: '群サイズ上限',
    slMu: '真の μ',
    slTau: '真の τ (群間ばらつき)',
    slSigma: 'σ (群内ばらつき)',
    slTauA: 'モデル仮定の τ',
    slTauATip: 'モデル側の事前分布の幅。小さいほどシュリンケージが強くなる',
    stGm: '全体平均 ȳ',
    stVar: '群平均の分散',
    stMseNo: 'MSE 無プーリング (対真値)',
    stMsePartial: 'MSE 部分プーリング (対真値)',
    stMseFull: 'MSE 完全プーリング (対真値)',
    legTrue: '真の θ_j',
    vBetter: (r: string) => `部分プーリングの誤差は無プーリングの ${r}% — 縮めることで推定が改善しています`,
    vWorse: (r: string) => `部分プーリングの誤差は無プーリングの ${r}% — 仮定した τ が真の値とずれているかも？`,
    m1: '部分プーリングの MSE を無プーリングの半分未満にしよう',
    m2: '部分プーリングの推定を完全プーリングとほぼ一致させよう (全群で差 < 0.05)',
    m3: '部分プーリングが無プーリングに負ける (MSE が 1.2 倍超) 状況を作ろう',
    chart: 'グラフ: 3 手法の推定比較',
    xAxis: '群 index',
    yAxis: '推定 θ',
    legNoPool: '無プーリング ȳ_j',
    legPartial: '部分プーリング',
    legFull: '完全プーリング',
    groupSizes: (ns: number[]) => `群サイズ (n_j): [${ns.join(', ')}]`,
  },
  en: {
    title: 'Hierarchical Bayes',
    ledePrefix:
      'A model where per-group means θ_j are drawn from a common higher-level distribution N(μ, τ²). Between complete pooling (all groups identical) and no pooling (each independent), smaller groups get pulled harder toward the overall mean — known as ',
    shrink: 'shrinkage',
    shrinkTip: "Stein's paradox: with ≥3 groups, the no-pooling estimator has larger total MSE",
    ledeSuffix: '.',
    modelP:
      'Closed-form approximation using normal–normal conjugacy: posterior mean θ_j = w_j ȳ_j + (1 − w_j) μ, with w_j = (n_j/σ²) / (n_j/σ² + 1/τ²). Smaller groups pull w_j toward 0, strengthening shrinkage toward the overall mean.',
    slJ: 'Number of groups J',
    slMinN: 'Group size lower bound',
    slMaxN: 'Group size upper bound',
    slMu: 'True μ',
    slTau: 'True τ (between-group SD)',
    slSigma: 'σ (within-group SD)',
    slTauA: 'Assumed τ in the model',
    slTauATip: 'Width of the hierarchical prior. Smaller implies stronger shrinkage',
    stGm: 'Overall mean ȳ',
    stVar: 'Variance of group means',
    stMseNo: 'MSE no pooling (vs truth)',
    stMsePartial: 'MSE partial pooling (vs truth)',
    stMseFull: 'MSE complete pooling (vs truth)',
    legTrue: 'True θ_j',
    vBetter: (r: string) => `Partial-pooling error is ${r}% of no-pooling — shrinkage is improving the estimates`,
    vWorse: (r: string) => `Partial-pooling error is ${r}% of no-pooling — maybe the assumed τ is off?`,
    m1: 'Make the partial-pooling MSE less than half of the no-pooling MSE',
    m2: 'Make partial pooling nearly identical to complete pooling (every gap < 0.05)',
    m3: 'Create a case where partial pooling loses (MSE more than 1.2× no pooling)',
    chart: 'Graph: Comparison of three estimators',
    xAxis: 'Group index',
    yAxis: 'Estimated θ',
    legNoPool: 'No pooling ȳ_j',
    legPartial: 'Partial pooling',
    legFull: 'Complete pooling',
    groupSizes: (ns: number[]) => `Group sizes (n_j): [${ns.join(', ')}]`,
  },
} as const;

export function Hierarchical() {
  const { lang } = useLang();
  const tr = text[lang];
  const cmn = commonT(lang);

  const [nGroups, setNGroups] = useState(8);
  const [minN, setMinN] = useState(3);
  const [maxN, setMaxN] = useState(40);
  const [mu0, setMu0] = useState(0.5);
  const [tau, setTau] = useState(0.8);
  const [sigma, setSigma] = useState(1.0);
  const [tauAssumed, setTauAssumed] = useState(0.8);
  const [seed, setSeed] = useState(3);

  const { groups, ybars, shrunk, noPool, pooled, grandMean, thetas } = useMemo(() => {
    const rng = mulberry32(seed);
    const groupsLocal: number[][] = [];
    const thetasLocal: number[] = [];
    for (let j = 0; j < nGroups; j++) {
      const theta = normal(rng, mu0, tau);
      thetasLocal.push(theta);
      const nj = Math.round(minN + (maxN - minN) * rng());
      const g: number[] = [];
      for (let i = 0; i < Math.max(1, nj); i++) g.push(normal(rng, theta, sigma));
      groupsLocal.push(g);
    }
    const ybarsLocal = groupsLocal.map(mean);
    const grand = mean(groupsLocal.flat());
    const shrunkLocal = groupsLocal.map((g, j) => {
      const nj = g.length;
      const w = (nj / (sigma * sigma)) / (nj / (sigma * sigma) + 1 / (tauAssumed * tauAssumed));
      return w * ybarsLocal[j] + (1 - w) * grand;
    });
    const pooledLocal = Array(nGroups).fill(grand);
    return {
      groups: groupsLocal,
      ybars: ybarsLocal,
      shrunk: shrunkLocal,
      noPool: ybarsLocal,
      pooled: pooledLocal,
      grandMean: grand,
      thetas: thetasLocal,
    };
  }, [nGroups, minN, maxN, mu0, tau, sigma, tauAssumed, seed]);

  const mse = (a: number[], b: number[]) =>
    a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0) / a.length;
  const varBetween = variance(ybars);
  const mseNo = mse(noPool, thetas);
  const msePartial = mse(shrunk, thetas);
  const mseFull = mse(pooled, thetas);
  const ratio = (msePartial / mseNo) * 100;
  const ns = groups.map((g) => g.length);

  return (
    <>
      <PageHeader
        topic="hierarchical"
        title={tr.title}
        lede={
          <>
            {tr.ledePrefix}
            <span className="tooltip" data-tip={tr.shrinkTip}>
              {tr.shrink}
            </span>
            {tr.ledeSuffix}
          </>
        }
      />

      <h2>{cmn.sections.model}</h2>
      <MathBlock tex={String.raw`\mu \sim N(0, 10^2), \quad \tau \sim \mathrm{HalfNormal}(2)`} />
      <MathBlock tex={String.raw`\theta_j \sim N(\mu, \tau^2), \quad y_{ij} \sim N(\theta_j, \sigma^2)`} />
      <p>{tr.modelP}</p>

      <h2>{cmn.sections.parameters}</h2>
      <div className="panel">
        <div className="controls">
          <Slider label={tr.slJ} value={nGroups} min={3} max={20} step={1} onChange={setNGroups} />
          <Slider label={tr.slMinN} value={minN} min={1} max={20} step={1} onChange={setMinN} />
          <Slider label={tr.slMaxN} value={maxN} min={5} max={100} step={1} onChange={setMaxN} />
          <Slider label={tr.slMu} value={mu0} min={-2} max={2} step={0.05} onChange={setMu0} />
          <Slider label={tr.slTau} value={tau} min={0.1} max={3} step={0.05} onChange={setTau} />
          <Slider label={tr.slSigma} value={sigma} min={0.2} max={3} step={0.05} onChange={setSigma} />
          <Slider
            label={tr.slTauA}
            value={tauAssumed}
            min={0.1}
            max={5}
            step={0.05}
            onChange={setTauAssumed}
            tooltip={tr.slTauATip}
          />
          <SeedSlider value={seed} onChange={setSeed} />
        </div>
        {ratio <= 100 ? (
          <Verdict tone="good" icon="🧲">
            {tr.vBetter(ratio.toFixed(0))}
          </Verdict>
        ) : (
          <Verdict tone="warn" icon="🤔">
            {tr.vWorse(ratio.toFixed(0))}
          </Verdict>
        )}
        <div className="stats-grid">
          <StatCard label={tr.stGm} value={grandMean.toFixed(3)} />
          <StatCard label={tr.stVar} value={varBetween.toFixed(3)} />
          <StatCard label={tr.stMseNo} value={mseNo.toFixed(3)} />
          <StatCard
            label={tr.stMsePartial}
            value={msePartial.toFixed(3)}
            tone={msePartial <= mseNo ? 'good' : 'warn'}
          />
          <StatCard label={tr.stMseFull} value={mseFull.toFixed(3)} />
        </div>
      </div>

      <Missions
        page="hierarchical"
        missions={[
          { id: 'half', text: tr.m1, done: msePartial < 0.5 * mseNo },
          {
            id: 'collapse',
            text: tr.m2,
            done: shrunk.every((v) => Math.abs(v - grandMean) < 0.05),
          },
          { id: 'backfire', text: tr.m3, done: msePartial > 1.2 * mseNo },
        ]}
      />

      <h2>{tr.chart}</h2>
      <Plot
        data={[
          {
            x: groups.map((_, i) => i + 1),
            y: noPool,
            mode: 'markers',
            type: 'scatter',
            name: tr.legNoPool,
            marker: { color: '#38bdf8', size: 10, symbol: 'circle-open' },
          },
          {
            x: groups.map((_, i) => i + 1),
            y: shrunk,
            mode: 'markers',
            type: 'scatter',
            name: tr.legPartial,
            marker: { color: '#a78bfa', size: 11, symbol: 'diamond' },
          },
          {
            x: groups.map((_, i) => i + 1),
            y: pooled,
            mode: 'lines',
            type: 'scatter',
            name: tr.legFull,
            line: { color: '#34d399', dash: 'dash' },
          },
          {
            x: groups.map((_, i) => i + 1),
            y: thetas,
            mode: 'markers',
            type: 'scatter',
            name: tr.legTrue,
            marker: { color: '#f59e0b', size: 10, symbol: 'x' },
          },
        ]}
        layout={{ xaxis: { title: tr.xAxis, dtick: 1 }, yaxis: { title: tr.yAxis } }}
      />

      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{tr.groupSizes(ns)}</p>

      <h2>{cmn.sections.sampleCode}</h2>
      <CodeBlock
        code={`import numpy as np
import pymc as pm
import arviz as az

rng = np.random.default_rng(${seed})
J = ${nGroups}
mu_true, tau_true, sigma = ${mu0.toFixed(2)}, ${tau.toFixed(2)}, ${sigma.toFixed(2)}
theta_true = rng.normal(mu_true, tau_true, size=J)
ns = rng.integers(${minN}, ${maxN} + 1, size=J)
y = [rng.normal(theta_true[j], sigma, size=ns[j]) for j in range(J)]

y_flat = np.concatenate(y)
idx = np.concatenate([np.full(len(yj), j) for j, yj in enumerate(y)])

with pm.Model() as hmodel:
    mu = pm.Normal("mu", 0, 10)
    tau = pm.HalfNormal("tau", 2)
    theta = pm.Normal("theta", mu=mu, sigma=tau, shape=J)
    pm.Normal("y_obs", mu=theta[idx], sigma=sigma, observed=y_flat)
    idata = pm.sample(2000, tune=1000, target_accept=0.95)

print(az.summary(idata, var_names=["mu", "tau"], hdi_prob=0.95))
az.plot_forest(idata, var_names=["theta"], hdi_prob=0.95, combined=True)`}
      />
      <PageNav />
    </>
  );
}
