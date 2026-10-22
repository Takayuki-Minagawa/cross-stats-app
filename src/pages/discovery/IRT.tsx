import { useMemo, useState } from 'react';
import { Plot } from '../../components/Plot';
import { Slider } from '../../components/Slider';
import { PageHeader } from '../../components/PageHeader';
import { PageNav } from '../../components/PageNav';
import { Missions } from '../../components/Missions';
import { Verdict } from '../../components/Verdict';
import { MathBlock } from '../../components/MathBlock';
import { CodeBlock } from '../../components/CodeBlock';
import { StatCard } from '../../components/StatCard';
import { linspace } from '../../lib/stats';
import { useLang } from '../../i18n';
import { t as commonT } from '../../i18n/common';

function icc(theta: number, a: number, b: number) {
  return 1 / (1 + Math.exp(-a * (theta - b)));
}

const text = {
  ja: {
    title: '項目応答理論 (IRT)',
    tag: '教育・心理測定',
    ledePrefix:
      'テストの合計点ではなく「問題ごとの難易度・識別力」と「受験者の潜在能力」を分離する測定モデルです。TOEFL・TOEIC をはじめとする大規模テストの採点や、心理尺度の項目評価で使われます。ここでは',
    model2PL: '2 パラメータロジスティックモデル (2PL)',
    model2PLTip: 'difficulty b と discrimination a の 2 つで問題を特徴づける',
    ledeSuffix: 'を扱います。',
    modelP:
      'θ_i: 受験者 i の潜在能力、b_j: 問題 j の難易度 (50% 正答となる能力)、a_j: 問題 j の識別力 (傾きの鋭さ)。',
    ability: '受験者能力',
    slTheta: 'θ (潜在能力)',
    question: (i: number) => `問題 ${i}`,
    slA: (i: number) => `識別力 a${i}`,
    slB: (i: number) => `難易度 b${i}`,
    stPcorrect: (i: number) => `P(正答 | 問題${i})`,
    stExpected: '期待正答数 (3 問中)',
    chart1: 'グラフ 1: アイテム特性曲線 (ICC)',
    chart2: 'グラフ 2: テスト情報関数 I(θ)',
    axisAbility: '能力 θ',
    axisProb: '正答確率',
    axisInfo: '情報量',
    legExam: (theta: number) => `受験者 θ = ${theta.toFixed(2)}`,
    legQ: (i: number, a: number, b: number) => `問題 ${i} (a=${a.toFixed(2)}, b=${b.toFixed(2)})`,
    infoNote:
      'I(θ) が高い領域ほど、その能力レベルの受験者を精度良く測れる。識別力 a を上げると対応する難易度 b 付近にピークが鋭く立つのが観察できます。',
    verdict: (e: string) => `この受験者は 3 問中、平均 ${e} 問正解すると予測されます`,
    takeExam: '📝 この受験者に解かせてみる',
    examResult: (k: number) => `結果: ${k} / 3 問正解`,
    m1: '期待正答数を 2.7 以上にしよう',
    m2: 'テスト情報量のピークを 3 以上にしよう (高精度なテスト)',
    m3: '3 問すべての正答確率を 50% ±2% にそろえよう (適応型テストの考え方)',
  },
  en: {
    title: 'Item Response Theory (IRT)',
    tag: 'Education / Psychometrics',
    ledePrefix:
      "A measurement model that separates each item's difficulty and discrimination from examinee ability, rather than relying on raw totals. Widely used in large-scale tests (TOEFL, TOEIC, etc.) and psychometric scale evaluation. Here we cover the ",
    model2PL: 'two-parameter logistic (2PL) model',
    model2PLTip: 'Each item is characterized by difficulty b and discrimination a',
    ledeSuffix: '.',
    modelP:
      'θ_i: latent ability of examinee i. b_j: difficulty of item j (ability at 50% correct). a_j: discrimination of item j (steepness).',
    ability: 'Examinee ability',
    slTheta: 'θ (latent ability)',
    question: (i: number) => `Item ${i}`,
    slA: (i: number) => `Discrimination a${i}`,
    slB: (i: number) => `Difficulty b${i}`,
    stPcorrect: (i: number) => `P(correct | item${i})`,
    stExpected: 'Expected correct (out of 3)',
    chart1: 'Graph 1: Item characteristic curves (ICC)',
    chart2: 'Graph 2: Test information function I(θ)',
    axisAbility: 'Ability θ',
    axisProb: 'P(correct)',
    axisInfo: 'Information',
    legExam: (theta: number) => `Examinee θ = ${theta.toFixed(2)}`,
    legQ: (i: number, a: number, b: number) => `Item ${i} (a=${a.toFixed(2)}, b=${b.toFixed(2)})`,
    infoNote:
      'Higher I(θ) means more precise measurement at that ability level. Increasing a produces a sharper peak near the corresponding difficulty b.',
    verdict: (e: string) => `This examinee is expected to answer ${e} of 3 items correctly`,
    takeExam: '📝 Let this examinee take the test',
    examResult: (k: number) => `Result: ${k} / 3 correct`,
    m1: 'Raise the expected number correct to 2.7 or more',
    m2: 'Push the peak of the test information above 3 (a high-precision test)',
    m3: 'Tune all three items to a 50% ±2% chance of success (the idea behind adaptive testing)',
  },
} as const;

