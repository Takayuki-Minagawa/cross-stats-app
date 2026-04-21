import { NavLink, Outlet } from 'react-router-dom';

export function Layout() {
  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="brand">Cross Stats</div>
        <div className="brand-sub">インタラクティブ統計学習</div>

        <NavLink to="/" end>
          ホーム
        </NavLink>

        <div className="section-title">古典統計</div>
        <NavLink to="/classical/t-test">t 検定</NavLink>
        <NavLink to="/classical/anova">分散分析 (ANOVA)</NavLink>
        <NavLink to="/classical/regression">重回帰分析</NavLink>

        <div className="section-title">ベイズ統計</div>
        <NavLink to="/bayesian/coin-flip">コインのベイズ更新</NavLink>
        <NavLink to="/bayesian/mcmc">MCMC ベイズ回帰</NavLink>
        <NavLink to="/bayesian/hierarchical">階層ベイズ</NavLink>

        <div className="section-title">ディスカバリー</div>
        <NavLink to="/discovery/irt">項目応答理論 (IRT)</NavLink>
        <NavLink to="/discovery/survival">生存時間分析</NavLink>
        <NavLink to="/discovery/hmm">隠れマルコフモデル</NavLink>
      </aside>
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
