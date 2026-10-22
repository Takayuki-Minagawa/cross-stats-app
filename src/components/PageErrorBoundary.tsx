import { Component, ErrorInfo, ReactNode } from 'react';

type Props = {
  title: string;
  body: string;
  reload: string;
  children: ReactNode;
};

type State = { error: Error | null };

// ページ単位のエラー境界。遅延読み込みしたチャンクの取得失敗 (再デプロイ後の古いタブやオフライン) などで
// アプリ全体が真っ白にならないよう、メイン領域だけをエラー表示に切り替える
export class PageErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="page-error" role="alert">
        <div className="page-error-icon" aria-hidden="true">
          ⚠️
        </div>
        <h2>{this.props.title}</h2>
        <p>{this.props.body}</p>
        <button type="button" className="btn primary" onClick={() => window.location.reload()}>
          {this.props.reload}
        </button>
      </div>
    );
  }
}
