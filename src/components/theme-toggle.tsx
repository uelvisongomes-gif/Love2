'use client';
import { useEffect, useState } from 'react';
import { Moon, Sun, MonitorCog } from 'lucide-react';

type Theme = 'light' | 'dark' | 'system';

function readStored(): Theme {
  if (typeof window === 'undefined') return 'system';
  const v = localStorage.getItem('theme');
  if (v === 'light' || v === 'dark') return v;
  return 'system';
}

function apply(theme: Theme): void {
  const root = document.documentElement;
  if (theme === 'system') {
    root.removeAttribute('data-theme');
    localStorage.removeItem('theme');
  } else {
    root.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('system');
  useEffect(() => {
    setTheme(readStored());
  }, []);

  function cycle(): void {
    const next: Theme = theme === 'system' ? 'light' : theme === 'light' ? 'dark' : 'system';
    setTheme(next);
    apply(next);
  }

  const Icon = theme === 'light' ? Sun : theme === 'dark' ? Moon : MonitorCog;
  const label =
    theme === 'light' ? 'Tema claro (clique pra escuro)' : theme === 'dark' ? 'Tema escuro (clique pra sistema)' : 'Tema do sistema (clique pra claro)';

  return (
    <button
      onClick={cycle}
      title={label}
      aria-label={label}
      className="inline-flex items-center justify-center h-9 w-9 rounded-full text-muted hover:bg-surface hover:text-heading transition-colors"
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}
