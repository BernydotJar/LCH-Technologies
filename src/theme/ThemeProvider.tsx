import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { track } from '../analytics/client';
export type Theme = 'light' | 'dark' | 'system';
export type EffectiveTheme = Exclude<Theme, 'system'>;
const STORAGE_KEY = 'lch.theme';
const ThemeContext = createContext<{
  theme: Theme; effectiveTheme: EffectiveTheme; setTheme: (theme: Theme) => void; toggle: () => void;
} | null>(null);

export function getSavedTheme(): Theme {
  if (typeof window === 'undefined') return 'system';
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value === 'dark' || value === 'light' ? value : 'system';
  } catch { return 'system'; }
}
function systemPrefersDark(): boolean {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches === true;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(getSavedTheme);
  const [systemDark, setSystemDark] = useState(systemPrefersDark);
  const effectiveTheme: EffectiveTheme = theme === 'system' ? (systemDark ? 'dark' : 'light') : theme;
  useEffect(() => {
    const media = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (!media) return;
    const change = () => setSystemDark(media.matches);
    media.addEventListener?.('change', change);
    return () => media.removeEventListener?.('change', change);
  }, []);
  useEffect(() => {
    document.documentElement.dataset.theme = effectiveTheme;
    document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')?.setAttribute(
      'content', effectiveTheme === 'dark' ? '#070d1c' : '#0C0A50',
    );
    try {
      if (theme === 'system') window.localStorage.removeItem(STORAGE_KEY);
      else window.localStorage.setItem(STORAGE_KEY, theme);
    } catch { /* choice remains usable for this visit */ }
  }, [theme, effectiveTheme]);
  const value = useMemo(() => ({
    theme, effectiveTheme,
    setTheme: (nextTheme: Theme) => {
      setTheme(nextTheme);
      track('theme_change', { theme: nextTheme === 'system' ? (systemDark ? 'dark' : 'light') : nextTheme });
    },
    toggle: () => {
      const next = effectiveTheme === 'dark' ? 'light' : 'dark';
      setTheme(next);
      track('theme_change', { theme: next });
    },
  }), [theme, effectiveTheme, systemDark]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
export function useTheme() {
  const value = useContext(ThemeContext);
  if (!value) throw new Error('useTheme must be used within ThemeProvider');
  return value;
}
