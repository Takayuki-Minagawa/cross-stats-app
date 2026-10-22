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
import { mulberry32, randn } from '../../lib/random';
import { column, metropolisHastings } from '../../lib/mcmc';
import { hdi, linspace, mean, std } from '../../lib/stats';
import { useLang } from '../../i18n';
import { t as commonT } from '../../i18n/common';
import { useTheme } from '../../contexts/ThemeContext';

const text = {
  ja: {
    title: 'MCMC ベイズ回帰',
    lede:
      'Metropolis-Hastings 法で 3 次元の事後分布 (β₀, β₁, log σ) をサンプリング。トレースプロットと事後予測バンドで不確実性を視覚化します。',
    modelP:
      '事後分布 p(β₀, β₁, σ | y) に閉形式は無いので、ランダムウォーク Metropolis-Hastings 法で数値的にサンプリングします。',
    slN: 'サンプルサイズ n',
    slB0: '真 β₀',
    slB1: '真 β₁',
    slSigma: '真 σ',
    slIter: 'MCMC 反復回数 (+ 30% burn-in)',
    slProp: '提案分布 SD',
    slPropTip: '小さすぎると探索が遅く、大きすぎると受容率が低下。0.2 〜 0.4 を目安に',
    stAcc: '受容率',
    stB0: 'β₀ 事後平均',
    stB1: 'β₁ 事後平均',
    stSigma: 'σ 事後平均',
    stB1sd: 'β₁ 事後 SD',
    stB1hdi: 'β₁ 95% HDI',
    chart1: 'グラフ 1: トレースプロット (β₁)',
    chart2: 'グラフ 2: 事後分布 (ヒストグラム + 95% HDI)',
    chart3: 'グラフ 3: 事後予測バンド',
    axisIter: '反復',
    axisValue: '値',
    axisFreq: '頻度',
    legObs: '観測',
    legTrueLine: '真の値',
    vGood: (a: string) => `受容率 ${a}: チェーンはほどよく動き回っています 👍`,
    vLow: (a: string) => `受容率 ${a}: 提案の歩幅が大きすぎて棄却ばかり。チェーンが止まりがちです`,
    vHigh: (a: string) => `受容率 ${a}: 歩幅が小さすぎて探索がゆっくり。トレースがのっぺりします`,
    m1: '提案分布 SD を大きくして受容率を 0.1 未満にしよう (動かないチェーン)',
    m2: '提案分布 SD を小さくして受容率を 0.9 以上にしよう (亀の歩み)',
    m3: 'β₁ の 95% HDI の幅を 0.15 未満にしよう',
    hdiSummary: (b0: [number, number], b1: [number, number], s: [number, number]) =>
      `95% HDI: β₀ [${b0[0].toFixed(3)}, ${b0[1].toFixed(3)}] / β₁ [${b1[0].toFixed(3)}, ${b1[1].toFixed(3)}] / σ [${s[0].toFixed(3)}, ${s[1].toFixed(3)}]`,
  },
  en: {
    title: 'MCMC Bayesian Regression',
    lede:
      'Sample the 3-dimensional posterior (β₀, β₁, log σ) with Metropolis-Hastings. Trace plots and a posterior-predictive band visualize the uncertainty.',
    modelP:
      'The posterior p(β₀, β₁, σ | y) has no closed form, so we sample it numerically with a random-walk Metropolis-Hastings algorithm.',
    slN: 'Sample size n',
    slB0: 'True β₀',
    slB1: 'True β₁',
    slSigma: 'True σ',
    slIter: 'MCMC iterations (+ 30% burn-in)',
    slProp: 'Proposal SD',
    slPropTip: 'Too small explores slowly; too large drops acceptance. Aim for 0.2–0.4',
    stAcc: 'Acceptance rate',
    stB0: 'β₀ posterior mean',
    stB1: 'β₁ posterior mean',
    stSigma: 'σ posterior mean',
    stB1sd: 'β₁ posterior SD',
    stB1hdi: 'β₁ 95% HDI',
    chart1: 'Graph 1: Trace plot (β₁)',
    chart2: 'Graph 2: Posterior distributions (hist + 95% HDI)',
    chart3: 'Graph 3: Posterior-predictive band',
    axisIter: 'Iteration',
    axisValue: 'Value',
    axisFreq: 'Frequency',
    legObs: 'Observed',
    legTrueLine: 'True value',
    vGood: (a: string) => `Acceptance ${a}: the chain is exploring nicely 👍`,
    vLow: (a: string) => `Acceptance ${a}: proposals are too bold and mostly rejected — the chain gets stuck`,
    vHigh: (a: string) => `Acceptance ${a}: steps are tiny, so exploration is slow and the trace looks smooth`,
    m1: 'Increase the proposal SD until acceptance drops below 0.1 (a stuck chain)',
    m2: 'Decrease the proposal SD until acceptance exceeds 0.9 (a snail-paced chain)',
    m3: 'Shrink the β₁ 95% HDI width below 0.15',
    hdiSummary: (b0: [number, number], b1: [number, number], s: [number, number]) =>
      `95% HDI: β₀ [${b0[0].toFixed(3)}, ${b0[1].toFixed(3)}] / β₁ [${b1[0].toFixed(3)}, ${b1[1].toFixed(3)}] / σ [${s[0].toFixed(3)}, ${s[1].toFixed(3)}]`,
  },
} as const;

