'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu,
  X,
  MessageCircleHeart,
  Sprout,
  Flame,
  Handshake,
  ListChecks,
  Wallet,
  Baby,
  Target,
  HeartHandshake,
  CalendarHeart,
  Heart,
  Home,
  UserPlus,
  User,
} from 'lucide-react';

interface NavItem {
  href: string;
  icon: React.ReactNode;
  label: string;
}

interface Pillar {
  title: string;
  items: NavItem[];
}

const PILLARS: Pillar[] = [
  {
    title: 'Cuidar',
    items: [
      { href: '/chat', icon: <MessageCircleHeart className="w-4 h-4" />, label: 'Conversar' },
      { href: '/checkin', icon: <Sprout className="w-4 h-4" />, label: 'Check-in' },
      { href: '/ciclo', icon: <CalendarHeart className="w-4 h-4" />, label: 'Meu ciclo' },
      { href: '/ciclo-parceira', icon: <Heart className="w-4 h-4" />, label: 'Ciclo dela' },
    ],
  },
  {
    title: 'Resolver',
    items: [
      { href: '/chat?modo=conflict', icon: <Flame className="w-4 h-4" />, label: 'Tem conflito' },
      { href: '/mediacoes', icon: <MessageCircleHeart className="w-4 h-4" />, label: 'Mediação conjunta' },
      { href: '/acordos', icon: <Handshake className="w-4 h-4" />, label: 'Acordos' },
    ],
  },
  {
    title: 'Construir',
    items: [
      { href: '/tarefas', icon: <ListChecks className="w-4 h-4" />, label: 'Tarefas' },
      { href: '/financas', icon: <Wallet className="w-4 h-4" />, label: 'Finanças' },
      { href: '/filhos', icon: <Baby className="w-4 h-4" />, label: 'Filhos' },
      { href: '/metas', icon: <Target className="w-4 h-4" />, label: 'Metas' },
      { href: '/tempo-casal', icon: <HeartHandshake className="w-4 h-4" />, label: 'Tempo do casal' },
    ],
  },
];

const FOOTER: NavItem[] = [
  { href: '/parceiro', icon: <UserPlus className="w-4 h-4" />, label: 'Vincular parceiro' },
  { href: '/onboarding', icon: <User className="w-4 h-4" />, label: 'Meu perfil' },
];

export function SidebarNav(): React.ReactElement {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Abrir menu"
        className="h-9 w-9 rounded-full flex items-center justify-center text-heading hover:bg-surface transition-colors"
      >
        <Menu className="w-5 h-5" />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-40"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <aside className="fixed left-0 top-0 bottom-0 z-50 w-72 max-w-[85vw] bg-bg border-r border-rule shadow-xl overflow-y-auto">
            <div className="flex items-center justify-between px-5 h-16 border-b border-rule">
              <span className="font-display text-xl text-heading tracking-tight">
                love<span className="text-primary">2</span>
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Fechar menu"
                className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-surface"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <nav className="p-4 space-y-5">
              <Link
                href="/home"
                className={`flex items-center gap-2.5 h-10 px-3 rounded-lg text-sm font-medium ${
                  pathname === '/home' ? 'bg-primary/10 text-primary' : 'text-text hover:bg-surface'
                }`}
              >
                <Home className="w-4 h-4" /> Início
              </Link>

              {PILLARS.map((p) => (
                <div key={p.title}>
                  <p className="type-eyebrow text-[hsl(var(--secondary))] px-3 mb-1 not-italic uppercase tracking-wider text-[10px] font-semibold">
                    {p.title}
                  </p>
                  <ul className="space-y-0.5">
                    {p.items.map((it) => {
                      const active = pathname === it.href.split('?')[0];
                      return (
                        <li key={it.href}>
                          <Link
                            href={it.href}
                            className={`flex items-center gap-2.5 h-9 px-3 rounded-lg text-sm font-medium transition-colors ${
                              active
                                ? 'bg-primary/10 text-primary'
                                : 'text-text hover:bg-surface'
                            }`}
                          >
                            {it.icon}
                            {it.label}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}

              <div className="pt-4 border-t border-rule space-y-0.5">
                {FOOTER.map((it) => (
                  <Link
                    key={it.href}
                    href={it.href}
                    className="flex items-center gap-2.5 h-9 px-3 rounded-lg text-sm font-medium text-muted hover:text-text hover:bg-surface"
                  >
                    {it.icon}
                    {it.label}
                  </Link>
                ))}
              </div>
            </nav>
          </aside>
        </>
      )}
    </>
  );
}
