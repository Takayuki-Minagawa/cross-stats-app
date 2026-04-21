import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Guide } from './pages/Guide';
import { TTest } from './pages/classical/TTest';
import { ANOVA } from './pages/classical/ANOVA';
import { Regression } from './pages/classical/Regression';
import { CoinFlip } from './pages/bayesian/CoinFlip';
import { MCMCRegression } from './pages/bayesian/MCMCRegression';
import { Hierarchical } from './pages/bayesian/Hierarchical';
import { IRT } from './pages/discovery/IRT';
import { Survival } from './pages/discovery/Survival';
import { HMM } from './pages/discovery/HMM';

export function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/guide" element={<Guide />} />
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
