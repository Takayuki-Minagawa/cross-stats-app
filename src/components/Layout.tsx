import { Suspense, useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useLang } from '../i18n';
import { rankIndex, t } from '../i18n/common';
import { ThemeToggle } from './ThemeToggle';
import { LangToggle } from './LangToggle';
import { CommandPalette } from './CommandPalette';
import { categories, topics, topicByPath, totalMissions } from '../topics';
import { useProgress } from '../contexts/ProgressContext';

// Chrome 系ブラウザの「アプリとしてインストール」イベント (型定義が標準に無いため最小限を宣言)
type InstallPromptEvent = Event & { prompt: () => Promise<void> };

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);

export function Layout() {
  const { lang } = useLang();
  const m = t(lang);
  const location = useLocation();
  const { visit, visited, missionCount } = useProgress();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [installEvent, setInstallEvent] = useState<InstallPromptEvent | null>(null);

  // ページ遷移時: 先頭へスクロールしてドロワーを閉じる
  useEffect(() => {
    window.scrollTo({ top: 0 });
    setDrawerOpen(false);
  }, [location.pathname]);

  // タブのタイトル更新 (言語切替にも追従) と訪問記録
  useEffect(() => {
    const topic = topicByPath(location.pathname);
    let name: string = m.brandSub;
    if (topic) name = m.nav[topic.key];
    else if (location.pathname === '/guide') name = m.nav.guide;
    else if (location.pathname === '/play/correlation') name = m.nav.play;
    document.title = `${name} | ${m.brand}`;
    if (topic) visit(topic.key);
  }, [location.pathname, m, visit]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      } else if (e.key === 'Escape') {
        setDrawerOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e as InstallPromptEvent);
    };
    const onInstalled = () => setInstallEvent(null);
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const done = missionCount();
  const rank = m.ranks[rankIndex(done, totalMissions)];
  const navTitle: Record<(typeof categories)[number], string> = {
    classical: m.nav.classical,
    bayes: m.nav.bayesian,
    discovery: m.nav.discovery,
  };

  return (
    <div className={`layout ${drawerOpen ? 'drawer-open' : ''}`}>
      <header className="topbar">
        <button
          type="button"
          className="icon-btn"
          aria-label={m.menu}
          aria-expanded={drawerOpen}
          onClick={() => setDrawerOpen((o) => !o)}
        >
          ☰
        </button>
        <NavLink to="/" className="topbar-brand">
          <img src={`${import.meta.env.BASE_URL}favicon.svg`} alt="" width={24} height={24} />
          {m.brand}
        </NavLink>
        <button
          type="button"
          className="icon-btn"
          aria-label={m.palette.open}
          onClick={() => setPaletteOpen(true)}
        >
          🔍
        </button>
      </header>

      <div className="drawer-backdrop" onClick={() => setDrawerOpen(false)} />

      <aside className="sidebar">
        <NavLink to="/" className="brand-row">
          <img src={`${import.meta.env.BASE_URL}favicon.svg`} alt="" width={34} height={34} />
          <span>
            <span className="brand">{m.brand}</span>
            <span className="brand-sub">{m.brandSub}</span>
          </span>
        </NavLink>

        <button type="button" className="search-btn" onClick={() => setPaletteOpen(true)}>
          <span aria-hidden="true">🔍</span>
          <span className="search-label">{m.palette.open}</span>
          <kbd>{isMac ? '⌘' : 'Ctrl'} K</kbd>
        </button>

        <div className="rank-card">
          <div className="rank-row">
            <span className="rank-name">🏅 {rank}</span>
            <span className="rank-count">
              {done}/{totalMissions}
            </span>
          </div>
          <div className="progress-bar" aria-hidden="true">
            <span style={{ width: `${(done / totalMissions) * 100}%` }} />
          </div>
        </div>

        <nav className="nav">
          <NavLink to="/" end>
            <span className="nav-icon">🏠</span>
            {m.nav.home}
          </NavLink>
          <NavLink to="/guide">
            <span className="nav-icon">📖</span>
            {m.nav.guide}
          </NavLink>

          {categories.map((cat) => (
            <div key={cat} className={`nav-group cat-${cat}`}>
              <div className="section-title">{navTitle[cat]}</div>
              {topics
                .filter((tp) => tp.category === cat)
                .map((tp) => {
                  const cleared = missionCount(tp.key) >= tp.missions;
                  return (
                    <NavLink key={tp.key} to={tp.path}>
                      <span className="nav-icon">{tp.icon}</span>
                      <span className="nav-label">{m.nav[tp.key]}</span>
                      {cleared ? (
                        <span className="nav-badge done" title="✓">
                          ✓
                        </span>
                      ) : visited.includes(tp.key) ? (
                        <span className="nav-badge visited" />
                      ) : null}
                    </NavLink>
                  );
                })}
            </div>
          ))}

          <div className="section-title">{m.nav.playSection}</div>
          <NavLink to="/play/correlation">
            <span className="nav-icon">🎯</span>
            {m.nav.play}
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          {installEvent && (
            <button
              type="button"
              className="install-btn"
              onClick={async () => {
                await installEvent.prompt();
                setInstallEvent(null);
              }}
            >
              📲 {m.install}
            </button>
          )}
          <div className="toggles">
            <ThemeToggle />
            <LangToggle />
          </div>
        </div>
      </aside>

      <main className="main">
        <Suspense fallback={<PageSkeleton label={m.loading} />}>
          <div className="page-enter" key={location.pathname}>
            <Outlet />
          </div>
        </Suspense>
      </main>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </div>
  );
}

function PageSkeleton({ label }: { label: string }) {
  return (
    <div className="skeleton" aria-busy="true" aria-label={label}>
      <div className="sk sk-title" />
      <div className="sk sk-line" />
      <div className="sk sk-line short" />
      <div className="sk sk-block" />
    </div>
  );
}
