'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, MessageCircleHeart, Sprout, Menu } from 'lucide-react';
import { useState } from 'react';
import { SidebarDrawer } from './sidebar-nav';

interface Item {
  href?: string;
  icon: React.ReactNode;
  label: string;
  action?: () => void;
}

export function BottomNav(): React.ReactElement {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const items: Item[] = [
    { href: '/home', icon: <Home className="w-5 h-5" />, label: 'Início' },
    { href: '/checkin', icon: <Sprout className="w-5 h-5" />, label: 'Check-in' },
    { href: '/chat', icon: <MessageCircleHeart className="w-5 h-5" />, label: 'LOVE' },
    { icon: <Menu className="w-5 h-5" />, label: 'Menu', action: () => setDrawerOpen(true) },
  ];

  return (
    <>
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-bg border-t border-rule pb-safe"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="grid grid-cols-4 h-14">
          {items.map((it) => {
            const active = it.href && (pathname === it.href || pathname.startsWith(it.href + '/'));
            const cls = `flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold uppercase tracking-wider transition-colors ${
              active ? 'text-primary' : 'text-muted hover:text-text'
            }`;
            if (it.href) {
              return (
                <Link key={it.label} href={it.href} className={cls}>
                  {it.icon}
                  <span>{it.label}</span>
                </Link>
              );
            }
            return (
              <button key={it.label} type="button" onClick={it.action} className={cls}>
                {it.icon}
                <span>{it.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
      <SidebarDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}
