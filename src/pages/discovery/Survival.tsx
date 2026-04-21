import { useMemo, useState } from 'react';
import { Plot } from '../../components/Plot';
import { Slider } from '../../components/Slider';
import { MathBlock } from '../../components/MathBlock';
import { CodeBlock } from '../../components/CodeBlock';
import { StatCard } from '../../components/StatCard';
import { mulberry32 } from '../../lib/random';
import { jstat } from '../../lib/stats';
import { kaplanMeier, SurvivalDatum } from '../../lib/survival';

// 指数分布に従うイベント時間 + 一様分布な打ち切り時間を生成
function simulateGroup(rng: () => number, n: number, hazard: number, followUp: number): SurvivalDatum[] {
  const data: SurvivalDatum[] = [];
  for (let i = 0; i < n; i++) {
    const eventTime = -Math.log(1 - rng()) / hazard;
    const censorTime = rng() * followUp * 1.2;
    const t = Math.min(eventTime, censorTime, followUp);
    data.push({ time: t, event: eventTime < Math.min(censorTime, followUp) ? 1 : 0 });
  }
  return data;
}

// 対数順位検定 (log-rank test) の統計量
function logRankTest(a: SurvivalDatum[], b: SurvivalDatum[]): { chi2: number; pValue: number } {
  const all = [...a, ...b].sort((x, y) => x.time - y.time);
  const eventTimes = Array.from(new Set(all.filter((d) => d.event === 1).map((d) => d.time))).sort(
    (x, y) => x - y,
  );
  let O_A = 0;
  let E_A = 0;
  let V = 0;
  for (const t of eventTimes) {
    const nA = a.filter((d) => d.time >= t).length;
    const nB = b.filter((d) => d.time >= t).length;
    const dA = a.filter((d) => d.time === t && d.event === 1).length;
    const dB = b.filter((d) => d.time === t && d.event === 1).length;
    const n = nA + nB;
    const d = dA + dB;
    if (n < 2) continue;
    const e = (d * nA) / n;
    const v = (d * nA * nB * (n - d)) / (n * n * (n - 1));
    O_A += dA;
    E_A += e;
    V += isFinite(v) ? v : 0;
  }
  const chi2 = Math.pow(O_A - E_A, 2) / Math.max(V, 1e-10);
  // 帰無仮説 (ハザード一致) のもとで χ²(1) に従う
  const pValue = 1 - jstat.chisquare.cdf(chi2, 1);
  return { chi2, pValue };
}

