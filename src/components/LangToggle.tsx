import { useLang } from '../i18n';
import { t } from '../i18n/common';

export function LangToggle() {
  const { lang, toggle } = useLang();
  const m = t(lang);
  return (
    <button
      type="button"
      className="toggle-btn"
      onClick={toggle}
      aria-label={m.toggles.langAria}
      title={m.toggles.langAria}
    >
      <span className="icon" aria-hidden="true">
        🌐
      </span>
      <span>{m.toggles.langLabel}</span>
    </button>
  );
}
