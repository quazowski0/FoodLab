import { useEffect, useState } from 'react';

const STORAGE_KEY = 'foodlab-theme';

// Startowy tryb: zapisany wybór, a jeśli go nie ma, ustawienie systemu
function initialTheme() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
  } catch {
    // localStorage może być zablokowany (tryb prywatny)
  }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

const SunIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
    strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </svg>
);

const MoonIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
    strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />
  </svg>
);

// Przycisk jasny / ciemny w górnym pasku. Wybór zapisuje się w localStorage.
export default function ThemeToggle() {
  const [theme, setTheme] = useState(initialTheme);
  const isDark = theme === 'dark';

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // ignorujemy, tryb i tak działa do odświeżenia strony
    }
  }, [theme]);

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Włącz tryb jasny' : 'Włącz tryb ciemny'}
      title={isDark ? 'Tryb jasny' : 'Tryb ciemny'}
    >
      {/* key wymusza animację ikony przy każdej zmianie */}
      {isDark ? <SunIcon key="sun" /> : <MoonIcon key="moon" />}
    </button>
  );
}
