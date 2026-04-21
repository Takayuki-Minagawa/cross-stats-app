import { useMemo, useState } from 'react';
import { Plot } from '../../components/Plot';
import { Slider } from '../../components/Slider';
import { MathBlock } from '../../components/MathBlock';
import { CodeBlock } from '../../components/CodeBlock';
import { StatCard } from '../../components/StatCard';
import { mulberry32, normal } from '../../lib/random';
import { mean, variance } from '../../lib/stats';

// 階層ベイズの「部分プーリング」を、正規-正規共役モデルの閉形式で近似デモする。
// 各群の事前: θ_j ~ N(μ, τ²)、観測 y_j ~ N(θ_j, σ²/n_j)
// 事後 θ_j | y_j = w * ybar_j + (1 - w) * μ, w = (1/σ²·n_j) / (1/σ²·n_j + 1/τ²)
// μ, τ は経験ベイズで推定 (シュリンケージ係数だけ可視化する簡易版)

export function Hierarchical() {
  const [nGroups, setNGroups] = useState(8);
  const [minN, setMinN] = useState(3);
  const [maxN, setMaxN] = useState(40);
  const [mu0, setMu0] = useState(0.5);
  const [tau, setTau] = useState(0.8);
  const [sigma, setSigma] = useState(1.0);
  const [tauAssumed, setTauAssumed] = useState(0.8);
  const [seed, setSeed] = useState(3);

  const { groups, ybars, shrunk, noPool, pooled, grandMean } = useMemo(() => {
    const rng = mulberry32(seed);
    const groupsLocal: number[][] = [];
    for (let j = 0; j < nGroups; j++) {
      const theta = normal(rng, mu0, tau);
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
    };
  }, [nGroups, minN, maxN, mu0, tau, sigma, tauAssumed, seed]);

  const mse = (a: number[], b: number[]) =>
    a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0) / a.length;
  const varBetween = variance(ybars);
  const ns = groups.map((g) => g.length);

  return (
    <>
      <h1>
        階層ベイズ <span className="tag bayes">ベイズ</span>
      </h1>
      <p className="lede">
        群ごとの平均 <code>θ_j</code> を共通の上位分布 <code>N(μ, τ²)</code>{' '}
        から生成するモデル。完全プーリング (全群同じ) と無プーリング (各群独立) の中間として、
        データが少ない群ほど全体平均に「縮める」
        <span className="tooltip" data-tip="Stein's paradox: 無プーリング推定量は 3 群以上で総 MSE が大きい">
          シュリンケージ
        </span>
        が働きます。
      </p>

      <h2>モデル</h2>
      <MathBlock tex={String.raw`\mu \sim N(0, 10^2), \quad \tau \sim \mathrm{HalfNormal}(2)`} />
      <MathBlock tex={String.raw`\theta_j \sim N(\mu, \tau^2), \quad y_{ij} \sim N(\theta_j, \sigma^2)`} />
      <p>
        正規-正規共役を使った閉形式近似: 事後平均 θ_j = w_j ȳ_j + (1 − w_j) μ
        、 w_j = (n_j/σ²) / (n_j/σ² + 1/τ²)。 w_j は群サイズが小さいほど 0 に近づき、
        全体平均への縮みが強くなります。
      </p>

      <h2>パラメータ操作</h2>
      <div className="panel">
        <div className="controls">
          <Slider label="群数 J" value={nGroups} min={3} max={20} step={1} onChange={setNGroups} />
          <Slider label="群サイズ下限" value={minN} min={1} max={20} step={1} onChange={setMinN} />
          <Slider label="群サイズ上限" value={maxN} min={5} max={100} step={1} onChange={setMaxN} />
          <Slider label="真の μ" value={mu0} min={-2} max={2} step={0.05} onChange={setMu0} />
          <Slider
            label="真の τ (群間ばらつき)"
            value={tau}
            min={0.1}
            max={3}
            step={0.05}
            onChange={setTau}
          />
          <Slider label="σ (群内ばらつき)" value={sigma} min={0.2} max={3} step={0.05} onChange={setSigma} />
          <Slider
            label="モデル仮定の τ"
            value={tauAssumed}
            min={0.1}
            max={5}
            step={0.05}
            onChange={setTauAssumed}
            tooltip="モデル側の事前分布の幅。小さいほどシュリンケージが強くなる"
          />
          <Slider label="乱数シード" value={seed} min={1} max={999} step={1} onChange={setSeed} />
        </div>
        <div className="stats-grid">
          <StatCard label="全体平均 ȳ" value={grandMean.toFixed(3)} />
          <StatCard label="群平均の分散" value={varBetween.toFixed(3)} />
          <StatCard label="MSE (無プーリング vs 完全プーリング)" value={mse(noPool, pooled).toFixed(3)} />
        </div>
      </div>

      <h2>グラフ: 3 手法の推定比較</h2>
      <Plot
        data={[
          {
            x: groups.map((_, i) => i + 1),
            y: noPool,
            mode: 'markers',
            type: 'scatter',
            name: '無プーリング ȳ_j',
            marker: { color: '#38bdf8', size: 10, symbol: 'circle-open' },
          },
          {
            x: groups.map((_, i) => i + 1),
            y: shrunk,
            mode: 'markers',
            type: 'scatter',
            name: '部分プーリング',
            marker: { color: '#a78bfa', size: 11, symbol: 'diamond' },
          },
          {
            x: groups.map((_, i) => i + 1),
            y: pooled,
            mode: 'lines',
            type: 'scatter',
            name: '完全プーリング',
            line: { color: '#34d399', dash: 'dash' },
          },
        ]}
        layout={{
          xaxis: { title: '群 index', dtick: 1 },
          yaxis: { title: '推定 θ' },
        }}
      />

      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
        群サイズ (n_j): [{ns.join(', ')}]
      </p>

      <h2>サンプルコード</h2>
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
    </>
  );
}
