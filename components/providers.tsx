'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';
type Ctx = { theme: Theme; setTheme: (t: Theme) => void; toggle: () => void };

const ThemeCtx = createContext<Ctx>({ theme: 'light', setTheme: () => {}, toggle: () => {} });

export function useTheme() { return useContext(ThemeCtx); }

export function Providers({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light');

  // Load saved theme on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('bh-theme') as Theme | null;
      if (saved) setThemeState(saved);
    } catch {}
  }, []);

  // Reflect on <html> element and persist
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem('bh-theme', theme); } catch {}
  }, [theme]);

  const setTheme = (t: Theme) => setThemeState(t);
  const toggle = () => setThemeState(theme === 'dark' ? 'light' : 'dark');

  return <ThemeCtx.Provider value={{ theme, setTheme, toggle }}>{children}</ThemeCtx.Provider>;
}
