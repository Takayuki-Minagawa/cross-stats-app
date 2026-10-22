import { ReactNode } from 'react';
import { useLang } from '../i18n';
import { t } from '../i18n/common';
import { topics, TopicKey } from '../topics';
import { useProgress } from '../contexts/ProgressContext';

type Props = {
  topic: TopicKey;
  title: string;
  tagLabel?: string;
  lede: ReactNode;
};

export function PageHeader({ topic, title, tagLabel, lede }: Props) {
  const { lang } = useLang();
  const m = t(lang);
  const { missionCount } = useProgress();
  const info = topics.find((tp) => tp.key === topic)!;
  const done = missionCount(topic);
  return (
    <header className={`page-header cat-${info.category}`}>
      <div className="page-icon" aria-hidden="true">
        {info.icon}
      </div>
      <div className="page-header-body">
        <div className="page-meta">
          <span className={`tag ${info.category}`}>{tagLabel ?? m.tags[info.category]}</span>
          <span className="level" title={m.levels[info.level]}>
            {'●'.repeat(info.level)}
            <span className="level-off">{'●'.repeat(3 - info.level)}</span>
            <span className="level-label">{m.levels[info.level]}</span>
          </span>
          <span className="meta-missions">
            🎯 {done}/{info.missions}
          </span>
        </div>
        <h1>{title}</h1>
        <p className="lede">{lede}</p>
      </div>
    </header>
  );
}
