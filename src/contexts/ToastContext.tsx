import { createContext, useCallback, useContext, useMemo, useRef, useState, ReactNode } from 'react';

type Toast = {
  id: number;
  icon: string;
  title: string;
  body?: string;
};

type Ctx = {
  show: (t: Omit<Toast, 'id'>) => void;
};

const ToastContext = createContext<Ctx | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => {
    setToasts((ts) => ts.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (t: Omit<Toast, 'id'>) => {
      const id = nextId.current++;
      setToasts((ts) => [...ts.slice(-2), { ...t, id }]);
      window.setTimeout(() => dismiss(id), 3800);
    },
    [dismiss],
  );

  const value = useMemo(() => ({ show }), [show]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-stack" role="status" aria-live="polite">
        {toasts.map((t) => (
          <button key={t.id} type="button" className="toast" onClick={() => dismiss(t.id)}>
            <span className="toast-icon" aria-hidden="true">
              {t.icon}
            </span>
            <span className="toast-text">
              <strong>{t.title}</strong>
              {t.body && <span>{t.body}</span>}
            </span>
          </button>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): Ctx {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
