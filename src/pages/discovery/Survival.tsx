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
import { mulberry32 } from '../../lib/random';
import { jstat } from '../../lib/stats';
import { kaplanMeier, KMResult, SurvivalDatum } from '../../lib/survival';
import { useLang } from '../../i18n';
import { t as commonT } from '../../i18n/common';

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
  const pValue = 1 - jstat.chisquare.cdf(chi2, 1);
  return { chi2, pValue };
}

// 打ち切り時点での KM 生存率 (グラフ上に「+」で印を付けるため)
function censorMarks(data: SurvivalDatum[], km: KMResult): { x: number[]; y: number[] } {
  const x: number[] = [];
  const y: number[] = [];
  for (const d of data) {
    if (d.event === 1) continue;
    let s = 1;
    for (let i = 0; i < km.times.length && km.times[i] <= d.time; i++) s = km.survival[i];
    x.push(d.time);
    y.push(s);
  }
  return { x, y };
}

const text = {
  ja: {
    title: '生存時間分析',
    tag: '医学・疫学',
    ledePrefix: '「イベント (死亡・退会・故障) が起きるまでの時間」を解析する手法。調査期間中にイベントが起きなかった',
    censored: '打ち切り (censored) データ',
    censoredTip: '調査終了 / 脱落 / 他要因でイベント発生時点が観測できないデータ',
    ledeSuffix:
      'を情報として活かせるのが特徴です。Kaplan–Meier 推定量で生存関数を描画し、対数順位検定で 2 群を比較します。',
    modelP:
      'n_i: 時点 t_i でのリスク集合サイズ、d_i: 時点 t_i で発生したイベント数。比例ハザードモデルでは h_B(t) = HR · h_A(t)、したがって S_B(t) = S_A(t)^HR。',
    slNA: '群 A サンプルサイズ',
    slNB: '群 B サンプルサイズ',
    slHA: '群 A ハザード λ_A',
    slHB: '群 B ハザード λ_B',
    slFup: '追跡期間 (月)',
    stHR: 'HR (B/A)',
    stEvA: (e: number, n: number) => `${e} / ${n}`,
    stEvLabelA: 'イベント数 A',
    stEvLabelB: 'イベント数 B',
    stChi: 'log-rank χ²',
    stP: 'log-rank p 値',
    chart: 'グラフ: Kaplan–Meier 生存関数',
    xAxis: '時間 (月)',
    yAxis: 'S(t) 生存確率',
    legA: (h: number) => `群 A (λ=${h.toFixed(3)})`,
    legB: (h: number) => `群 B (λ=${h.toFixed(3)})`,
    legCensor: (g: string) => `打ち切り (${g})`,
    vSig: (p: string) => `log-rank p = ${p} < 0.05 → 2 群の生存曲線には差があります`,
    vNs: (p: string) => `log-rank p = ${p} ≥ 0.05 → 生存曲線の差は偶然の範囲かもしれません`,
    m1: 'log-rank 検定の p 値を 0.001 未満にしよう',
    m2: 'HR ≤ 0.7 の効果があるのに、合計 60 人以下で p > 0.05 にしよう (検出力不足)',
    m3: '群 A のイベント発生を 25% 未満にしよう (ほとんど打ち切り)',
  },
  en: {
    title: 'Survival Analysis',
    tag: 'Medicine / Epidemiology',
    ledePrefix: 'Analyze the time until an event (death, churn, failure) occurs. Its hallmark is exploiting ',
    censored: 'censored data',
    censoredTip: 'Observations where the event time could not be observed due to study end, dropout, etc.',
    ledeSuffix:
      ' as information. The Kaplan–Meier estimator draws the survival function and the log-rank test compares two groups.',
    modelP:
      'n_i: risk-set size at time t_i. d_i: number of events at t_i. Under proportional hazards h_B(t) = HR · h_A(t), hence S_B(t) = S_A(t)^HR.',
    slNA: 'Group A sample size',
    slNB: 'Group B sample size',
    slHA: 'Group A hazard λ_A',
    slHB: 'Group B hazard λ_B',
    slFup: 'Follow-up (months)',
    stHR: 'HR (B/A)',
    stEvA: (e: number, n: number) => `${e} / ${n}`,
    stEvLabelA: 'Events in A',
    stEvLabelB: 'Events in B',
    stChi: 'log-rank χ²',
    stP: 'log-rank p value',
    chart: 'Graph: Kaplan–Meier survival function',
    xAxis: 'Time (months)',
    yAxis: 'S(t) survival probability',
    legA: (h: number) => `Group A (λ=${h.toFixed(3)})`,
    legB: (h: number) => `Group B (λ=${h.toFixed(3)})`,
    legCensor: (g: string) => `Censored (${g})`,
    vSig: (p: string) => `log-rank p = ${p} < 0.05 → the two survival curves differ`,
    vNs: (p: string) => `log-rank p = ${p} ≥ 0.05 → the difference may be due to chance`,
    m1: 'Push the log-rank p-value below 0.001',
    m2: 'With a real effect (HR ≤ 0.7), get p > 0.05 using 60 subjects or fewer in total (low power)',
    m3: 'Keep events in group A under 25% (mostly censored)',
  },
} as const;

