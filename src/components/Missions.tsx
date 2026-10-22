import { useEffect, useRef } from 'react';
import { useLang } from '../i18n';
import { t } from '../i18n/common';
import { useProgress } from '../contexts/ProgressContext';
import { useToast } from '../contexts/ToastContext';
import { confetti } from '../lib/confetti';
import type { TopicKey } from '../topics';

export type Mission = {
  id: string;
  text: string;
  // 現在のパラメータで条件を満たしているか
  done: boolean;
};

type Props = {
  page: TopicKey;
  missions: Mission[];
};

// スライダー操作で条件を満たすと自動で達成になるチャレンジ一覧
export function Missions({ page, missions }: Props) {
  const { lang } = useLang();
  const m = t(lang);
  const { isMissionDone, completeMission } = useProgress();
  const { show } = useToast();
  // StrictMode の二重実行やドラッグ中の連続発火でトーストが重複しないようにする
  const announced = useRef(new Set<string>());

  useEffect(() => {
    const newly = missions.filter(
      (ms) => ms.done && !isMissionDone(page, ms.id) && !announced.current.has(ms.id),
    );
    if (newly.length === 0) return;
    for (const ms of newly) {
      announced.current.add(ms.id);
      completeMission(page, ms.id);
      show({ icon: '🏅', title: m.missions.cleared, body: ms.text });
    }
    const allDone = missions.every((ms) => isMissionDone(page, ms.id) || announced.current.has(ms.id));
    if (allDone) {
      confetti({ count: 180 });
      show({ icon: '🏆', title: m.missions.allCleared, body: m.missions.allClearedBody });
    } else {
      confetti({ count: 60, originY: 0.25 });
    }
  }, [missions, page, isMissionDone, completeMission, show, m]);

  const doneCount = missions.filter((ms) => isMissionDone(page, ms.id)).length;
  const pct = (doneCount / missions.length) * 100;

  return (
    <div className="missions">
      <div className="missions-head">
        <span className="missions-title">
          <span aria-hidden="true">🎯</span> {m.missions.title}
        </span>
        <span className="missions-count">
          {doneCount} / {missions.length}
        </span>
      </div>
      <div className="progress-bar" aria-hidden="true">
        <span style={{ width: `${pct}%` }} />
      </div>
      <p className="missions-hint">{m.missions.hint}</p>
      <ul className="missions-list">
        {missions.map((ms) => {
          const cleared = isMissionDone(page, ms.id);
          return (
            <li key={ms.id} className={`${cleared ? 'cleared' : ''} ${ms.done ? 'live' : ''}`.trim()}>
              <span className="check" aria-hidden="true">
                {cleared ? '✓' : ''}
              </span>
              <span>{ms.text}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
