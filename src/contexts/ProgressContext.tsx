import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from 'react';

// 学習の進捗 (訪問済みページ・達成ミッション・ゲームのハイスコア) を localStorage に保存する
type Progress = {
  visited: string[];
  missions: Record<string, string[]>;
  best: Record<string, number>;
};

type Ctx = Progress & {
  visit: (page: string) => void;
  completeMission: (page: string, id: string) => void;
  isMissionDone: (page: string, id: string) => boolean;
  missionCount: (page?: string) => number;
  submitScore: (game: string, score: number) => boolean;
  reset: () => void;
};

// 同じオリジン (<user>.github.io) の他アプリと衝突しないよう、アプリ名を接頭辞にする
const STORAGE_KEY = 'cross-stats:progress';
const empty: Progress = { visited: [], missions: {}, best: {} };

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);
const isString = (v: unknown): v is string => typeof v === 'string';

function load(): Progress {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return empty;
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed)) return empty;
    // 想定外の形のデータが混ざっていても落ちないよう、要素単位で型を確かめて取り込む
    const missions: Record<string, string[]> = {};
    if (isRecord(parsed.missions)) {
      for (const [page, ids] of Object.entries(parsed.missions)) {
        if (Array.isArray(ids)) missions[page] = ids.filter(isString);
      }
    }
    const best: Record<string, number> = {};
    if (isRecord(parsed.best)) {
      for (const [game, score] of Object.entries(parsed.best)) {
        if (typeof score === 'number' && Number.isFinite(score)) best[game] = score;
      }
    }
    return {
      visited: Array.isArray(parsed.visited) ? parsed.visited.filter(isString) : [],
      missions,
      best,
    };
  } catch {
    // 破損データや localStorage がブロックされた環境では空の進捗から始める
    return empty;
  }
}

const ProgressContext = createContext<Ctx | null>(null);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Progress>(load);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* noop */
    }
  }, [state]);

  const visit = useCallback((page: string) => {
    setState((s) => (s.visited.includes(page) ? s : { ...s, visited: [...s.visited, page] }));
  }, []);

  const completeMission = useCallback((page: string, id: string) => {
    setState((s) => {
      const done = s.missions[page] ?? [];
      if (done.includes(id)) return s;
      return { ...s, missions: { ...s.missions, [page]: [...done, id] } };
    });
  }, []);

  const isMissionDone = useCallback(
    (page: string, id: string) => (state.missions[page] ?? []).includes(id),
    [state.missions],
  );

  const missionCount = useCallback(
    (page?: string) =>
      page
        ? (state.missions[page] ?? []).length
        : Object.values(state.missions).reduce((s, v) => s + v.length, 0),
    [state.missions],
  );

  // ハイスコア更新なら true を返す
  const submitScore = useCallback(
    (game: string, score: number) => {
      const prev = state.best[game] ?? 0;
      if (score <= prev) return false;
      setState((s) => ({ ...s, best: { ...s.best, [game]: Math.max(score, s.best[game] ?? 0) } }));
      return true;
    },
    [state.best],
  );

  const reset = useCallback(() => setState(empty), []);

  const value = useMemo<Ctx>(
    () => ({ ...state, visit, completeMission, isMissionDone, missionCount, submitScore, reset }),
    [state, visit, completeMission, isMissionDone, missionCount, submitScore, reset],
  );

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress(): Ctx {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error('useProgress must be used within ProgressProvider');
  return ctx;
}
