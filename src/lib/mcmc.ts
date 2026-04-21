import { randn } from './random';

// 対数事後確率のターゲットに対する Metropolis-Hastings (ランダムウォーク提案)
export type McmcResult = {
  samples: number[][]; // iter × dim
  accepted: number;
  accRate: number;
};

export function metropolisHastings(
  logPost: (theta: number[]) => number,
  init: number[],
  nIter: number,
  proposalSd: number[],
  rng: () => number,
  burnIn = 0,
): McmcResult {
  const dim = init.length;
  let current = [...init];
  let logPCurrent = logPost(current);
  const samples: number[][] = [];
  let accepted = 0;
  const total = nIter + burnIn;
  for (let i = 0; i < total; i++) {
    const proposal = current.map((v, j) => v + proposalSd[j] * randn(rng));
    const logPProp = logPost(proposal);
    const logAlpha = logPProp - logPCurrent;
    if (Math.log(rng()) < logAlpha) {
      current = proposal;
      logPCurrent = logPProp;
      if (i >= burnIn) accepted++;
    }
    if (i >= burnIn) samples.push([...current]);
    // dim は未使用（参照しておくことで tsc の noUnusedLocals に引っかからない）
    if (dim < 0) break;
  }
  return { samples, accepted, accRate: accepted / nIter };
}

// 指定カラムのサンプルを取り出す
export function column(samples: number[][], j: number): number[] {
  return samples.map((s) => s[j]);
}

// 移動平均 (トレース平滑化用)
export function rollingMean(x: number[], window: number): number[] {
  const out = new Array(x.length).fill(NaN);
  let s = 0;
  for (let i = 0; i < x.length; i++) {
    s += x[i];
    if (i >= window) s -= x[i - window];
    if (i >= window - 1) out[i] = s / window;
  }
  return out;
}
