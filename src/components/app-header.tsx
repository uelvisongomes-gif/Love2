import Link from 'next/link';
import { RingsLogo } from './rings-logo';
import { ThemeToggle } from './theme-toggle';
import { LogoutButton } from './logout-button';
import { SidebarNav } from './sidebar-nav';

interface Props {
  variant?: 'app' | 'public';
}

export function AppHeader({ variant = 'app' }: Props) {
  return (
    <header className="w-full border-b border-rule bg-bg">
      <div className="max-w-6xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {variant === 'app' && <SidebarNav />}
          <Link
            href={variant === 'app' ? '/home' : '/'}
            className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
          >
            <RingsLogo size={40} />
            <span className="font-display text-xl text-heading tracking-tight">
              love<span className="text-primary">2</span>
            </span>
          </Link>
        </div>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          {variant === 'app' && <LogoutButton />}
        </div>
      </div>
    </header>
  );
}
