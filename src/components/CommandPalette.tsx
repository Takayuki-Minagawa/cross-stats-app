import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '../i18n';
import { t } from '../i18n/common';
import { topics } from '../topics';

type Item = { path: string; icon: string; label: string; sub: string };

type Props = {
  open: boolean;
  onClose: () => void;
};

// Ctrl/⌘ + K で開くページ検索
export function CommandPalette({ open, onClose }: Props) {
  const { lang } = useLang();
  const m = t(lang);
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const items = useMemo<Item[]>(
    () => [
      { path: '/', icon: '🏠', label: m.nav.home, sub: '' },
      { path: '/guide', icon: '📖', label: m.nav.guide, sub: '' },
      { path: '/play/correlation', icon: '🎯', label: m.nav.play, sub: m.nav.playSection },
      ...topics.map((tp) => ({
        path: tp.path,
        icon: tp.icon,
        label: m.nav[tp.key],
        sub: m.categoryLong[tp.category],
      })),
    ],
    [m],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((it) => `${it.label} ${it.sub} ${it.path}`.toLowerCase().includes(q));
  }, [items, query]);

  useEffect(() => {
    if (open) {
      setQuery('');
      setActive(0);
      window.setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  useEffect(() => setActive(0), [query]);

  if (!open) return null;

  const go = (it: Item | undefined) => {
    if (!it) return;
    navigate(it.path);
    onClose();
  };

  return (
    <div className="palette-backdrop" onMouseDown={onClose}>
      <div
        className="palette"
        role="dialog"
        aria-modal="true"
        aria-label={m.palette.open}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="palette-input">
          <span aria-hidden="true">🔍</span>
          <input
            ref={inputRef}
            value={query}
            placeholder={m.palette.placeholder}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                setActive((a) => Math.min(a + 1, filtered.length - 1));
              } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setActive((a) => Math.max(a - 1, 0));
              } else if (e.key === 'Enter') {
                go(filtered[active]);
              } else if (e.key === 'Escape') {
                onClose();
              }
            }}
          />
          <kbd>Esc</kbd>
        </div>
        <ul className="palette-list">
          {filtered.length === 0 && <li className="palette-empty">{m.palette.empty}</li>}
          {filtered.map((it, i) => (
            <li key={it.path}>
              <button
                type="button"
                className={i === active ? 'active' : ''}
                onMouseEnter={() => setActive(i)}
                onClick={() => go(it)}
              >
                <span className="palette-icon" aria-hidden="true">
                  {it.icon}
                </span>
                <span className="palette-label">{it.label}</span>
                {it.sub && <span className="palette-sub">{it.sub}</span>}
              </button>
            </li>
          ))}
        </ul>
        <div className="palette-hint">{m.palette.hint}</div>
      </div>
    </div>
  );
}
