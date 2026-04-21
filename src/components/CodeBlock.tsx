import { useState } from 'react';

type Props = {
  code: string;
  language?: string;
  title?: string;
};

export function CodeBlock({ code, language = 'python', title }: Props) {
  const [copied, setCopied] = useState(false);
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* noop */
    }
  };
  return (
    <>
      <div className="code-header">
        <span>{title ? `${title} (${language})` : language}</span>
        <button onClick={onCopy} type="button">
          {copied ? 'コピー済' : 'コピー'}
        </button>
      </div>
      <pre className="code">
        <code>{code}</code>
      </pre>
    </>
  );
}
