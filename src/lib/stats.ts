// jstat は分布関数と統計手法のラッパーとして使用 (型定義なし → vite-env.d.ts で declare)
import jStatMod from 'jstat';

// バージョン / バンドラにより `jStat` サブプロパティとして公開される場合と、
// デフォルトエクスポート自体がネームスペースな場合があるので両対応する
export const jstat = (jStatMod && jStatMod.jStat) || jStatMod;

export function mean(x: number[]): number {
  if (x.length === 0) return 0;
  let s = 0;
  for (const v of x) s += v;
  return s / x.length;
}

export function variance(x: number[], ddof = 1): number {
  const m = mean(x);
  let s = 0;
  for (const v of x) s += (v - m) * (v - m);
  return s / Math.max(1, x.length - ddof);
}

export function std(x: number[], ddof = 1): number {
  return Math.sqrt(variance(x, ddof));
}

export function sum(x: number[]): number {
  let s = 0;
  for (const v of x) s += v;
  return s;
}

export function linspace(a: number, b: number, n: number): number[] {
  if (n <= 1) return [a];
  const step = (b - a) / (n - 1);
  return Array.from({ length: n }, (_, i) => a + step * i);
}

// --- 分布 ---
export const dnorm = (x: number, mu = 0, sigma = 1) => jstat.normal.pdf(x, mu, sigma);
export const pnorm = (x: number, mu = 0, sigma = 1) => jstat.normal.cdf(x, mu, sigma);
export const qnorm = (p: number, mu = 0, sigma = 1) => jstat.normal.inv(p, mu, sigma);

export const dt = (x: number, df: number) => jstat.studentt.pdf(x, df);
export const pt = (x: number, df: number) => jstat.studentt.cdf(x, df);
export const qt = (p: number, df: number) => jstat.studentt.inv(p, df);

export const dbeta = (x: number, a: number, b: number) => jstat.beta.pdf(x, a, b);
export const pbeta = (x: number, a: number, b: number) => jstat.beta.cdf(x, a, b);
export const qbeta = (p: number, a: number, b: number) => jstat.beta.inv(p, a, b);

export const df = (x: number, d1: number, d2: number) => jstat.centralF.pdf(x, d1, d2);
export const pf = (x: number, d1: number, d2: number) => jstat.centralF.cdf(x, d1, d2);

// --- 2 標本 t 検定 (Welch) ---
export type TTestResult = {
  t: number;
  df: number;
  pValue: number;
  ci: [number, number];
  meanDiff: number;
  se: number;
};

export function welchTTest(a: number[], b: number[], alpha = 0.05): TTestResult {
  const ma = mean(a);
  const mb = mean(b);
  const va = variance(a);
  const vb = variance(b);
  const na = a.length;
  const nb = b.length;
  const se = Math.sqrt(va / na + vb / nb);
  const diff = ma - mb;
  const t = diff / se;
  const num = Math.pow(va / na + vb / nb, 2);
  const den = Math.pow(va / na, 2) / (na - 1) + Math.pow(vb / nb, 2) / (nb - 1);
  const df = num / den;
  const p = 2 * (1 - pt(Math.abs(t), df));
  const crit = qt(1 - alpha / 2, df);
  const ci: [number, number] = [diff - crit * se, diff + crit * se];
  return { t, df, pValue: p, ci, meanDiff: diff, se };
}

// --- 一元配置 ANOVA ---
export type AnovaResult = {
  f: number;
  pValue: number;
  df1: number;
  df2: number;
  ssBetween: number;
  ssWithin: number;
  grandMean: number;
  groupMeans: number[];
};

export function oneWayAnova(groups: number[][]): AnovaResult {
  const k = groups.length;
  const nTotal = groups.reduce((s, g) => s + g.length, 0);
  const grand = mean(groups.flat());
  const groupMeans = groups.map(mean);
  const ssBetween = groups.reduce((s, g, i) => s + g.length * (groupMeans[i] - grand) ** 2, 0);
  const ssWithin = groups.reduce(
    (s, g, i) => s + g.reduce((ss, v) => ss + (v - groupMeans[i]) ** 2, 0),
    0,
  );
  const df1 = k - 1;
  const df2 = nTotal - k;
  const msBetween = ssBetween / df1;
  const msWithin = ssWithin / df2;
  const f = msBetween / msWithin;
  const p = 1 - pf(f, df1, df2);
  return { f, pValue: p, df1, df2, ssBetween, ssWithin, grandMean: grand, groupMeans };
}