export function Survival() {
  const [nA, setNA] = useState(80);
  const [nB, setNB] = useState(80);
  const [hazardA, setHazardA] = useState(0.08);
  const [hazardB, setHazardB] = useState(0.05);
  const [followUp, setFollowUp] = useState(24);
  const [seed, setSeed] = useState(5);

  const { kmA, kmB, hr, lr, dataA, dataB } = useMemo(() => {
    const rng = mulberry32(seed);
    const dA = simulateGroup(rng, nA, hazardA, followUp);
    const dB = simulateGroup(rng, nB, hazardB, followUp);
    const kA = kaplanMeier(dA);
    const kB = kaplanMeier(dB);
    const hrLocal = hazardB / hazardA;
    const lrResult = logRankTest(dA, dB);
    return { kmA: kA, kmB: kB, hr: hrLocal, lr: lrResult, dataA: dA, dataB: dB };
  }, [nA, nB, hazardA, hazardB, followUp, seed]);

  const eventsA = dataA.filter((d) => d.event === 1).length;
  const eventsB = dataB.filter((d) => d.event === 1).length;

  return (
    <>
      <h1>
        生存時間分析 <span className="tag discovery">医学・疫学</span>
      </h1>
      <p className="lede">
        「イベント (死亡・退会・故障) が起きるまでの時間」を解析する手法。調査期間中にイベントが起きなかった
        <span className="tooltip" data-tip="調査終了 / 脱落 / 他要因でイベント発生時点が観測できないデータ">
          打ち切り (censored) データ
        </span>
        を情報として活かせるのが特徴です。Kaplan–Meier 推定量で生存関数を描画し、対数順位検定で 2 群を比較します。
      </p>

      <h2>モデル</h2>
      <MathBlock
        tex={String.raw`\hat{S}(t) = \prod_{t_i \le t} \left(1 - \frac{d_i}{n_i}\right)`}
      />
      <p>
        <code>n_i</code>: 時点 t_i でのリスク集合サイズ、<code>d_i</code>: 時点 t_i で発生したイベント数。
        比例ハザードモデルでは <code>h_B(t) = HR · h_A(t)</code>、従って <code>S_B(t) = S_A(t)^HR</code>。
      </p>

      <h2>パラメータ操作</h2>
      <div className="panel">
        <div className="controls">
          <Slider label="群 A サンプルサイズ" value={nA} min={10} max={400} step={1} onChange={setNA} />
          <Slider label="群 B サンプルサイズ" value={nB} min={10} max={400} step={1} onChange={setNB} />
          <Slider
            label="群 A ハザード λ_A"
            value={hazardA}
            min={0.01}
            max={0.3}
            step={0.005}
            onChange={setHazardA}
          />
          <Slider
            label="群 B ハザード λ_B"
            value={hazardB}
            min={0.01}
            max={0.3}
            step={0.005}
            onChange={setHazardB}
          />
          <Slider
            label="追跡期間 (月)"
            value={followUp}
            min={6}
            max={72}
            step={1}
            onChange={setFollowUp}
          />
          <Slider label="乱数シード" value={seed} min={1} max={999} step={1} onChange={setSeed} />
        </div>
        <div className="stats-grid">
          <StatCard label="HR (B/A)" value={hr.toFixed(3)} tone={hr < 1 ? 'good' : 'warn'} />
          <StatCard label="イベント数 A" value={`${eventsA} / ${nA}`} />
          <StatCard label="イベント数 B" value={`${eventsB} / ${nB}`} />
          <StatCard label="log-rank χ²" value={lr.chi2.toFixed(3)} />
          <StatCard
            label="log-rank p 値"
            value={lr.pValue.toFixed(4)}
            tone={lr.pValue < 0.05 ? 'good' : 'warn'}
          />
        </div>
      </div>

      <h2>グラフ: Kaplan–Meier 生存関数</h2>
      <Plot
        data={[
          {
            x: kmA.times,
            y: kmA.survival,
            type: 'scatter',
            mode: 'lines',
            line: { shape: 'hv', color: '#38bdf8', width: 3 },
            name: `群 A (λ=${hazardA.toFixed(3)})`,
          },
          {
            x: kmB.times,
            y: kmB.survival,
            type: 'scatter',
            mode: 'lines',
            line: { shape: 'hv', color: '#a78bfa', width: 3 },
            name: `群 B (λ=${hazardB.toFixed(3)})`,
          },
        ]}
        layout={{
          xaxis: { title: '時間 (月)' },
          yaxis: { title: 'S(t) 生存確率', range: [0, 1.02] },
        }}
      />

      <h2>サンプルコード</h2>
      <CodeBlock
        code={`import numpy as np
from lifelines import KaplanMeierFitter
from lifelines.statistics import logrank_test

rng = np.random.default_rng(${seed})
follow_up = ${followUp}

def simulate(n, hazard, rng):
    t_event = rng.exponential(1/hazard, size=n)
    t_censor = rng.uniform(0, follow_up * 1.2, size=n)
    t = np.minimum(np.minimum(t_event, t_censor), follow_up)
    e = (t_event < np.minimum(t_censor, follow_up)).astype(int)
    return t, e

tA, eA = simulate(${nA}, ${hazardA.toFixed(3)}, rng)
tB, eB = simulate(${nB}, ${hazardB.toFixed(3)}, rng)

kmfA = KaplanMeierFitter().fit(tA, eA, label='A')
kmfB = KaplanMeierFitter().fit(tB, eB, label='B')
ax = kmfA.plot_survival_function()
kmfB.plot_survival_function(ax=ax)

# log-rank test
res = logrank_test(tA, tB, event_observed_A=eA, event_observed_B=eB)
print(f"chi2 = {res.test_statistic:.3f}, p = {res.p_value:.4f}")

# Cox 比例ハザード (共変量がある場合)
# from lifelines import CoxPHFitter`}
      />
    </>
  );
}
