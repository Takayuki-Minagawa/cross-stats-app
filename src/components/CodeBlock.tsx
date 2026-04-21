import { useState } from 'react';
import { useLang } from '../i18n';
import { t } from '../i18n/common';

type Props = {
  code: string;
  language?: string;
  title?: string;
};

export function CodeBlock({ code, language = 'python', title }: Props) {
  const [copied, setCopied] = useState(false);
  const { lang } = useLang();
  const m = t(lang);
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
          {copied ? m.copied : m.copy}
        </button>
      </div>
      <pre className="code">
        <code>{code}</code>
      </pre>
    </>
  );
}
