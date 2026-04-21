import { useMemo, useState } from 'react';
import { Plot } from '../../components/Plot';
import { Slider } from '../../components/Slider';
import { MathBlock } from '../../components/MathBlock';
import { CodeBlock } from '../../components/CodeBlock';
import { StatCard } from '../../components/StatCard';
import { mulberry32 } from '../../lib/random';
import { simulateHmm, viterbi } from '../../lib/hmm';
import { useLang } from '../../i18n';
import { t as commonT } from '../../i18n/common';

const text = {
  ja: {
    title: '隠れマルコフモデル (HMM)',
    tag: '音声・バイオ',
    ledePrefix:
      '直接は観測できない「隠れ状態」がマルコフ過程に従って遷移し、各状態から観測値が確率的に生成されるモデルです。ここではコイン投げの例 (イカサマ / 通常) を使い、',
    viterbi: 'ビタビアルゴリズム',
    viterbiTip: '観測列から最尤の状態列を動的計画法で求めるアルゴリズム',
    ledeSuffix: 'で隠れ状態を復号します。',
    trueHeader: 'パラメータ操作 (真のモデル)',
    inferHeader: 'パラメータ操作 (推論モデル)',
    inferNote: '真のパラメータと違う値を設定すると、誤仕様のモデルでどの程度うまく復号できるかを観察できます。',
    slT: '系列長 T',
    slStayF: 'Fair 状態に留まる確率',
    slStayL: 'Loaded 状態に留まる確率',
    slHF: 'Fair で表の確率',
    slHL: 'Loaded で表の確率',
    slInferStayF: '推論: Fair 継続確率',
    slInferStayL: '推論: Loaded 継続確率',
    slInferHL: '推論: Loaded で表の確率',
    stAcc: '復号精度',
    stHeads: '表の比率 (観測)',
    stLoadedTrue: 'Loaded 期間の割合 (真)',
    stLoadedDec: 'Loaded 期間の割合 (復号)',
    chart1: 'グラフ 1: 観測系列 (表=1 / 裏=0)',
    chart2: 'グラフ 2: 真の隠れ状態 vs Viterbi 復号',
    axisT: 't',
    axisObs: '観測',
    axisState: '状態 (0=Fair, 1=Loaded)',
    legObs: '観測',
    legTrue: '真の状態',
    legDec: 'Viterbi 復号',
  },
  en: {
    title: 'Hidden Markov Model (HMM)',
    tag: 'Speech / Bio',
    ledePrefix:
      'A model where unobservable hidden states evolve under a Markov process and each state probabilistically emits an observation. Here we use a coin-flipping example (Loaded / Fair) and decode the hidden states with the ',
    viterbi: 'Viterbi algorithm',
    viterbiTip: 'A dynamic-programming algorithm that recovers the most likely state sequence from observations',
    ledeSuffix: '.',
    trueHeader: 'Parameters (true model)',
    inferHeader: 'Parameters (inference model)',
    inferNote:
      'Setting inference parameters away from the truth lets you observe how well a misspecified model can still decode states.',
    slT: 'Sequence length T',
    slStayF: 'P(stay in Fair)',
    slStayL: 'P(stay in Loaded)',
    slHF: 'P(heads | Fair)',
    slHL: 'P(heads | Loaded)',
    slInferStayF: 'Inference: P(stay in Fair)',
    slInferStayL: 'Inference: P(stay in Loaded)',
    slInferHL: 'Inference: P(heads | Loaded)',
    stAcc: 'Decoding accuracy',
    stHeads: 'Heads ratio (observed)',
    stLoadedTrue: 'Loaded period ratio (true)',
    stLoadedDec: 'Loaded period ratio (decoded)',
    chart1: 'Graph 1: Observations (heads=1 / tails=0)',
    chart2: 'Graph 2: True state vs Viterbi decoding',
    axisT: 't',
    axisObs: 'Observation',
    axisState: 'State (0=Fair, 1=Loaded)',
    legObs: 'Observed',
    legTrue: 'True state',
    legDec: 'Viterbi decoded',
  },
} as const;

