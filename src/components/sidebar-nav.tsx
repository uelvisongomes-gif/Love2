'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu,
  X,
  MessageCircleHeart,
  Sprout,
  Handshake,
  Sparkles,
  Home,
  User,
  Users,
  BookLock,
  Settings,
  LogOut,
  TrendingUp,
  MessageSquare,
} from 'lucide-react';

interface NavItem {
  href: string;
  icon: React.ReactNode;
  label: string;
  hint?: string;
}

interface Section {
  title?: string;
  items: NavItem[];
}

const SECTIONS: Section[] = [
  {
    items: [{ href: '/home', icon: <Home className="w-4 h-4" />, label: 'Início' }],
  },
  {
    title: 'Cuidar',
    items: [
      { href: '/cuidar', icon: <Sparkles className="w-4 h-4" />, label: 'Cuidar', hint: 'espaço, escuta, ciclo' },
      { href: '/checkin', icon: <Sprout className="w-4 h-4" />, label: 'Check-in', hint: 'como você está hoje' },
      { href: '/evolucao', icon: <TrendingUp className="w-4 h-4" />, label: 'Evolução', hint: 'como vocês têm ido' },
    ],
  },
  {
    title: 'Resolver',
    items: [
      { href: '/resolver', icon: <Handshake className="w-4 h-4" />, label: 'Resolver', hint: 'conflito, mediação, acordo' },
    ],
  },
  {
    title: 'Construir',
    items: [
      { href: '/construir', icon: <Sprout className="w-4 h-4" />, label: 'Construir', hint: 'tarefas, filhos, futuro' },
    ],
  },
  {
    title: 'Minha conta',
    items: [
      { href: '/perfil', icon: <User className="w-4 h-4" />, label: 'Meu perfil' },
      { href: '/nos', icon: <Users className="w-4 h-4" />, label: 'Nós' },
      { href: '/historia', icon: <BookLock className="w-4 h-4" />, label: 'Minha história' },
      { href: '/whatsapp', icon: <MessageSquare className="w-4 h-4" />, label: 'WhatsApp' },
      { href: '/config', icon: <Settings className="w-4 h-4" />, label: 'Configurações' },
    ],
  },
];

function isActive(pathname: string, href: string): boolean {
  const clean = href.split('?')[0] ?? href;
  if (clean === '/home') return pathname === '/home';
  return pathname === clean || pathname.startsWith(clean + '/');
}

interface DrawerProps {
  open: boolean;
  onClose: () => void;
}

export function SidebarDrawer({ open, onClose }: DrawerProps): React.ReactElement | null {
  const pathname = usePathname();

  useEffect(() => {
    onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  const handleLogout = async (): Promise<void> => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch {
      /* ignore */
    }
    window.location.href = '/entrar';
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={onClose}
        aria-hidden
      />
      <aside className="fixed right-0 top-0 bottom-0 z-50 w-80 max-w-[88vw] bg-surface border-l border-rule shadow-2xl overflow-y-auto">
        <div className="flex items-center justify-between px-5 h-16 border-b border-rule">
          <span className="font-display text-xl text-heading tracking-tight">
            love<span className="text-primary">2</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar menu"
            className="h-9 w-9 rounded-full flex items-center justify-center hover:bg-bg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <nav className="p-4 space-y-6">
          {SECTIONS.map((section, idx) => (
            <div key={section.title ?? `section-${idx}`}>
              {section.title && (
                <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
                  {section.title}
                </p>
              )}
              <ul className="space-y-0.5">
                {section.items.map((it) => {
                  const active = isActive(pathname, it.href);
                  return (
                    <li key={it.href}>
                      <Link
                        href={it.href}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                          active
                            ? 'bg-primary/12 text-primary'
                            : 'text-text hover:bg-bg'
                        }`}
                      >
                        <span className="shrink-0">{it.icon}</span>
                        <span className="flex-1 min-w-0">
                          <span className="block leading-tight">{it.label}</span>
                          {it.hint && (
                            <span className="block text-[11px] text-muted mt-0.5 font-normal">
                              {it.hint}
                            </span>
                          )}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}

          <div className="pt-4 border-t border-rule">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted hover:text-danger hover:bg-bg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </button>
          </div>
        </nav>
      </aside>
    </>
  );
}

/** Hamburger button + drawer (used no header desktop) */
export function SidebarNav(): React.ReactElement {
  const [open, setOpen] = useState(false);
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
      <SidebarDrawer open={open} onClose={() => setOpen(false)} />
    </>
  );
}
