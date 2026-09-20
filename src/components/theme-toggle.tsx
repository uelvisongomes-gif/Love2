'use client';
import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

type Theme = 'light' | 'dark';

function readStored(): Theme {
  if (typeof window === 'undefined') return 'light';
  const v = localStorage.getItem('theme');
  return v === 'dark' ? 'dark' : 'light';
}

function apply(theme: Theme): void {
  const root = document.documentElement;
  root.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('light');
  useEffect(() => {
    setTheme(readStored());
  }, []);

  function toggle(): void {
    const next: Theme = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    apply(next);
  }

  const Icon = theme === 'light' ? Moon : Sun;
  const label = theme === 'light' ? 'Mudar pra tema escuro' : 'Mudar pra tema claro';

  return (
    <button
      onClick={toggle}
      title={label}
      aria-label={label}
      className="inline-flex items-center justify-center h-9 w-9 rounded-full text-muted hover:bg-surface hover:text-heading transition-colors"
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}
