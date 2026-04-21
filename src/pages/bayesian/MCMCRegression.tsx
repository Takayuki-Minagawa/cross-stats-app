import { useMemo, useState } from 'react';
import { Plot } from '../../components/Plot';
import { Slider } from '../../components/Slider';
import { MathBlock } from '../../components/MathBlock';
import { CodeBlock } from '../../components/CodeBlock';
import { StatCard } from '../../components/StatCard';
import { mulberry32, randn } from '../../lib/random';
import { column, metropolisHastings } from '../../lib/mcmc';
import { hdi, linspace, mean, std } from '../../lib/stats';

export function MCMCRegression() {
  const [n, setN] = useState(40);
  const [trueBeta0, setTrueBeta0] = useState(1.0);
  const [trueBeta1, setTrueBeta1] = useState(2.0);
  const [trueSigma, setTrueSigma] = useState(1.0);
  const [nIter, setNIter] = useState(3000);
  const [proposalSd, setProposalSd] = useState(0.2);
  const [seed, setSeed] = useState(11);

  const { xsData, ysData, samples, accRate } = useMemo(() => {
    const rng = mulberry32(seed);
    const xs: number[] = [];
    const ys: number[] = [];
    for (let i = 0; i < n; i++) {
      const xi = randn(rng) * 1.5;
      const yi = trueBeta0 + trueBeta1 * xi + trueSigma * randn(rng);
      xs.push(xi);
      ys.push(yi);
    }
    // パラメータ: [beta0, beta1, log(sigma)]
    // 事前分布: beta0, beta1 ~ N(0, 10^2); log(sigma) ~ N(0, 2^2) (弱情報事前分布)
    const logPost = (theta: number[]) => {
      const [b0, b1, logS] = theta;
      const s = Math.exp(logS);
      let ll = 0;
      for (let i = 0; i < n; i++) {
        const mu = b0 + b1 * xs[i];
        const diff = ys[i] - mu;
        ll += -0.5 * Math.log(2 * Math.PI) - Math.log(s) - (diff * diff) / (2 * s * s);
      }
      // 事前分布 (log)
      ll += -0.5 * (b0 * b0) / 100 - 0.5 * Math.log(2 * Math.PI * 100);
      ll += -0.5 * (b1 * b1) / 100 - 0.5 * Math.log(2 * Math.PI * 100);
      ll += -0.5 * (logS * logS) / 4 - 0.5 * Math.log(2 * Math.PI * 4);
      return ll;
    };
    const result = metropolisHastings(
      logPost,
      [0, 0, 0],
      nIter,
      [proposalSd, proposalSd, proposalSd * 0.5],
      rng,
      Math.floor(nIter * 0.3),
    );
    return { xsData: xs, ysData: ys, samples: result.samples, accRate: result.accRate };
  }, [n, trueBeta0, trueBeta1, trueSigma, nIter, proposalSd, seed]);

  const b0Samples = useMemo(() => column(samples, 0), [samples]);
  const b1Samples = useMemo(() => column(samples, 1), [samples]);
  const sigmaSamples = useMemo(() => column(samples, 2).map((v) => Math.exp(v)), [samples]);

  const b0Hdi = useMemo(() => hdi(b0Samples), [b0Samples]);
  const b1Hdi = useMemo(() => hdi(b1Samples), [b1Samples]);
  const sigHdi = useMemo(() => hdi(sigmaSamples), [sigmaSamples]);

  // 事後予測: 200 本のサンプル回帰直線
  const xLine = useMemo(() => linspace(-4, 4, 50), []);
  const lineTraces = useMemo(() => {
    const step = Math.max(1, Math.floor(samples.length / 120));
    const traces: any[] = [];
    for (let i = 0; i < samples.length; i += step) {
      const [b0, b1] = samples[i];
      traces.push({
        x: xLine,
        y: xLine.map((x) => b0 + b1 * x),
        type: 'scatter' as const,
        mode: 'lines' as const,
        line: { color: 'rgba(167,139,250,0.08)', width: 1 },
        hoverinfo: 'skip',
        showlegend: false,
      });
    }
    return traces;
  }, [samples, xLine]);

  return (
    <>
      <h1>
        MCMC ベイズ回帰 <span className="tag bayes">ベイズ</span>
      </h1>
      <p className="lede">
        Metropolis-Hastings 法で 3 次元の事後分布 <code>(β₀, β₁, log σ)</code>{' '}
        をサンプリング。トレースプロットと事後予測バンドで不確実性を視覚化します。
      </p>

      <h2>モデル</h2>
      <MathBlock tex={String.raw`y_i = \beta_0 + \beta_1 x_i + \varepsilon_i, \ \varepsilon_i \sim N(0, \sigma^2)`} />
      <MathBlock
        tex={String.raw`\beta_0, \beta_1 \sim N(0, 10^2), \quad \log \sigma \sim N(0, 2^2)`}
      />
      <p>
        事後分布 <code>p(β₀, β₁, σ | y)</code> に閉形式は無いので、ランダムウォーク
        Metropolis-Hastings 法で数値的にサンプリングします。
      </p>

      <h2>パラメータ操作</h2>
      <div className="panel">
        <div className="controls">
          <Slider label="サンプルサイズ n" value={n} min={10} max={200} step={1} onChange={setN} />
          <Slider label="真 β₀" value={trueBeta0} min={-3} max={3} step={0.05} onChange={setTrueBeta0} />
          <Slider label="真 β₁" value={trueBeta1} min={-3} max={3} step={0.05} onChange={setTrueBeta1} />
          <Slider
            label="真 σ"
            value={trueSigma}
            min={0.2}
            max={3}
            step={0.05}
            onChange={setTrueSigma}
          />
          <Slider
            label="MCMC 反復回数 (+ 30% burn-in)"
            value={nIter}
            min={500}
            max={8000}
            step={100}
            onChange={setNIter}
          />
          <Slider
            label="提案分布 SD"
            value={proposalSd}
            min={0.02}
            max={1.0}
            step={0.01}
            onChange={setProposalSd}
            tooltip="小さすぎると探索が遅く、大きすぎると受容率が低下。0.2 ～ 0.4 を目安に"
          />
          <Slider label="乱数シード" value={seed} min={1} max={999} step={1} onChange={setSeed} />
        </div>
        <div className="stats-grid">
          <StatCard
            label="受容率"
            value={accRate.toFixed(2)}
            tone={accRate > 0.2 && accRate < 0.5 ? 'good' : 'warn'}
          />
          <StatCard label="β₀ 事後平均" value={mean(b0Samples).toFixed(3)} />
          <StatCard label="β₁ 事後平均" value={mean(b1Samples).toFixed(3)} />
          <StatCard label="σ 事後平均" value={mean(sigmaSamples).toFixed(3)} />
          <StatCard label="β₁ 事後 SD" value={std(b1Samples).toFixed(3)} />
          <StatCard label="β₁ 95% HDI" value={`[${b1Hdi[0].toFixed(2)}, ${b1Hdi[1].toFixed(2)}]`} />
        </div>
      </div>

      <h2>グラフ 1: トレースプロット (β₁)</h2>
      <Plot
        data={[
          {
            y: b1Samples,
            type: 'scatter',
            mode: 'lines',
            line: { color: '#38bdf8', width: 1 },
            name: 'β₁',
          },
        ]}
        layout={{ xaxis: { title: '反復' }, yaxis: { title: 'β₁' } }}
        height={240}
      />

      <h2>グラフ 2: 事後分布 (ヒストグラム + 95% HDI)</h2>
      <Plot
        data={[
          {
            x: b0Samples,
            type: 'histogram',
            name: 'β₀',
            opacity: 0.7,
            marker: { color: '#38bdf8' },
            xbins: { size: (Math.max(...b0Samples) - Math.min(...b0Samples)) / 40 },
          },
          {
            x: b1Samples,
            type: 'histogram',
            name: 'β₁',
            opacity: 0.7,
            marker: { color: '#a78bfa' },
            xbins: { size: (Math.max(...b1Samples) - Math.min(...b1Samples)) / 40 },
          },
          {
            x: sigmaSamples,
            type: 'histogram',
            name: 'σ',
            opacity: 0.7,
            marker: { color: '#34d399' },
            xbins: { size: (Math.max(...sigmaSamples) - Math.min(...sigmaSamples)) / 40 },
          },
        ]}
        layout={{ barmode: 'overlay', xaxis: { title: '値' }, yaxis: { title: '頻度' } }}
      />
      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
        95% HDI: β₀ [{b0Hdi[0].toFixed(3)}, {b0Hdi[1].toFixed(3)}] / β₁ [{b1Hdi[0].toFixed(3)}
        , {b1Hdi[1].toFixed(3)}] / σ [{sigHdi[0].toFixed(3)}, {sigHdi[1].toFixed(3)}]
      </p>

      <h2>グラフ 3: 事後予測バンド</h2>
      <Plot
        data={[
          ...lineTraces,
          {
            x: xsData,
            y: ysData,
            type: 'scatter',
            mode: 'markers',
            name: '観測',
            marker: { color: '#f8fafc', size: 6 },
          },
        ]}
        layout={{ xaxis: { title: 'x' }, yaxis: { title: 'y' } }}
      />

      <h2>サンプルコード</h2>
      <CodeBlock
        code={`import numpy as np
import pymc as pm
import arviz as az

rng = np.random.default_rng(${seed})
n = ${n}
x = rng.standard_normal(n) * 1.5
y = ${trueBeta0.toFixed(2)} + ${trueBeta1.toFixed(2)} * x + ${trueSigma.toFixed(2)} * rng.standard_normal(n)

with pm.Model() as model:
    beta0 = pm.Normal("beta0", mu=0, sigma=10)
    beta1 = pm.Normal("beta1", mu=0, sigma=10)
    sigma = pm.HalfNormal("sigma", sigma=2)
    mu = beta0 + beta1 * x
    pm.Normal("y_obs", mu=mu, sigma=sigma, observed=y)
    idata = pm.sample(2000, tune=1000, target_accept=0.9)

print(az.summary(idata, hdi_prob=0.95))
az.plot_trace(idata)
az.plot_posterior(idata, hdi_prob=0.95)`}
      />
    </>
  );
}
