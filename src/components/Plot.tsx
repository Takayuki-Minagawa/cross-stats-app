import { useEffect, useMemo, useState } from 'react';
import createPlotlyComponent from 'react-plotly.js/factory';
import Plotly from 'plotly.js-basic-dist-min';
import { useTheme } from '../contexts/ThemeContext';

const PlotlyReact = createPlotlyComponent(Plotly as unknown as object);

// Plotly の型は細部が古く、title: string や nbinsx 等でエラーになるため緩く受ける
type PlotlyData = Record<string, any>;
type PlotlyLayout = Record<string, any>;
type PlotlyConfig = Record<string, any>;

type Props = {
  data: PlotlyData[];
  layout?: PlotlyLayout;
  config?: PlotlyConfig;
  height?: number | string;
};

const baseConfig: PlotlyConfig = {
  displaylogo: false,
  responsive: true,
  modeBarButtonsToRemove: ['lasso2d', 'select2d', 'autoScale2d'],
};

// 画面幅が狭いときは凡例をグラフの下に回し、描画領域を確保する
function useNarrow(): boolean {
  const query = '(max-width: 600px)';
  const [narrow, setNarrow] = useState(() => window.matchMedia?.(query).matches ?? false);
  useEffect(() => {
    const mql = window.matchMedia?.(query);
    if (!mql) return;
    const onChange = () => setNarrow(mql.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);
  return narrow;
}

export function Plot({ data, layout = {}, config = {}, height = 380 }: Props) {
  const { theme } = useTheme();
  const narrow = useNarrow();

  const baseLayout = useMemo<PlotlyLayout>(() => {
    const isLight = theme === 'light';
    return {
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      font: {
        color: isLight ? '#1a2236' : '#e6edf7',
        family: 'Hiragino Sans, Noto Sans JP, system-ui, sans-serif',
      },
      margin: narrow ? { l: 45, r: 10, t: 20, b: 40 } : { l: 55, r: 20, t: 30, b: 45 },
      xaxis: {
        gridcolor: isLight ? '#e2e8f0' : '#1f2d4a',
        zerolinecolor: isLight ? '#cbd5e1' : '#243554',
        linecolor: isLight ? '#94a3b8' : '#334155',
        tickcolor: isLight ? '#94a3b8' : '#475569',
      },
      yaxis: {
        gridcolor: isLight ? '#e2e8f0' : '#1f2d4a',
        zerolinecolor: isLight ? '#cbd5e1' : '#243554',
        linecolor: isLight ? '#94a3b8' : '#334155',
        tickcolor: isLight ? '#94a3b8' : '#475569',
      },
      legend: narrow
        ? { bgcolor: 'rgba(0,0,0,0)', orientation: 'h', x: 0, y: -0.28, yanchor: 'top' }
        : { bgcolor: 'rgba(0,0,0,0)' },
      hoverlabel: { font: { family: 'Hiragino Sans, Noto Sans JP, system-ui, sans-serif' } },
    };
  }, [theme, narrow]);

  const mergedLayout: PlotlyLayout = {
    ...baseLayout,
    ...layout,
    xaxis: { ...baseLayout.xaxis, ...(layout.xaxis ?? {}) },
    yaxis: { ...baseLayout.yaxis, ...(layout.yaxis ?? {}) },
  };
  const mergedConfig: PlotlyConfig = { ...baseConfig, ...config };

  const plotHeight = narrow && typeof height === 'number' ? height + 80 : height;
  return (
    <div className="plot-wrap" style={{ width: '100%', height: plotHeight }}>
      <PlotlyReact
        data={data}
        layout={mergedLayout}
        config={mergedConfig}
        useResizeHandler
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}
