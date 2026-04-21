import { useLang } from '../i18n';

const text = {
  ja: {
    title: '使い方ガイド',
    lede: '本アプリを最大限活用するための短い導入です。難しい操作は無く、スライダーを動かしながら数式と結果の対応を眺めるだけで十分学べます。',
    section1: '1. ページの構成',
    s1body:
      '各手法のページは次の順に並んでいます。上から読み進めれば無理なく理解できるはずです。',
    s1items: [
      '概要と直感的な説明',
      '数式による定式化 (KaTeX でレンダリング)',
      'パラメータを操作するスライダー群と主要な統計量カード',
      'インタラクティブグラフ (Plotly。ホバーで数値確認・ズーム・PNG ダウンロード可)',
      'Python のサンプルコード (コピーボタンで手元 Jupyter に貼り付け可能)',
    ],
    section2: '2. グラフの操作',
    s2items: [
      'マウスドラッグ: 範囲をドラッグすると領域ズーム',
      'ダブルクリック: 全体表示に戻る',
      'ホバー: 各点の正確な数値を表示',
      '右上のアイコン: パン、リセット、PNG 保存などが利用可能',
    ],
    section3: '3. テーマと言語の切替',
    s3body:
      'サイドバー左上に 2 つのトグルがあります。「ダーク / ライト」テーマと「日本語 / English」言語の切り替えが可能で、選択内容はブラウザのローカルストレージに保存されます。',
    section4: '4. 結果の読み方 (統計量カード)',
    s4items: [
      'p 値: 緑 (< 0.05) は「有意」。ただし効果の大きさを意味するわけではない点に注意。',
      '信頼区間 / HDI: 推定値の不確かさを表します。0 をまたぐかどうかが判断の目安になります。',
      'R²: 0 に近いほどモデル説明力が弱く、1 に近いほど強い (過剰適合に注意)。',
      '受容率 (MCMC): 0.2 〜 0.5 が理想。ずれたら提案分布 SD を調整してください。',
    ],
    section5: '5. サンプルコードの使い方',
    s5body:
      '各ページ末尾の Python コードは、同じ分析を NumPy / SciPy / PyMC / lifelines などで行うための参考実装です。「コピー」ボタンで全文をクリップボードに取得でき、Jupyter などに貼り付けてそのまま実行できます。',
    section6: '6. 注意事項',
    s6items: [
      'すべての計算はあなたのブラウザ上で行われます。サーバには何も送信されません。',
      '学習用途を前提に単純な実装を採用しています。本格的な分析では専門ライブラリを推奨します。',
      '乱数はシード付きのため、同じシードでは常に同じ結果が得られます。',
    ],
  },
  en: {
    title: 'User Guide',
    lede: 'A short guide to help you get the most out of this app. There are no complex operations — simply move the sliders and watch how the formulas and outputs respond.',
    section1: '1. Page layout',
    s1body: 'Each method page is organized top-to-bottom as follows. Reading in order should be sufficient for understanding.',
    s1items: [
      'Overview and intuitive explanation',
      'Formal definition via formulas (rendered with KaTeX)',
      'Parameter sliders and a grid of key statistic cards',
      'Interactive plots (Plotly — hover to inspect, zoom, download as PNG)',
      'Python sample code (copy button; paste directly into your Jupyter session)',
    ],
    section2: '2. Working with the plots',
    s2items: [
      'Drag: select a rectangle to zoom into a region',
      'Double-click: reset to the original view',
      'Hover: reveal exact values at a point',
      'Top-right icons: pan, reset, download PNG, and more',
    ],
    section3: '3. Theme and language',
    s3body:
      'Two toggles appear at the top of the sidebar: dark/light theme and Japanese/English. Your choices are persisted in the browser local storage.',
    section4: '4. Reading the statistic cards',
    s4items: [
      'p-value: green (< 0.05) marks significance. Note this does not tell you effect size.',
      'Confidence interval / HDI: the uncertainty of the estimate. Whether it crosses 0 is a quick guideline.',
      'R²: close to 0 means weak explanation, close to 1 means strong (watch out for overfitting).',
      'Acceptance rate (MCMC): aim for 0.2–0.5. Adjust the proposal SD if it falls outside.',
    ],
    section5: '5. Using the sample code',
    s5body:
      'The Python block at the bottom of each page is a reference implementation that performs the same analysis with NumPy / SciPy / PyMC / lifelines, etc. The copy button grabs the full snippet for pasting into Jupyter.',
    section6: '6. Notes',
    s6items: [
      'All computation happens in your browser. Nothing is sent to a server.',
      'Simple implementations are chosen for educational clarity. For production use, rely on specialized libraries.',
      'Random numbers are seeded, so the same seed always produces the same result.',
    ],
  },
} as const;

export function Guide() {
  const { lang } = useLang();
  const tr = text[lang];
  return (
    <>
      <h1>{tr.title}</h1>
      <p className="lede">{tr.lede}</p>

      <h2>{tr.section1}</h2>
      <p>{tr.s1body}</p>
      <ol>
        {tr.s1items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ol>

      <h2>{tr.section2}</h2>
      <ul>
        {tr.s2items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>

      <h2>{tr.section3}</h2>
      <p>{tr.s3body}</p>

      <h2>{tr.section4}</h2>
      <ul>
        {tr.s4items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>

      <h2>{tr.section5}</h2>
      <p>{tr.s5body}</p>

      <h2>{tr.section6}</h2>
      <ul>
        {tr.s6items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </>
  );
}
