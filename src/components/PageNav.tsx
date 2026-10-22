import { Link, useLocation } from 'react-router-dom';
import { useLang } from '../i18n';
import { t } from '../i18n/common';
import { topics } from '../topics';

// トピックページ末尾の「前へ / 次へ」ナビゲーション
export function PageNav() {
  const { pathname } = useLocation();
  const { lang } = useLang();
  const m = t(lang);
  const idx = topics.findIndex((tp) => tp.path === pathname);
  if (idx < 0) return null;
  const prev = topics[idx - 1];
  const next = topics[idx + 1];
  return (
    <nav className="page-nav">
      {prev ? (
        <Link to={prev.path} className="page-nav-link prev">
          <span className="dir">← {m.pageNav.prev}</span>
          <span className="name">
            {prev.icon} {m.nav[prev.key]}
          </span>
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        <Link to={next.path} className="page-nav-link next">
          <span className="dir">{m.pageNav.next} →</span>
          <span className="name">
            {next.icon} {m.nav[next.key]}
          </span>
        </Link>
      ) : (
        <Link to="/play/correlation" className="page-nav-link next">
          <span className="dir">{m.pageNav.next} →</span>
          <span className="name">🎯 {m.nav.play}</span>
        </Link>
      )}
    </nav>
  );
}
