# Cross Stats App

古典統計・ベイズ統計・分野特化統計の主要手法を、**スライダー操作とインタラクティブグラフ**で直感的に学べるブラウザ完結型の学習アプリケーションです。すべての計算は JavaScript 上で実行され、Python ランタイムやバックエンドサーバを必要としない**静的 SPA** として構成されています。

> 本アプリは教育・可視化を目的としています。実務で本格的な統計分析を行う際は、PyMC / statsmodels / lifelines / hmmlearn 等の成熟したライブラリの利用を推奨します。

**UI 機能**

- 🌗 **ダーク / ライト モード切替** (初回起動時は OS 設定に追従、以後は選択を保存)
- 🌐 **日本語 / English 切替** (選択を保存)
- 📖 アプリ内「**使い方ガイド**」ページ (日英両対応)

---

## 概要

統計手法の理解は、**数式だけ**・**コードだけ**・**出力結果だけ**ではなかなか深まりません。本アプリは、

1. 理論 (解説 + 数式)
2. パラメータの操作 (スライダー)
3. 挙動の確認 (Plotly によるインタラクティブグラフ)
4. 実装例 (Python サンプルコード)

を 1 ページに集約することで、3 つの視点を往復しながら学習できる構成になっています。
全体のテーマは以下の 3 領域 × 各 3 トピックの計 9 ページです。

### 収録トピック

#### 古典統計 (頻度論)
| ページ | 内容 |
| --- | --- |
| **t 検定** | Welch の 2 標本 t 検定。サンプルサイズ・効果量・群内分散が p 値と信頼区間に与える影響を可視化 |
| **分散分析 (ANOVA)** | 一元配置 F 検定。群間 / 群内分散の分解と F 統計量の帰無分布を表示 |
| **重回帰分析** | 最小二乗法 (OLS)。説明変数間の相関を操作し、多重共線性による係数 SE の膨張を観察 |

#### ベイズ統計
| ページ | 内容 |
| --- | --- |
| **コイン投げのベイズ更新** | ベータ–二項共役モデル。事前分布 → 事後分布の閉形式更新 |
| **MCMC ベイズ回帰** | Metropolis–Hastings 法で 3 パラメータ `(β₀, β₁, log σ)` をサンプリング。トレースプロット・事後予測バンド・95% HDI |
| **階層ベイズ** | 正規–正規共役による部分プーリング近似。無プーリング / 部分プーリング / 完全プーリングを同じグラフ上で比較 |

#### 分野特化の手法 (ディスカバリー)
| ページ | 内容 | 主な応用分野 |
| --- | --- | --- |
| **項目応答理論 (IRT)** | 2 パラメータロジスティックモデル。アイテム特性曲線 (ICC) とテスト情報関数 | 教育測定・心理学 |
| **生存時間分析** | Kaplan–Meier 推定量と log-rank 検定。打ち切りデータの扱い方を実装レベルで確認 | 医学・疫学・マーケティング |
| **隠れマルコフモデル** | 2 状態 HMM のシミュレーションとビタビアルゴリズムによる復号。誤仕様モデルのロバスト性も検証可能 | 音声・バイオ・金融 |

---

## 技術スタック

| 分類 | 使用技術 |
| --- | --- |
| ランタイム | TypeScript 5 / React 18 |
| バンドラ | Vite 5 |
| ルーティング | `react-router-dom` v6 (HashRouter) |
| グラフ | Plotly.js (`plotly.js-basic-dist-min`) + `react-plotly.js` |
| 数式レンダリング | KaTeX |
| 確率分布関数 | jStat |
| ホスティング | GitHub Pages (GitHub Actions による自動デプロイ) |

MCMC・Kaplan–Meier 推定量・ビタビアルゴリズム・OLS (ガウス–ジョルダン逆行列) などの**中核アルゴリズムはすべて自前実装**しているため、外部 WASM や追加ランタイムなしでブラウザ内で完結します。

---

## ディレクトリ構成

```
.
├── .github/workflows/deploy.yml   # GitHub Pages への自動デプロイ
├── public/favicon.svg
├── src/
│   ├── App.tsx                    # ルーティング定義
│   ├── main.tsx                   # エントリーポイント
│   ├── components/                # 共通 UI コンポーネント
│   │   ├── Layout.tsx             # サイドバー + メインエリア
│   │   ├── Plot.tsx               # Plotly.js ラッパー (ダークテーマ適用)
│   │   ├── Slider.tsx             # ラベル + 現在値付きレンジスライダー
│   │   ├── MathBlock.tsx          # KaTeX 数式ブロック
│   │   ├── CodeBlock.tsx          # コード表示 + ワンクリックコピー
│   │   └── StatCard.tsx           # 計算結果表示カード
│   ├── lib/                       # 数値計算ユーティリティ (外部依存最小)
│   │   ├── random.ts              # mulberry32 / Box–Muller / gamma / beta
│   │   ├── stats.ts               # 分布関数・OLS・t 検定・ANOVA・HDI
│   │   ├── mcmc.ts                # Metropolis–Hastings サンプラ
│   │   ├── survival.ts            # Kaplan–Meier 推定量
│   │   └── hmm.ts                 # ビタビアルゴリズム + シミュレータ
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── classical/             # TTest / ANOVA / Regression
│   │   ├── bayesian/              # CoinFlip / MCMCRegression / Hierarchical
│   │   └── discovery/             # IRT / Survival / HMM
│   └── styles/index.css
├── index.html
├── package.json
├── tsconfig.json (+ app / node)
└── vite.config.ts
```

