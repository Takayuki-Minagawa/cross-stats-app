export type SurvivalDatum = {
  time: number;
  event: 0 | 1; // 1: イベント発生, 0: 打ち切り
};

export type KMResult = {
  times: number[];
  survival: number[];
  atRisk: number[];
  events: number[];
};

// Kaplan–Meier 推定量
export function kaplanMeier(data: SurvivalDatum[]): KMResult {
  const sorted = [...data].sort((a, b) => a.time - b.time);
  const uniqueTimes: number[] = [];
  for (const d of sorted) {
    if (d.event === 1 && uniqueTimes[uniqueTimes.length - 1] !== d.time) {
      uniqueTimes.push(d.time);
    }
  }
  const times: number[] = [0];
  const surv: number[] = [1];
  const atRisk: number[] = [sorted.length];
  const events: number[] = [0];
  let s = 1;
  for (const t of uniqueTimes) {
    const n = sorted.filter((x) => x.time >= t).length;
    const d = sorted.filter((x) => x.time === t && x.event === 1).length;
    if (n === 0) continue;
    s = s * (1 - d / n);
    times.push(t);
    surv.push(s);
    atRisk.push(n);
    events.push(d);
  }
  return { times, survival: surv, atRisk, events };
}

// 累積ハザード関数 H(t) = -log S(t) から一定ハザード比を仮定した 2 群比較用の
// 期待生存関数を計算するためのユーティリティ
export function applyHazardRatio(km: KMResult, hr: number): number[] {
  // S_B(t) = S_A(t)^{hr}
  return km.survival.map((s) => Math.pow(s, hr));
}
