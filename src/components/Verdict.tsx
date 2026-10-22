import { ReactNode } from 'react';

type Props = {
  tone: 'good' | 'warn' | 'bad' | 'info';
  icon: string;
  children: ReactNode;
};

// 統計量の意味を平易な言葉で伝える一行サマリー
export function Verdict({ tone, icon, children }: Props) {
  return (
    <div className={`verdict ${tone}`} role="status">
      <span className="verdict-icon" aria-hidden="true">
        {icon}
      </span>
      <span>{children}</span>
    </div>
  );
}
