import { lazy } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';

// グラフ描画ライブラリ (Plotly) を含む各ページは遅延読み込みし、初回表示を軽くする
const Guide = lazy(() => import('./pages/Guide').then((m) => ({ default: m.Guide })));
const TTest = lazy(() => import('./pages/classical/TTest').then((m) => ({ default: m.TTest })));
const ANOVA = lazy(() => import('./pages/classical/ANOVA').then((m) => ({ default: m.ANOVA })));
const Regression = lazy(() =>
  import('./pages/classical/Regression').then((m) => ({ default: m.Regression })),
);
const CoinFlip = lazy(() => import('./pages/bayesian/CoinFlip').then((m) => ({ default: m.CoinFlip })));
const MCMCRegression = lazy(() =>
  import('./pages/bayesian/MCMCRegression').then((m) => ({ default: m.MCMCRegression })),
);
const Hierarchical = lazy(() =>
  import('./pages/bayesian/Hierarchical').then((m) => ({ default: m.Hierarchical })),
);
const IRT = lazy(() => import('./pages/discovery/IRT').then((m) => ({ default: m.IRT })));
const Survival = lazy(() => import('./pages/discovery/Survival').then((m) => ({ default: m.Survival })));
const HMM = lazy(() => import('./pages/discovery/HMM').then((m) => ({ default: m.HMM })));
const CorrelationGame = lazy(() =>
  import('./pages/play/CorrelationGame').then((m) => ({ default: m.CorrelationGame })),
);

export function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/guide" element={<Guide />} />
          <Route path="/play/correlation" element={<CorrelationGame />} />
          <Route path="/classical/t-test" element={<TTest />} />
          <Route path="/classical/anova" element={<ANOVA />} />
          <Route path="/classical/regression" element={<Regression />} />
          <Route path="/bayesian/coin-flip" element={<CoinFlip />} />
          <Route path="/bayesian/mcmc" element={<MCMCRegression />} />
          <Route path="/bayesian/hierarchical" element={<Hierarchical />} />
          <Route path="/discovery/irt" element={<IRT />} />
          <Route path="/discovery/survival" element={<Survival />} />
          <Route path="/discovery/hmm" element={<HMM />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
