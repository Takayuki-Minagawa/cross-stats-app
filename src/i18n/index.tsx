import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';

export type Lang = 'ja' | 'en';

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  toggle: () => void;
};

const I18nContext = createContext<Ctx | null>(null);

function getInitial(): Lang {
  if (typeof window === 'undefined') return 'ja';
  const stored = window.localStorage.getItem('lang');
  if (stored === 'ja' || stored === 'en') return stored;
  return 'ja';
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(getInitial);

  useEffect(() => {
    document.documentElement.lang = lang;
    try {
      window.localStorage.setItem('lang', lang);
    } catch {
      /* noop */
    }
  }, [lang]);

  const value = useMemo<Ctx>(
    () => ({
      lang,
      setLang,
      toggle: () => setLang((l) => (l === 'ja' ? 'en' : 'ja')),
    }),
    [lang],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useLang(): Ctx {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useLang must be used within I18nProvider');
  return ctx;
}

// 言語依存の辞書から現在の言語の値を取り出すヘルパ
export function pickLang<T>(dict: Record<Lang, T>, lang: Lang): T {
  return dict[lang];
}
