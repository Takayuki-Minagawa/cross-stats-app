import { useMemo, useState } from 'react';
import { Plot } from '../../components/Plot';
import { Slider } from '../../components/Slider';
import { MathBlock } from '../../components/MathBlock';
import { CodeBlock } from '../../components/CodeBlock';
import { StatCard } from '../../components/StatCard';
import { linspace } from '../../lib/stats';

// 2 パラメータロジスティックモデル (2PL)
// P(正答 | θ) = 1 / (1 + exp(-a(θ - b)))
function icc(theta: number, a: number, b: number) {
  return 1 / (1 + Math.exp(-a * (theta - b)));
}

export function IRT() {
  const [aParams, setA] = useState([1.0, 1.5, 2.0]);
  const [bParams, setB] = useState([-1.0, 0.0, 1.5]);
  const [ability, setAbility] = useState(0.5);

  const thetas = useMemo(() => linspace(-4, 4, 200), []);
  const curves = useMemo(
    () => aParams.map((a, i) => thetas.map((t) => icc(t, a, bParams[i]))),
    [aParams, bParams, thetas],
  );

  const predictions = useMemo(
    () => aParams.map((a, i) => icc(ability, a, bParams[i])),
    [aParams, bParams, ability],
  );

  // テスト情報関数 I(θ) = Σ a²P(1-P)
  const info = useMemo(
    () =>
      thetas.map((t) =>
        aParams.reduce((s, a, i) => {
          const p = icc(t, a, bParams[i]);
          return s + a * a * p * (1 - p);
        }, 0),
      ),
    [thetas, aParams, bParams],
  );

  return (
    <>
      <h1>
        項目応答理論 (IRT) <span className="tag discovery">教育・心理測定</span>
      </h1>
      <p className="lede">
        テストの合計点ではなく「問題ごとの難易度・識別力」と「受験者の潜在能力」を分離する測定モデルです。
        TOEFL・TOEIC をはじめとする大規模テストの採点や、心理尺度の項目評価で使われます。ここでは
        <span className="tooltip" data-tip="difficulty b と discrimination a の 2 つで問題を特徴づける">
          2 パラメータロジスティックモデル (2PL)
        </span>
        を扱います。
      </p>

      <h2>モデル</h2>
      <MathBlock tex={String.raw`P(X_{ij} = 1 \mid \theta_i, a_j, b_j) = \frac{1}{1 + \exp\{-a_j(\theta_i - b_j)\}}`} />
      <p>
        <code>θ_i</code>: 受験者 i の潜在能力、<code>b_j</code>: 問題 j の難易度 (50% 正答となる能力)、
        <code>a_j</code>: 問題 j の識別力 (傾きの鋭さ)。
      </p>

      <h2>パラメータ操作</h2>
      <div className="panel">
        <h3 style={{ marginTop: 0 }}>受験者能力</h3>
        <Slider
          label="θ (潜在能力)"
          value={ability}
          min={-3}
          max={3}
          step={0.05}
          onChange={setAbility}
        />
        <h3>問題 1</h3>
        <div className="controls">
          <Slider
            label="識別力 a₁"
            value={aParams[0]}
            min={0.2}
            max={3}
            step={0.05}
            onChange={(v) => setA([v, aParams[1], aParams[2]])}
          />
          <Slider
            label="難易度 b₁"
            value={bParams[0]}
            min={-3}
            max={3}
            step={0.05}
            onChange={(v) => setB([v, bParams[1], bParams[2]])}
          />
        </div>
        <h3>問題 2</h3>
        <div className="controls">
          <Slider
            label="識別力 a₂"
            value={aParams[1]}
            min={0.2}
            max={3}
            step={0.05}
            onChange={(v) => setA([aParams[0], v, aParams[2]])}
          />
          <Slider
            label="難易度 b₂"
            value={bParams[1]}
            min={-3}
            max={3}
            step={0.05}
            onChange={(v) => setB([bParams[0], v, bParams[2]])}
          />
        </div>
        <h3>問題 3</h3>
        <div className="controls">
          <Slider
            label="識別力 a₃"
            value={aParams[2]}
            min={0.2}
            max={3}
            step={0.05}
            onChange={(v) => setA([aParams[0], aParams[1], v])}
          />
          <Slider
            label="難易度 b₃"
            value={bParams[2]}
            min={-3}
            max={3}
            step={0.05}
            onChange={(v) => setB([bParams[0], bParams[1], v])}
          />
        </div>
        <div className="stats-grid">
          <StatCard label="P(正答 | 問題1)" value={predictions[0].toFixed(3)} tone="good" />
          <StatCard label="P(正答 | 問題2)" value={predictions[1].toFixed(3)} tone="good" />
          <StatCard label="P(正答 | 問題3)" value={predictions[2].toFixed(3)} tone="good" />
          <StatCard
            label="期待正答数 (3 問中)"
            value={predictions.reduce((s, v) => s + v, 0).toFixed(2)}
          />
        </div>
      </div>

      <h2>グラフ 1: アイテム特性曲線 (ICC)</h2>
      <Plot
        data={[
          ...curves.map((c, i) => ({
            x: thetas,
            y: c,
            type: 'scatter' as const,
            mode: 'lines' as const,
            name: `問題 ${i + 1} (a=${aParams[i].toFixed(2)}, b=${bParams[i].toFixed(2)})`,
            line: { color: ['#38bdf8', '#a78bfa', '#34d399'][i] },
          })),
          {
            x: [ability, ability],
            y: [0, 1],
            type: 'scatter',
            mode: 'lines',
            line: { color: '#f87171', dash: 'dash' },
            name: `受験者 θ = ${ability.toFixed(2)}`,
          },
        ]}
        layout={{ xaxis: { title: '能力 θ' }, yaxis: { title: '正答確率' } }}
      />

      <h2>グラフ 2: テスト情報関数 I(θ)</h2>
      <Plot
        data={[
          {
            x: thetas,
            y: info,
            type: 'scatter',
            mode: 'lines',
            fill: 'tozeroy',
            fillcolor: 'rgba(52, 211, 153, 0.15)',
            line: { color: '#34d399' },
            name: 'I(θ)',
          },
        ]}
        layout={{ xaxis: { title: '能力 θ' }, yaxis: { title: '情報量' } }}
      />
      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
        I(θ) が高い領域ほど、その能力レベルの受験者を精度良く測れる。識別力 a
        を上げると対応する難易度 b 付近にピークが鋭く立つのが観察できます。
      </p>

      <h2>サンプルコード</h2>
      <CodeBlock
        code={`import numpy as np
import matplotlib.pyplot as plt

def icc(theta, a, b):
    return 1 / (1 + np.exp(-a * (theta - b)))

thetas = np.linspace(-4, 4, 200)
items = [
    dict(a=${aParams[0].toFixed(2)}, b=${bParams[0].toFixed(2)}),
    dict(a=${aParams[1].toFixed(2)}, b=${bParams[1].toFixed(2)}),
    dict(a=${aParams[2].toFixed(2)}, b=${bParams[2].toFixed(2)}),
]

for i, it in enumerate(items, 1):
    plt.plot(thetas, icc(thetas, **it), label=f"Q{i} (a={it['a']}, b={it['b']})")
plt.axvline(${ability.toFixed(2)}, ls='--', c='red', label='θ')
plt.xlabel('ability θ'); plt.ylabel('P(correct)'); plt.legend(); plt.show()

# 実データから推定する場合 (py-irt または girth を使用)
# from girth import twopl_mml
# est_a, est_b = twopl_mml(response_matrix)`}
      />
    </>
  );
}
