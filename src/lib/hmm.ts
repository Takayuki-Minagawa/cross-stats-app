// 離散観測 HMM のビタビ復号
// states: 状態数 K、obs: 観測列 (カテゴリインデックス)
// pi: 初期確率 [K]、A: 遷移確率 [K][K]、B: 出力確率 [K][M]

export type HmmParams = {
  pi: number[];
  A: number[][];
  B: number[][]; // [状態][観測カテゴリ]
};

export function viterbi(obs: number[], params: HmmParams): number[] {
  const { pi, A, B } = params;
  const K = pi.length;
  const T = obs.length;
  const delta: number[][] = Array.from({ length: T }, () => new Array(K).fill(-Infinity));
  const psi: number[][] = Array.from({ length: T }, () => new Array(K).fill(0));
  for (let k = 0; k < K; k++) {
    delta[0][k] = Math.log(pi[k] + 1e-300) + Math.log(B[k][obs[0]] + 1e-300);
  }
  for (let t = 1; t < T; t++) {
    for (let k = 0; k < K; k++) {
      let best = -Infinity;
      let arg = 0;
      for (let j = 0; j < K; j++) {
        const v = delta[t - 1][j] + Math.log(A[j][k] + 1e-300);
        if (v > best) {
          best = v;
          arg = j;
        }
      }
      delta[t][k] = best + Math.log(B[k][obs[t]] + 1e-300);
      psi[t][k] = arg;
    }
  }
  const path = new Array(T).fill(0);
  let last = 0;
  let bestFinal = -Infinity;
  for (let k = 0; k < K; k++) {
    if (delta[T - 1][k] > bestFinal) {
      bestFinal = delta[T - 1][k];
      last = k;
    }
  }
  path[T - 1] = last;
  for (let t = T - 2; t >= 0; t--) path[t] = psi[t + 1][path[t + 1]];
  return path;
}

// 生成: params に従って状態列と観測列をシミュレート
export function simulateHmm(
  params: HmmParams,
  T: number,
  rng: () => number,
): { states: number[]; obs: number[] } {
  const sampleDiscrete = (probs: number[]) => {
    const r = rng();
    let c = 0;
    for (let i = 0; i < probs.length; i++) {
      c += probs[i];
      if (r <= c) return i;
    }
    return probs.length - 1;
  };
  const states: number[] = [];
  const obs: number[] = [];
  let s = sampleDiscrete(params.pi);
  for (let t = 0; t < T; t++) {
    states.push(s);
    obs.push(sampleDiscrete(params.B[s]));
    s = sampleDiscrete(params.A[s]);
  }
  return { states, obs };
}
