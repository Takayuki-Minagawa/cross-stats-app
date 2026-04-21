import { useMemo } from 'react';
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

export function Plot({ data, layout = {}, config = {}, height = 380 }: Props) {
  const { theme } = useTheme();

  const baseLayout = useMemo<PlotlyLayout>(() => {
    const isLight = theme === 'light';
    return {
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      font: {
        color: isLight ? '#1a2236' : '#e6edf7',
        family: 'Hiragino Sans, Noto Sans JP, system-ui, sans-serif',
      },
      margin: { l: 55, r: 20, t: 30, b: 45 },
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
      legend: { bgcolor: 'rgba(0,0,0,0)' },
    };
  }, [theme]);

  const mergedLayout: PlotlyLayout = {
    ...baseLayout,
    ...layout,
    xaxis: { ...baseLayout.xaxis, ...(layout.xaxis ?? {}) },
    yaxis: { ...baseLayout.yaxis, ...(layout.yaxis ?? {}) },
  };
  const mergedConfig: PlotlyConfig = { ...baseConfig, ...config };

  return (
    <div style={{ width: '100%', height }}>
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
