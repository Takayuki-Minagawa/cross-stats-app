import { useEffect, useRef } from 'react';
import katex from 'katex';

type Props = {
  tex: string;
  display?: boolean;
};

export function MathBlock({ tex, display = true }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) {
      katex.render(tex, ref.current, {
        throwOnError: false,
        displayMode: display,
      });
    }
  }, [tex, display]);
  return <div className={display ? 'math-block' : ''} ref={ref} />;
}

export function InlineMath({ tex }: { tex: string }) {
  return <MathBlock tex={tex} display={false} />;
}
