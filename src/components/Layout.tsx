import { NavLink, Outlet } from 'react-router-dom';
import { useLang } from '../i18n';
import { t } from '../i18n/common';
import { ThemeToggle } from './ThemeToggle';
import { LangToggle } from './LangToggle';

export function Layout() {
  const { lang } = useLang();
  const m = t(lang);
  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="brand">{m.brand}</div>
        <div className="brand-sub">{m.brandSub}</div>

        <div className="toggles">
          <ThemeToggle />
          <LangToggle />
        </div>

        <NavLink to="/" end>
          {m.nav.home}
        </NavLink>
        <NavLink to="/guide">{m.nav.guide}</NavLink>

        <div className="section-title">{m.nav.classical}</div>
        <NavLink to="/classical/t-test">{m.nav.tTest}</NavLink>
        <NavLink to="/classical/anova">{m.nav.anova}</NavLink>
        <NavLink to="/classical/regression">{m.nav.regression}</NavLink>

        <div className="section-title">{m.nav.bayesian}</div>
        <NavLink to="/bayesian/coin-flip">{m.nav.coinFlip}</NavLink>
        <NavLink to="/bayesian/mcmc">{m.nav.mcmc}</NavLink>
        <NavLink to="/bayesian/hierarchical">{m.nav.hierarchical}</NavLink>

        <div className="section-title">{m.nav.discovery}</div>
        <NavLink to="/discovery/irt">{m.nav.irt}</NavLink>
        <NavLink to="/discovery/survival">{m.nav.survival}</NavLink>
        <NavLink to="/discovery/hmm">{m.nav.hmm}</NavLink>
      </aside>
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
