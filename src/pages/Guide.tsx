import { useLang } from '../i18n';

const text = {
  ja: {
    title: '使い方ガイド',
    lede: '本アプリを最大限活用するための短い導入です。難しい操作は無く、スライダーを動かしながら数式と結果の対応を眺めるだけで十分学べます。',
    section1: 'ページの構成',
    s1body:
      '各手法のページは次の順に並んでいます。上から読み進めれば無理なく理解できるはずです。',
    s1items: [
      '概要と直感的な説明',
      '数式による定式化 (KaTeX でレンダリング)',
      'パラメータを操作するスライダー群と主要な統計量カード',
      'インタラクティブグラフ (Plotly。ホバーで数値確認・ズーム・PNG ダウンロード可)',
      'Python のサンプルコード (コピーボタンで手元 Jupyter に貼り付け可能)',
    ],
    section2: 'グラフの操作',
    s2items: [
      'マウスドラッグ: 範囲をドラッグすると領域ズーム',
      'ダブルクリック: 全体表示に戻る',
      'ホバー: 各点の正確な数値を表示',
      '右上のアイコン: パン、リセット、PNG 保存などが利用可能',
    ],
    section3: 'テーマと言語の切替',
    s3body:
      'サイドバー下部 (スマートフォンでは左上の ☰ メニュー内) に 2 つのトグルがあります。「ダーク / ライト」テーマと「日本語 / English」言語の切り替えが可能で、選択内容はブラウザのローカルストレージに保存されます。',
    sectionM: 'ミッションと進捗',
    sMitems: [
      '各ページには 3 つの「ミッション」があります。スライダーを動かして条件を満たすと自動で達成になり、紙吹雪でお祝いします。',
      '達成数に応じてサイドバーの称号が「統計ビギナー」→「統計マスター」へと上がっていきます。',
      'すべてのミッションを達成したページには ✓ が付きます。進捗はホーム画面からリセットできます。',
      '「🎲」ボタンで乱数シードをランダムに変更できます。偶然に左右される結果 (第一種の過誤など) を探すミッションで便利です。',
    ],
    sectionG: '相関当てゲーム',
    sGbody:
      '散布図から相関係数 r を当てるミニゲームです。誤差 0.05 以内で Perfect (ライフ +1)、0.15 を超えるとライフ −1。連続正解でボーナス点が増えます。キーボードの Enter で決定・次へ進めます。',
    sectionK: 'ショートカットとアプリ化',
    sKitems: [
      'Ctrl + K (Mac は ⌘ + K) でページ検索を開き、キーワードで素早く移動できます。',
      '対応ブラウザでは「アプリとしてインストール」ボタンが表示され、ホーム画面やデスクトップから起動できます。',
      '一度開いたページはオフラインでも閲覧できます (Service Worker によるキャッシュ)。',
    ],
    section4: '結果の読み方 (統計量カード)',
    s4items: [
      'p 値: 緑 (< 0.05) は「有意」。ただし効果の大きさを意味するわけではない点に注意。',
      '信頼区間 / HDI: 推定値の不確かさを表します。0 をまたぐかどうかが判断の目安になります。',
      'R²: 0 に近いほどモデル説明力が弱く、1 に近いほど強い (過剰適合に注意)。',
      '受容率 (MCMC): 0.2 〜 0.5 が理想。ずれたら提案分布 SD を調整してください。',
    ],
    section5: 'サンプルコードの使い方',
    s5body:
      '各ページ末尾の Python コードは、同じ分析を NumPy / SciPy / PyMC / lifelines などで行うための参考実装です。「コピー」ボタンで全文をクリップボードに取得でき、Jupyter などに貼り付けてそのまま実行できます。',
    section6: '注意事項',
    s6items: [
      'すべての計算はあなたのブラウザ上で行われます。サーバには何も送信されません。',
      '学習用途を前提に単純な実装を採用しています。本格的な分析では専門ライブラリを推奨します。',
      '乱数はシード付きのため、同じシードでは常に同じ結果が得られます。',
    ],
  },
  en: {
    title: 'User Guide',
    lede: 'A short guide to help you get the most out of this app. There are no complex operations — simply move the sliders and watch how the formulas and outputs respond.',
    section1: 'Page layout',
    s1body: 'Each method page is organized top-to-bottom as follows. Reading in order should be sufficient for understanding.',
    s1items: [
      'Overview and intuitive explanation',
      'Formal definition via formulas (rendered with KaTeX)',
      'Parameter sliders and a grid of key statistic cards',
      'Interactive plots (Plotly — hover to inspect, zoom, download as PNG)',
      'Python sample code (copy button; paste directly into your Jupyter session)',
    ],
    section2: 'Working with the plots',
    s2items: [
      'Drag: select a rectangle to zoom into a region',
      'Double-click: reset to the original view',
      'Hover: reveal exact values at a point',
      'Top-right icons: pan, reset, download PNG, and more',
    ],
    section3: 'Theme and language',
    s3body:
      'Two toggles sit at the bottom of the sidebar (inside the ☰ menu on phones): dark/light theme and Japanese/English. Your choices are persisted in the browser local storage.',
    sectionM: 'Missions and progress',
    sMitems: [
      'Each page has three missions. Move the sliders to satisfy a condition and it completes automatically — with confetti.',
      'Your sidebar title rises from "Stats Beginner" to "Stats Master" as you clear more missions.',
      'Pages with every mission cleared get a ✓. You can reset progress from the home screen.',
      'The 🎲 button picks a random seed — handy for missions that depend on chance (e.g. Type I errors).',
    ],
    sectionG: 'Guess the Correlation',
    sGbody:
      'A mini game where you guess the correlation r from a scatter plot. Within 0.05 is Perfect (+1 life); missing by more than 0.15 costs a life. Streaks add bonus points. Press Enter to submit and advance.',
    sectionK: 'Shortcuts and installing',
    sKitems: [
      'Press Ctrl + K (⌘ + K on Mac) to open the page search and jump anywhere by keyword.',
      'On supported browsers an "Install as app" button appears so you can launch it from your home screen or desktop.',
      'Pages you have opened once remain available offline (cached by a service worker).',
    ],
    section4: 'Reading the statistic cards',
    s4items: [
      'p-value: green (< 0.05) marks significance. Note this does not tell you effect size.',
      'Confidence interval / HDI: the uncertainty of the estimate. Whether it crosses 0 is a quick guideline.',
      'R²: close to 0 means weak explanation, close to 1 means strong (watch out for overfitting).',
      'Acceptance rate (MCMC): aim for 0.2–0.5. Adjust the proposal SD if it falls outside.',
    ],
    section5: 'Using the sample code',
    s5body:
      'The Python block at the bottom of each page is a reference implementation that performs the same analysis with NumPy / SciPy / PyMC / lifelines, etc. The copy button grabs the full snippet for pasting into Jupyter.',
    section6: 'Notes',
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
      <header className="page-header cat-guide">
        <div className="page-icon" aria-hidden="true">
          📖
        </div>
        <div className="page-header-body">
          <h1>{tr.title}</h1>
          <p className="lede">{tr.lede}</p>
        </div>
      </header>

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

      <h2>{tr.sectionM}</h2>
      <ul>
        {tr.sMitems.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>

      <h2>{tr.sectionG}</h2>
      <p>{tr.sGbody}</p>

      <h2>{tr.sectionK}</h2>
      <ul>
        {tr.sKitems.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>

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
