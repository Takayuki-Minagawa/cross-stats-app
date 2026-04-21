import { useTheme } from '../contexts/ThemeContext';
import { useLang } from '../i18n';
import { t } from '../i18n/common';

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const { lang } = useLang();
  const m = t(lang);
  const isDark = theme === 'dark';
  return (
    <button
      type="button"
      className="toggle-btn"
      onClick={toggle}
      aria-label={isDark ? m.toggles.switchToLight : m.toggles.switchToDark}
      title={isDark ? m.toggles.switchToLight : m.toggles.switchToDark}
    >
      <span className="icon" aria-hidden="true">
        {isDark ? '☀' : '☾'}
      </span>
      <span>{isDark ? m.toggles.lightLabel : m.toggles.darkLabel}</span>
    </button>
  );
}