export function IRT() {
  const { lang } = useLang();
  const tr = text[lang];
  const cmn = commonT(lang);

  const [aParams, setA] = useState([1.0, 1.5, 2.0]);
  const [bParams, setB] = useState([-1.0, 0.0, 1.5]);
  const [ability, setAbility] = useState(0.5);
  const [exam, setExam] = useState<{ answers: boolean[]; n: number } | null>(null);

  const thetas = useMemo(() => linspace(-4, 4, 200), []);
  const curves = useMemo(
    () => aParams.map((a, i) => thetas.map((t) => icc(t, a, bParams[i]))),
    [aParams, bParams, thetas],
  );
  const predictions = useMemo(
    () => aParams.map((a, i) => icc(ability, a, bParams[i])),
    [aParams, bParams, ability],
  );
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
      <PageHeader
        topic="irt"
        title={tr.title}
        tagLabel={tr.tag}
        lede={
          <>
            {tr.ledePrefix}
            <span className="tooltip" data-tip={tr.model2PLTip}>
              {tr.model2PL}
            </span>
            {tr.ledeSuffix}
          </>
        }
      />

      <h2>{cmn.sections.model}</h2>
      <MathBlock tex={String.raw`P(X_{ij} = 1 \mid \theta_i, a_j, b_j) = \frac{1}{1 + \exp\{-a_j(\theta_i - b_j)\}}`} />
      <p>{tr.modelP}</p>

      <h2>{cmn.sections.parameters}</h2>
      <div className="panel">
        <h3 style={{ marginTop: 0 }}>{tr.ability}</h3>
        <Slider label={tr.slTheta} value={ability} min={-3} max={3} step={0.05} onChange={setAbility} />
        {[0, 1, 2].map((i) => (
          <div key={i}>
            <h3>{tr.question(i + 1)}</h3>
            <div className="controls">
              <Slider
                label={tr.slA(i + 1)}
                value={aParams[i]}
                min={0.2}
                max={3}
                step={0.05}
                onChange={(v) => {
                  const next = [...aParams];
                  next[i] = v;
                  setA(next);
                }}
              />
              <Slider
                label={tr.slB(i + 1)}
                value={bParams[i]}
                min={-3}
                max={3}
                step={0.05}
                onChange={(v) => {
                  const next = [...bParams];
                  next[i] = v;
                  setB(next);
                }}
              />
            </div>
          </div>
        ))}
        <div className="stats-grid">
          {[0, 1, 2].map((i) => (
            <StatCard key={i} label={tr.stPcorrect(i + 1)} value={predictions[i].toFixed(3)} tone="good" />
          ))}
          <StatCard
            label={tr.stExpected}
            value={predictions.reduce((s, v) => s + v, 0).toFixed(2)}
          />
        </div>
        <Verdict tone="info" icon="🧑‍🎓">
          {tr.verdict(predictions.reduce((s, v) => s + v, 0).toFixed(2))}
        </Verdict>
        <div className="btn-row">
          <button
            type="button"
            className="btn primary"
            onClick={() =>
              setExam((e) => ({ answers: predictions.map((p) => Math.random() < p), n: (e?.n ?? 0) + 1 }))
            }
          >
            {tr.takeExam}
          </button>
          {exam && (
            <span className="exam-result" key={exam.n}>
              {exam.answers.map((ok, i) => (
                <span key={i} className={`exam-mark ${ok ? 'ok' : 'ng'}`}>
                  Q{i + 1} {ok ? '⭕' : '❌'}
                </span>
              ))}
              <strong>{tr.examResult(exam.answers.filter(Boolean).length)}</strong>
            </span>
          )}
        </div>
      </div>

      <Missions
        page="irt"
        missions={[
          { id: 'high-score', text: tr.m1, done: predictions.reduce((s, v) => s + v, 0) >= 2.7 },
          { id: 'precise', text: tr.m2, done: Math.max(...info) >= 3 },
          { id: 'adaptive', text: tr.m3, done: predictions.every((p) => Math.abs(p - 0.5) <= 0.02) },
        ]}
      />

      <h2>{tr.chart1}</h2>
      <Plot
        data={[
          ...curves.map((c, i) => ({
            x: thetas,
            y: c,
            type: 'scatter' as const,
            mode: 'lines' as const,
            name: tr.legQ(i + 1, aParams[i], bParams[i]),
            line: { color: ['#38bdf8', '#a78bfa', '#34d399'][i] },
          })),
          {
            x: [ability, ability],
            y: [0, 1],
            type: 'scatter',
            mode: 'lines',
            line: { color: '#f87171', dash: 'dash' },
            name: tr.legExam(ability),
          },
        ]}
        layout={{ xaxis: { title: tr.axisAbility }, yaxis: { title: tr.axisProb } }}
      />

      <h2>{tr.chart2}</h2>
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
        layout={{ xaxis: { title: tr.axisAbility }, yaxis: { title: tr.axisInfo } }}
      />
      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{tr.infoNote}</p>

      <h2>{cmn.sections.sampleCode}</h2>
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
plt.axvline(${ability.toFixed(2)}, ls='--', c='red', label='theta')
plt.xlabel('ability theta'); plt.ylabel('P(correct)'); plt.legend(); plt.show()

# To estimate from real response data use py-irt or girth.
# from girth import twopl_mml
# est_a, est_b = twopl_mml(response_matrix)`}
      />
      <PageNav />
    </>
  );
}