export function HMM() {
  const { lang } = useLang();
  const tr = text[lang];
  const cmn = commonT(lang);

  const [T, setT] = useState(120);
  const [p_stayFair, setStayFair] = useState(0.95);
  const [p_stayLoaded, setStayLoaded] = useState(0.90);
  const [p_headsFair, setHeadsFair] = useState(0.5);
  const [p_headsLoaded, setHeadsLoaded] = useState(0.85);
  const [seed, setSeed] = useState(17);
  const [inferStayFair, setInferStayFair] = useState(0.95);
  const [inferStayLoaded, setInferStayLoaded] = useState(0.90);
  const [inferHeadsLoaded, setInferHeadsLoaded] = useState(0.85);

  const { states, obs, decoded, accuracy } = useMemo(() => {
    const rng = mulberry32(seed);
    const trueParams = {
      pi: [0.5, 0.5],
      A: [
        [p_stayFair, 1 - p_stayFair],
        [1 - p_stayLoaded, p_stayLoaded],
      ],
      B: [
        [1 - p_headsFair, p_headsFair],
        [1 - p_headsLoaded, p_headsLoaded],
      ],
    };
    const inferParams = {
      pi: [0.5, 0.5],
      A: [
        [inferStayFair, 1 - inferStayFair],
        [1 - inferStayLoaded, inferStayLoaded],
      ],
      B: [
        [1 - p_headsFair, p_headsFair],
        [1 - inferHeadsLoaded, inferHeadsLoaded],
      ],
    };
    const sim = simulateHmm(trueParams, T, rng);
    const dec = viterbi(sim.obs, inferParams);
    const acc = sim.states.reduce((s, v, i) => s + (v === dec[i] ? 1 : 0), 0) / T;
    return { states: sim.states, obs: sim.obs, decoded: dec, accuracy: acc };
  }, [T, p_stayFair, p_stayLoaded, p_headsFair, p_headsLoaded, seed, inferStayFair, inferStayLoaded, inferHeadsLoaded]);

  const tAxis = useMemo(() => Array.from({ length: T }, (_, i) => i), [T]);

  return (
    <>
      <h1>
        {tr.title} <span className="tag discovery">{tr.tag}</span>
      </h1>
      <p className="lede">
        {tr.ledePrefix}
        <span className="tooltip" data-tip={tr.viterbiTip}>
          {tr.viterbi}
        </span>
        {tr.ledeSuffix}
      </p>

      <h2>{cmn.sections.model}</h2>
      <MathBlock tex={String.raw`z_t \in \{\text{Fair}, \text{Loaded}\}, \ P(z_t \mid z_{t-1}) = A_{z_{t-1}, z_t}`} />
      <MathBlock tex={String.raw`x_t \in \{\text{tails}, \text{heads}\}, \ P(x_t \mid z_t) = B_{z_t, x_t}`} />
      <MathBlock tex={String.raw`\hat{z}_{1:T} = \arg\max_{z_{1:T}} P(z_{1:T}, x_{1:T}) \quad \text{(Viterbi)}`} />

      <h2>{tr.trueHeader}</h2>
      <div className="panel">
        <div className="controls">
          <Slider label={tr.slT} value={T} min={30} max={500} step={1} onChange={setT} />
          <Slider label={tr.slStayF} value={p_stayFair} min={0.5} max={0.99} step={0.01} onChange={setStayFair} />
          <Slider label={tr.slStayL} value={p_stayLoaded} min={0.5} max={0.99} step={0.01} onChange={setStayLoaded} />
          <Slider label={tr.slHF} value={p_headsFair} min={0.1} max={0.9} step={0.01} onChange={setHeadsFair} />
          <Slider label={tr.slHL} value={p_headsLoaded} min={0.5} max={0.99} step={0.01} onChange={setHeadsLoaded} />
          <Slider label={cmn.seed} value={seed} min={1} max={999} step={1} onChange={setSeed} />
        </div>
      </div>

      <h2>{tr.inferHeader}</h2>
      <div className="panel">
        <p style={{ marginTop: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>{tr.inferNote}</p>
        <div className="controls">
          <Slider
            label={tr.slInferStayF}
            value={inferStayFair}
            min={0.5}
            max={0.99}
            step={0.01}
            onChange={setInferStayFair}
          />
          <Slider
            label={tr.slInferStayL}
            value={inferStayLoaded}
            min={0.5}
            max={0.99}
            step={0.01}
            onChange={setInferStayLoaded}
          />
          <Slider
            label={tr.slInferHL}
            value={inferHeadsLoaded}
            min={0.5}
            max={0.99}
            step={0.01}
            onChange={setInferHeadsLoaded}
          />
        </div>
        <div className="stats-grid">
          <StatCard
            label={tr.stAcc}
            value={accuracy.toFixed(3)}
            tone={accuracy > 0.85 ? 'good' : accuracy > 0.6 ? 'warn' : 'bad'}
          />
          <StatCard label={tr.stHeads} value={(obs.filter((o) => o === 1).length / T).toFixed(3)} />
          <StatCard label={tr.stLoadedTrue} value={(states.filter((s) => s === 1).length / T).toFixed(3)} />
          <StatCard label={tr.stLoadedDec} value={(decoded.filter((s) => s === 1).length / T).toFixed(3)} />
        </div>
      </div>

      <h2>{tr.chart1}</h2>
      <Plot
        data={[
          {
            x: tAxis,
            y: obs,
            type: 'bar',
            name: tr.legObs,
            marker: { color: '#8aa0c5' },
          },
        ]}
        layout={{ xaxis: { title: tr.axisT }, yaxis: { title: tr.axisObs, range: [-0.1, 1.1], tickvals: [0, 1] } }}
        height={200}
      />

      <h2>{tr.chart2}</h2>
      <Plot
        data={[
          {
            x: tAxis,
            y: states,
            type: 'scatter',
            mode: 'lines',
            line: { shape: 'hv', color: '#38bdf8' },
            name: tr.legTrue,
          },
          {
            x: tAxis,
            y: decoded,
            type: 'scatter',
            mode: 'lines',
            line: { shape: 'hv', color: '#f59e0b', dash: 'dash' },
            name: tr.legDec,
          },
        ]}
        layout={{
          xaxis: { title: tr.axisT },
          yaxis: { title: tr.axisState, tickvals: [0, 1], range: [-0.2, 1.2] },
        }}
        height={260}
      />

      <h2>{cmn.sections.sampleCode}</h2>
      <CodeBlock
        code={`import numpy as np
from hmmlearn import hmm  # pip install hmmlearn

rng = np.random.default_rng(${seed})

A_true = np.array([[${p_stayFair.toFixed(2)}, ${(1 - p_stayFair).toFixed(2)}],
                   [${(1 - p_stayLoaded).toFixed(2)}, ${p_stayLoaded.toFixed(2)}]])
B_true = np.array([[${(1 - p_headsFair).toFixed(2)}, ${p_headsFair.toFixed(2)}],
                   [${(1 - p_headsLoaded).toFixed(2)}, ${p_headsLoaded.toFixed(2)}]])

def simulate(T, pi, A, B, rng):
    z = [rng.choice(2, p=pi)]
    x = [rng.choice(2, p=B[z[0]])]
    for _ in range(T - 1):
        z.append(rng.choice(2, p=A[z[-1]]))
        x.append(rng.choice(2, p=B[z[-1]]))
    return np.array(z), np.array(x)

z_true, x = simulate(${T}, np.array([0.5, 0.5]), A_true, B_true, rng)

model = hmm.CategoricalHMM(n_components=2, init_params='')
model.startprob_ = np.array([0.5, 0.5])
model.transmat_ = A_true
model.emissionprob_ = B_true
z_hat = model.predict(x.reshape(-1, 1))
print("accuracy:", np.mean(z_hat == z_true))`}
      />
    </>
  );
}