export function Survival() {
  const { lang } = useLang();
  const tr = text[lang];
  const cmn = commonT(lang);

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
      <PageHeader
        topic="survival"
        title={tr.title}
        tagLabel={tr.tag}
        lede={
          <>
            {tr.ledePrefix}
            <span className="tooltip" data-tip={tr.censoredTip}>
              {tr.censored}
            </span>
            {tr.ledeSuffix}
          </>
        }
      />

      <h2>{cmn.sections.model}</h2>
      <MathBlock tex={String.raw`\hat{S}(t) = \prod_{t_i \le t} \left(1 - \frac{d_i}{n_i}\right)`} />
      <p>{tr.modelP}</p>

      <h2>{cmn.sections.parameters}</h2>
      <div className="panel">
        <div className="controls">
          <Slider label={tr.slNA} value={nA} min={10} max={400} step={1} onChange={setNA} />
          <Slider label={tr.slNB} value={nB} min={10} max={400} step={1} onChange={setNB} />
          <Slider label={tr.slHA} value={hazardA} min={0.01} max={0.3} step={0.005} onChange={setHazardA} />
          <Slider label={tr.slHB} value={hazardB} min={0.01} max={0.3} step={0.005} onChange={setHazardB} />
          <Slider label={tr.slFup} value={followUp} min={6} max={72} step={1} onChange={setFollowUp} />
          <SeedSlider value={seed} onChange={setSeed} />
        </div>
        {lr.pValue < 0.05 ? (
          <Verdict tone="good" icon="✅">
            {tr.vSig(lr.pValue.toFixed(4))}
          </Verdict>
        ) : (
          <Verdict tone="warn" icon="🤔">
            {tr.vNs(lr.pValue.toFixed(4))}
          </Verdict>
        )}
        <div className="stats-grid">
          <StatCard label={tr.stHR} value={hr.toFixed(3)} tone={hr < 1 ? 'good' : 'warn'} />
          <StatCard label={tr.stEvLabelA} value={tr.stEvA(eventsA, nA)} />
          <StatCard label={tr.stEvLabelB} value={tr.stEvA(eventsB, nB)} />
          <StatCard label={tr.stChi} value={lr.chi2.toFixed(3)} />
          <StatCard label={tr.stP} value={lr.pValue.toFixed(4)} tone={lr.pValue < 0.05 ? 'good' : 'warn'} />
        </div>
      </div>

      <Missions
        page="survival"
        missions={[
          { id: 'strong', text: tr.m1, done: lr.pValue < 0.001 },
          { id: 'low-power', text: tr.m2, done: hr <= 0.7 && nA + nB <= 60 && lr.pValue > 0.05 },
          { id: 'censored', text: tr.m3, done: eventsA < 0.25 * nA },
        ]}
      />

      <h2>{tr.chart}</h2>
      <Plot
        data={[
          {
            x: kmA.times,
            y: kmA.survival,
            type: 'scatter',
            mode: 'lines',
            line: { shape: 'hv', color: '#38bdf8', width: 3 },
            name: tr.legA(hazardA),
          },
          {
            x: kmB.times,
            y: kmB.survival,
            type: 'scatter',
            mode: 'lines',
            line: { shape: 'hv', color: '#a78bfa', width: 3 },
            name: tr.legB(hazardB),
          },
          {
            ...censorMarks(dataA, kmA),
            type: 'scatter',
            mode: 'markers',
            marker: { symbol: 'line-ns-open', size: 9, color: '#38bdf8' },
            name: tr.legCensor('A'),
          },
          {
            ...censorMarks(dataB, kmB),
            type: 'scatter',
            mode: 'markers',
            marker: { symbol: 'line-ns-open', size: 9, color: '#a78bfa' },
            name: tr.legCensor('B'),
          },
        ]}
        layout={{ xaxis: { title: tr.xAxis }, yaxis: { title: tr.yAxis, range: [0, 1.02] } }}
      />

      <h2>{cmn.sections.sampleCode}</h2>
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

res = logrank_test(tA, tB, event_observed_A=eA, event_observed_B=eB)
print(f"chi2 = {res.test_statistic:.3f}, p = {res.p_value:.4f}")

# Cox proportional hazards when covariates are present:
# from lifelines import CoxPHFitter`}
      />
      <PageNav />
    </>
  );
}