### 国際化とテーマ

- 言語は `src/i18n/common.ts` に共通辞書、各ページモジュール先頭に `text: { ja, en }` オブジェクトとしてローカル辞書を配置する形で実装しています。新しい言語を追加する場合は、型 `Lang` (`src/i18n/index.tsx`) と両辞書を拡張してください。
- テーマは `data-theme` 属性と CSS カスタムプロパティで切替。Plotly.js のグリッド色も `useTheme()` を介して同期します (`src/components/Plot.tsx`)。
- ユーザーの言語・テーマ選択は `localStorage` に `lang` / `theme` キーで保存されます。

### ページの共通レイアウト

各ページは以下の流れで構成されています。

1. **タイトルと概要**（対象領域のタグ付き）
2. **モデル** — 前提と数式 (KaTeX)
3. **パラメータ操作** — スライダー群と主要統計量のライブ表示
4. **グラフ** — Plotly.js による対話的プロット（複数の場合あり）
5. **サンプルコード** — Python + NumPy / SciPy / statsmodels / PyMC / lifelines 等による等価実装

---

## 開発

Node.js 20 以上を推奨します。

```bash
npm install
npm run dev        # 開発サーバ (http://localhost:5173)
npm run typecheck  # TypeScript の型検査のみ
npm run build      # 本番ビルド → dist/
npm run preview    # ビルド成果物をローカルで確認
```

### 利用可能なスクリプト

| スクリプト | 役割 |
| --- | --- |
| `dev` | Vite 開発サーバ (HMR 有効) |
| `typecheck` | `tsc -b --noEmit` による型検査 |
| `build` | TypeScript 型検査 + Vite 本番ビルド |
| `preview` | `dist/` の静的ファイルをローカルで配信 |
| `icons` | `public/apple-touch-icon.svg` から iOS 用 PNG (180×180) を再生成 (sharp 使用) |

---

## GitHub Pages へのデプロイ

本リポジトリには `.github/workflows/deploy.yml` が同梱されており、`main` ブランチへの push をトリガに以下を自動実行します。

1. `npm ci` による再現可能なインストール
2. TypeScript の型検査
3. Vite 本番ビルド（`VITE_BASE` にリポジトリ名を自動設定）
4. SPA 用の `404.html` フォールバック生成
5. `.nojekyll` 配置による Jekyll 無効化
6. GitHub Pages へのアーティファクトアップロードとデプロイ

### セットアップ手順

1. 本リポジトリを GitHub に push する。
2. **Settings → Pages** に移動し、Source を **GitHub Actions** に設定する。
3. `main` への push、もしくは Actions タブからの手動実行でデプロイが走り、`https://<user>.github.io/<repo>/` に公開される。

> ルーティングは `HashRouter` を採用しているため、リロード時の 404 問題を気にする必要はありません。将来的に `BrowserRouter` に切り替えたい場合も、同梱の `404.html` フォールバック生成で対応可能です。

### ベースパスのカスタマイズ

異なるパスで公開する場合は、以下のいずれかを変更してください。

- `vite.config.ts` の `base` 既定値
- `.github/workflows/deploy.yml` の `VITE_BASE` 環境変数

---

## 実装上の注記

- **MCMC はランダムウォーク Metropolis–Hastings**。NUTS / HMC 等の高度なサンプラは採用していません。学習目的でチェーンの振る舞い（受容率・混合・burn-in）を目視で把握することを重視しています。
- **階層ベイズ** ページは、正規–正規共役モデルにおける事後平均の閉形式（縮み係数）を用いた近似で、完全な事後分布サンプリングは行いません。サンプルコード側では PyMC の階層モデル定義を掲載しています。
- **生存時間分析** の log-rank 検定は χ²(1) の分位点を jStat で計算しています。Cox 比例ハザード回帰など、より一般的なモデルはサンプルコードで紹介のみ。
- 乱数は **mulberry32** による決定論的なシード乱数を使用しており、スライダーで「シード」を動かすことで再現性のある別サンプルを取得できます。
- 可視化はすべて Plotly.js のホバー・ズーム・PNG ダウンロード機能が有効です。

---

## ライセンス

MIT License

---

## コントリビューション

学習者の視点で「もう一歩踏み込んだ可視化」や「他分野の手法」を提案する Issue・Pull Request を歓迎します。新しいページを追加する際は、既存ページのレイアウト（解説 → 数式 → 操作 → グラフ → コード）に沿っていただけると一貫性が保てます。