export function MCMCRegression() {
  const { lang } = useLang();
  const tr = text[lang];
  const cmn = commonT(lang);
  const { theme } = useTheme();

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
    const logPost = (theta: number[]) => {
      const [b0, b1, logS] = theta;
      const s = Math.exp(logS);
      let ll = 0;
      for (let i = 0; i < n; i++) {
        const mu = b0 + b1 * xs[i];
        const diff = ys[i] - mu;
        ll += -0.5 * Math.log(2 * Math.PI) - Math.log(s) - (diff * diff) / (2 * s * s);
      }
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
      <PageHeader topic="mcmc" title={tr.title} lede={tr.lede} />

      <h2>{cmn.sections.model}</h2>
      <MathBlock tex={String.raw`y_i = \beta_0 + \beta_1 x_i + \varepsilon_i, \ \varepsilon_i \sim N(0, \sigma^2)`} />
      <MathBlock tex={String.raw`\beta_0, \beta_1 \sim N(0, 10^2), \quad \log \sigma \sim N(0, 2^2)`} />
      <p>{tr.modelP}</p>

      <h2>{cmn.sections.parameters}</h2>
      <div className="panel">
        <div className="controls">
          <Slider label={tr.slN} value={n} min={10} max={200} step={1} onChange={setN} />
          <Slider label={tr.slB0} value={trueBeta0} min={-3} max={3} step={0.05} onChange={setTrueBeta0} />
          <Slider label={tr.slB1} value={trueBeta1} min={-3} max={3} step={0.05} onChange={setTrueBeta1} />
          <Slider label={tr.slSigma} value={trueSigma} min={0.2} max={3} step={0.05} onChange={setTrueSigma} />
          <Slider label={tr.slIter} value={nIter} min={500} max={8000} step={100} onChange={setNIter} />
          <Slider
            label={tr.slProp}
            value={proposalSd}
            min={0.02}
            max={1.0}
            step={0.01}
            onChange={setProposalSd}
            tooltip={tr.slPropTip}
          />
          <SeedSlider value={seed} onChange={setSeed} />
        </div>
        {accRate < 0.2 ? (
          <Verdict tone="warn" icon="🧱">
            {tr.vLow(accRate.toFixed(2))}
          </Verdict>
        ) : accRate > 0.5 ? (
          <Verdict tone="warn" icon="🐢">
            {tr.vHigh(accRate.toFixed(2))}
          </Verdict>
        ) : (
          <Verdict tone="good" icon="🔀">
            {tr.vGood(accRate.toFixed(2))}
          </Verdict>
        )}
        <div className="stats-grid">
          <StatCard
            label={tr.stAcc}
            value={accRate.toFixed(2)}
            tone={accRate > 0.2 && accRate < 0.5 ? 'good' : 'warn'}
          />
          <StatCard label={tr.stB0} value={mean(b0Samples).toFixed(3)} />
          <StatCard label={tr.stB1} value={mean(b1Samples).toFixed(3)} />
          <StatCard label={tr.stSigma} value={mean(sigmaSamples).toFixed(3)} />
          <StatCard label={tr.stB1sd} value={std(b1Samples).toFixed(3)} />
          <StatCard label={tr.stB1hdi} value={`[${b1Hdi[0].toFixed(2)}, ${b1Hdi[1].toFixed(2)}]`} />
        </div>
      </div>

      <Missions
        page="mcmc"
        missions={[
          { id: 'stuck', text: tr.m1, done: accRate < 0.1 },
          { id: 'snail', text: tr.m2, done: accRate > 0.9 },
          { id: 'precise', text: tr.m3, done: b1Hdi[1] - b1Hdi[0] < 0.15 },
        ]}
      />

      <h2>{tr.chart1}</h2>
      <Plot
        data={[
          {
            y: b1Samples,
            type: 'scatter',
            mode: 'lines',
            line: { color: '#38bdf8', width: 1 },
            name: 'β₁',
          },
          {
            x: [0, b1Samples.length - 1],
            y: [trueBeta1, trueBeta1],
            type: 'scatter',
            mode: 'lines',
            line: { color: '#f59e0b', dash: 'dash', width: 2 },
            name: tr.legTrueLine,
          },
        ]}
        layout={{ xaxis: { title: tr.axisIter }, yaxis: { title: 'β₁' } }}
        height={240}
      />

      <h2>{tr.chart2}</h2>
      <Plot
        data={[
          {
            x: b0Samples,
            type: 'histogram',
            name: 'β₀',
            opacity: 0.7,
            marker: { color: '#38bdf8' },
          },
          {
            x: b1Samples,
            type: 'histogram',
            name: 'β₁',
            opacity: 0.7,
            marker: { color: '#a78bfa' },
          },
          {
            x: sigmaSamples,
            type: 'histogram',
            name: 'σ',
            opacity: 0.7,
            marker: { color: '#34d399' },
          },
        ]}
        layout={{ barmode: 'overlay', xaxis: { title: tr.axisValue }, yaxis: { title: tr.axisFreq } }}
      />
      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{tr.hdiSummary(b0Hdi, b1Hdi, sigHdi)}</p>

      <h2>{tr.chart3}</h2>
      <Plot
        data={[
          ...lineTraces,
          {
            x: xsData,
            y: ysData,
            type: 'scatter',
            mode: 'markers',
            name: tr.legObs,
            marker: { color: theme === 'light' ? '#1a2236' : '#f8fafc', size: 6 },
          },
          {
            x: [xLine[0], xLine[xLine.length - 1]],
            y: [trueBeta0 + trueBeta1 * xLine[0], trueBeta0 + trueBeta1 * xLine[xLine.length - 1]],
            type: 'scatter',
            mode: 'lines',
            name: tr.legTrueLine,
            line: { color: '#f59e0b', dash: 'dash', width: 2 },
          },
        ]}
        layout={{ xaxis: { title: 'x' }, yaxis: { title: 'y' } }}
      />

      <h2>{cmn.sections.sampleCode}</h2>
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
      <PageNav />
    </>
  );
}