// --- 行列ユーティリティ ---
export type Matrix = number[][];

export function matMul(a: Matrix, b: Matrix): Matrix {
  const m = a.length;
  const n = b[0].length;
  const p = b.length;
  const out: Matrix = Array.from({ length: m }, () => new Array(n).fill(0));
  for (let i = 0; i < m; i++) {
    for (let k = 0; k < p; k++) {
      const aik = a[i][k];
      for (let j = 0; j < n; j++) out[i][j] += aik * b[k][j];
    }
  }
  return out;
}

export function transpose(a: Matrix): Matrix {
  const m = a.length;
  const n = a[0].length;
  const out: Matrix = Array.from({ length: n }, () => new Array(m).fill(0));
  for (let i = 0; i < m; i++) for (let j = 0; j < n; j++) out[j][i] = a[i][j];
  return out;
}

// ガウス・ジョルダン法による逆行列
export function inverse(a: Matrix): Matrix {
  const n = a.length;
  const m: Matrix = a.map((row, i) => [
    ...row,
    ...Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)),
  ]);
  for (let i = 0; i < n; i++) {
    let pivot = i;
    for (let r = i + 1; r < n; r++) {
      if (Math.abs(m[r][i]) > Math.abs(m[pivot][i])) pivot = r;
    }
    if (pivot !== i) [m[i], m[pivot]] = [m[pivot], m[i]];
    const div = m[i][i];
    if (Math.abs(div) < 1e-12) throw new Error('特異行列です');
    for (let j = 0; j < 2 * n; j++) m[i][j] /= div;
    for (let r = 0; r < n; r++) {
      if (r === i) continue;
      const factor = m[r][i];
      for (let j = 0; j < 2 * n; j++) m[r][j] -= factor * m[i][j];
    }
  }
  return m.map((row) => row.slice(n));
}

// 重回帰: β = (X'X)^{-1} X'y
export type OlsResult = {
  coef: number[];
  se: number[];
  tStats: number[];
  pValues: number[];
  r2: number;
  sigma: number;
  residuals: number[];
  fitted: number[];
  ci: Array<[number, number]>;
};

export function ols(X: Matrix, y: number[], alpha = 0.05): OlsResult {
  const n = X.length;
  const p = X[0].length;
  const Xt = transpose(X);
  const XtX = matMul(Xt, X);
  const XtXInv = inverse(XtX);
  const Xty = matMul(
    Xt,
    y.map((v) => [v]),
  );
  const beta = matMul(XtXInv, Xty).map((r) => r[0]);
  const fitted = X.map((row) => row.reduce((s, v, j) => s + v * beta[j], 0));
  const residuals = y.map((v, i) => v - fitted[i]);
  const rss = residuals.reduce((s, v) => s + v * v, 0);
  const yMean = mean(y);
  const tss = y.reduce((s, v) => s + (v - yMean) ** 2, 0);
  const r2 = 1 - rss / tss;
  const sigma2 = rss / (n - p);
  const sigma = Math.sqrt(sigma2);
  const se = XtXInv.map((row, i) => Math.sqrt(row[i] * sigma2));
  const tStats = beta.map((b, i) => b / se[i]);
  const pValues = tStats.map((t) => 2 * (1 - pt(Math.abs(t), n - p)));
  const crit = qt(1 - alpha / 2, n - p);
  const ci = beta.map((b, i) => [b - crit * se[i], b + crit * se[i]] as [number, number]);
  return { coef: beta, se, tStats, pValues, r2, sigma, residuals, fitted, ci };
}

// 量子点 (経験分位点)
export function quantile(x: number[], q: number): number {
  const sorted = [...x].sort((a, b) => a - b);
  const pos = (sorted.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  if (sorted[base + 1] !== undefined) {
    return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
  }
  return sorted[base];
}

// Highest Density Interval (HDI) — 幅最小の区間を経験的に求める
export function hdi(samples: number[], prob = 0.95): [number, number] {
  const sorted = [...samples].sort((a, b) => a - b);
  const n = sorted.length;
  const ciWidth = Math.floor(prob * n);
  let bestStart = 0;
  let bestWidth = Infinity;
  for (let i = 0; i + ciWidth < n; i++) {
    const w = sorted[i + ciWidth] - sorted[i];
    if (w < bestWidth) {
      bestWidth = w;
      bestStart = i;
    }
  }
  return [sorted[bestStart], sorted[bestStart + ciWidth]];
}
