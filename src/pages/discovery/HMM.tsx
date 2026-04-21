import { useMemo, useState } from 'react';
import { Plot } from '../../components/Plot';
import { Slider } from '../../components/Slider';
import { MathBlock } from '../../components/MathBlock';
import { CodeBlock } from '../../components/CodeBlock';
import { StatCard } from '../../components/StatCard';
import { mulberry32 } from '../../lib/random';
import { simulateHmm, viterbi } from '../../lib/hmm';

export function HMM() {
  // 2 状態 × 2 観測カテゴリ (表/裏) のイカサマ / 通常コインモデル
  const [T, setT] = useState(120);
  const [p_stayFair, setStayFair] = useState(0.95);
  const [p_stayLoaded, setStayLoaded] = useState(0.90);
  const [p_headsFair, setHeadsFair] = useState(0.5);
  const [p_headsLoaded, setHeadsLoaded] = useState(0.85);
  const [seed, setSeed] = useState(17);
  // 推論時に使うパラメータ (真値と違えてロバスト性を見る)
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
        [1 - p_headsFair, p_headsFair], // 0=裏, 1=表
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
        隠れマルコフモデル (HMM) <span className="tag discovery">音声・バイオ</span>
      </h1>
      <p className="lede">
        直接は観測できない「隠れ状態」がマルコフ過程に従って遷移し、各状態から観測値が確率的に生成されるモデルです。
        ここではコイン投げの例 (イカサマ / 通常) を使い、
        <span className="tooltip" data-tip="観測列から最尤の状態列を動的計画法で求めるアルゴリズム">
          ビタビアルゴリズム
        </span>
        で隠れ状態を復号します。
      </p>

      <h2>モデル</h2>
      <MathBlock tex={String.raw`z_t \in \{\text{Fair}, \text{Loaded}\}, \ P(z_t \mid z_{t-1}) = A_{z_{t-1}, z_t}`} />
      <MathBlock tex={String.raw`x_t \in \{\text{裏}, \text{表}\}, \ P(x_t \mid z_t) = B_{z_t, x_t}`} />
      <MathBlock
        tex={String.raw`\hat{z}_{1:T} = \arg\max_{z_{1:T}} P(z_{1:T}, x_{1:T}) \quad \text{(Viterbi)}`}
      />

      <h2>パラメータ操作 (真のモデル)</h2>
      <div className="panel">
        <div className="controls">
          <Slider label="系列長 T" value={T} min={30} max={500} step={1} onChange={setT} />
          <Slider
            label="Fair 状態に留まる確率"
            value={p_stayFair}
            min={0.5}
            max={0.99}
            step={0.01}
            onChange={setStayFair}
          />
          <Slider
            label="Loaded 状態に留まる確率"
            value={p_stayLoaded}
            min={0.5}
            max={0.99}
            step={0.01}
            onChange={setStayLoaded}
          />
          <Slider
            label="Fair で表の確率"
            value={p_headsFair}
            min={0.1}
            max={0.9}
            step={0.01}
            onChange={setHeadsFair}
          />
          <Slider
            label="Loaded で表の確率"
            value={p_headsLoaded}
            min={0.5}
            max={0.99}
            step={0.01}
            onChange={setHeadsLoaded}
          />
          <Slider label="乱数シード" value={seed} min={1} max={999} step={1} onChange={setSeed} />
        </div>
      </div>

      <h2>パラメータ操作 (推論モデル)</h2>
      <div className="panel">
        <p style={{ marginTop: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          真のパラメータと違う値を設定すると、誤仕様のモデルでどの程度うまく復号できるかを観察できます。
        </p>
        <div className="controls">
          <Slider
            label="推論: Fair 継続確率"
            value={inferStayFair}
            min={0.5}
            max={0.99}
            step={0.01}
            onChange={setInferStayFair}
          />
          <Slider
            label="推論: Loaded 継続確率"
            value={inferStayLoaded}
            min={0.5}
            max={0.99}
            step={0.01}
            onChange={setInferStayLoaded}
          />
          <Slider
            label="推論: Loaded で表の確率"
            value={inferHeadsLoaded}
            min={0.5}
            max={0.99}
            step={0.01}
            onChange={setInferHeadsLoaded}
          />
        </div>
        <div className="stats-grid">
          <StatCard
            label="復号精度"
            value={accuracy.toFixed(3)}
            tone={accuracy > 0.85 ? 'good' : accuracy > 0.6 ? 'warn' : 'bad'}
          />
          <StatCard
            label="表の比率 (観測)"
            value={(obs.filter((o) => o === 1).length / T).toFixed(3)}
          />
          <StatCard
            label="Loaded 期間の割合 (真)"
            value={(states.filter((s) => s === 1).length / T).toFixed(3)}
          />
          <StatCard
            label="Loaded 期間の割合 (復号)"
            value={(decoded.filter((s) => s === 1).length / T).toFixed(3)}
          />
        </div>
      </div>

      <h2>グラフ 1: 観測系列 (表=1 / 裏=0)</h2>
      <Plot
        data={[
          {
            x: tAxis,
            y: obs,
            type: 'bar',
            name: '観測',
            marker: { color: '#8aa0c5' },
          },
        ]}
        layout={{ xaxis: { title: 't' }, yaxis: { title: '観測', range: [-0.1, 1.1], tickvals: [0, 1] } }}
        height={200}
      />

      <h2>グラフ 2: 真の隠れ状態 vs Viterbi 復号</h2>
      <Plot
        data={[
          {
            x: tAxis,
            y: states,
            type: 'scatter',
            mode: 'lines',
            line: { shape: 'hv', color: '#38bdf8' },
            name: '真の状態',
          },
          {
            x: tAxis,
            y: decoded,
            type: 'scatter',
            mode: 'lines',
            line: { shape: 'hv', color: '#f59e0b', dash: 'dash' },
            name: 'Viterbi 復号',
          },
        ]}
        layout={{
          xaxis: { title: 't' },
          yaxis: { title: '状態 (0=Fair, 1=Loaded)', tickvals: [0, 1], range: [-0.2, 1.2] },
        }}
        height={260}
      />

      <h2>サンプルコード</h2>
      <CodeBlock
        code={`import numpy as np
from hmmlearn import hmm  # pip install hmmlearn

rng = np.random.default_rng(${seed})

# 真のモデル
A_true = np.array([[${p_stayFair.toFixed(2)}, ${(1 - p_stayFair).toFixed(2)}],
                   [${(1 - p_stayLoaded).toFixed(2)}, ${p_stayLoaded.toFixed(2)}]])
B_true = np.array([[${(1 - p_headsFair).toFixed(2)}, ${p_headsFair.toFixed(2)}],
                   [${(1 - p_headsLoaded).toFixed(2)}, ${p_headsLoaded.toFixed(2)}]])

# 観測と状態の生成
def simulate(T, pi, A, B, rng):
    z = [rng.choice(2, p=pi)]
    x = [rng.choice(2, p=B[z[0]])]
    for _ in range(T - 1):
        z.append(rng.choice(2, p=A[z[-1]]))
        x.append(rng.choice(2, p=B[z[-1]]))
    return np.array(z), np.array(x)

z_true, x = simulate(${T}, np.array([0.5, 0.5]), A_true, B_true, rng)

# hmmlearn でビタビ復号
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
