import createPlotlyComponent from 'react-plotly.js/factory';
import Plotly from 'plotly.js-basic-dist-min';

const PlotlyReact = createPlotlyComponent(Plotly as unknown as object);

// Plotly の型は細部が古く、title: string や nbinsx 等でエラーになる。
// 学習用アプリでは利便性を優先して any で受ける。
type PlotlyData = Record<string, any>;
type PlotlyLayout = Record<string, any>;
type PlotlyConfig = Record<string, any>;

type Props = {
  data: PlotlyData[];
  layout?: PlotlyLayout;
  config?: PlotlyConfig;
  height?: number | string;
};

const baseLayout: PlotlyLayout = {
  paper_bgcolor: 'rgba(0,0,0,0)',
  plot_bgcolor: 'rgba(0,0,0,0)',
  font: { color: '#e6edf7', family: 'Hiragino Sans, Noto Sans JP, system-ui, sans-serif' },
  margin: { l: 55, r: 20, t: 30, b: 45 },
  xaxis: { gridcolor: '#1f2d4a', zerolinecolor: '#243554' },
  yaxis: { gridcolor: '#1f2d4a', zerolinecolor: '#243554' },
  legend: { bgcolor: 'rgba(0,0,0,0)' },
};

const baseConfig: PlotlyConfig = {
  displaylogo: false,
  responsive: true,
  modeBarButtonsToRemove: ['lasso2d', 'select2d', 'autoScale2d'],
};

export function Plot({ data, layout = {}, config = {}, height = 380 }: Props) {
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
