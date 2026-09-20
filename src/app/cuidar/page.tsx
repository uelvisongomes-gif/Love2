'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MessageCircleHeart, Sprout, CalendarHeart, Heart } from 'lucide-react';
import { AppHeader } from '@/components/app-header';
import { apiClient } from '@/lib/api-client';

interface Item {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  tag: 'privado' | 'casal';
}

const BASE_ITEMS: Item[] = [
  {
    href: '/chat',
    icon: <MessageCircleHeart className="w-5 h-5" />,
    title: 'Conversar com a LOVE',
    description: 'Bate-papo, desabafo, reflexão — você escolhe o tom.',
    tag: 'privado',
  },
  {
    href: '/checkin',
    icon: <Sprout className="w-5 h-5" />,
    title: 'Check-in do dia',
    description: 'Um minuto pra registrar como você tá hoje.',
    tag: 'privado',
  },
];

const MY_CYCLE: Item = {
  href: '/ciclo',
  icon: <CalendarHeart className="w-5 h-5" />,
  title: 'Meu ciclo',
  description: 'Calendário, TPM e preferências de cuidado.',
  tag: 'privado',
};

const HER_CYCLE: Item = {
  href: '/ciclo-parceira',
  icon: <Heart className="w-5 h-5" />,
  title: 'Ciclo dela',
  description: 'Menstruação, TPM e como ela gosta de ser cuidada.',
  tag: 'casal',
};

export default function CuidarPage(): React.ReactElement {
  const [items, setItems] = useState<Item[]>(BASE_ITEMS);

  useEffect(() => {
    void (async () => {
      try {
        const me = await apiClient<{ gender: string | null }>('/api/me');
        const g = me.gender;
        if (g === 'homem') setItems([...BASE_ITEMS, HER_CYCLE]);
        else if (g === 'mulher' || g === 'naobinario' || g === null || g === undefined)
          setItems([...BASE_ITEMS, MY_CYCLE]);
        // prefiro_nao_dizer → mostra só os base
        else setItems(BASE_ITEMS);
      } catch {
        // fallback: mostra os dois se o gender não carregou
        setItems([...BASE_ITEMS, MY_CYCLE, HER_CYCLE]);
      }
    })();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-bg">
      <AppHeader />
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 md:px-6 py-6 md:py-10">
        <header className="mb-8">
          <p className="type-eyebrow mb-2">— cuidar</p>
          <h1 className="font-display text-3xl md:text-4xl text-heading tracking-tight">
            Espaço pra respirar.
          </h1>
          <p className="mt-2 text-sm text-text/80 max-w-[54ch] leading-relaxed">
            Escuta, presença, autoconhecimento. Comece por onde precisa hoje.
          </p>
        </header>

        <ul className="space-y-3">
          {items.map((it) => (
            <li key={it.href}>
              <Link
                href={it.href}
                className="group flex items-start gap-4 rounded-xl border border-rule bg-surface hover:border-primary/40 hover:bg-primary/5 transition-colors p-4"
              >
                <span className="shrink-0 w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  {it.icon}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="flex items-center gap-2 mb-0.5">
                    <span className="font-display italic text-lg text-heading tracking-tight">
                      {it.title}
                    </span>
                    <span
                      className={`text-[9px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded-full border ${
                        it.tag === 'privado'
                          ? 'border-muted/40 text-muted'
                          : 'border-primary/40 text-primary'
                      }`}
                    >
                      {it.tag}
                    </span>
                  </span>
                  <span className="block text-sm text-text/80 leading-relaxed">
                    {it.description}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
