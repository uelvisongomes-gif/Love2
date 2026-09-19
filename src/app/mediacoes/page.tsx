'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { AppHeader } from '@/components/app-header';
import { apiClient } from '@/lib/api-client';

interface Session {
  id: string;
  topic: string | null;
  status: string;
  initiatorId: string;
  targetId: string;
  createdAt: string;
}

const STATUS_LABEL: Record<string, string> = {
  in_progress: 'Em andamento',
  ready_for_synthesis: 'Pronto pra síntese',
  agreed: 'Acordo feito',
  canceled: 'Cancelada',
};

const STATUS_STYLE: Record<string, string> = {
  in_progress: 'border-primary/40 text-primary',
  ready_for_synthesis: 'border-amber-500/40 text-amber-700',
  agreed: 'border-green-500/40 text-green-700',
  canceled: 'border-muted/40 text-muted',
};

export default function MediacoesPage(): React.ReactElement {
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [topic, setTopic] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    (async (): Promise<void> => {
      try {
        const res = await apiClient<{ sessions: Session[] }>('/api/mediation');
        setSessions(res.sessions);
      } catch (err) {
        toast.error((err as Error).message || 'Erro.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function create(): Promise<void> {
    setCreating(true);
    try {
      const res = await apiClient<{ id: string }>('/api/mediation', {
        method: 'POST',
        body: JSON.stringify({ topic: topic.trim() || undefined }),
      });
      toast.success('Mediação iniciada — seu parceiro recebeu um email.');
      router.push(`/mediacao/${res.id}`);
    } catch (err) {
      const e = err as { code?: string; message?: string };
      if (e.code === 'NO_COUPLE') {
        toast.error('Vincule seu parceiro primeiro em /parceiro.');
        router.push('/parceiro');
      } else {
        toast.error(e.message || 'Erro.');
      }
      setCreating(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-bg">
      <AppHeader />
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 md:px-6 py-8">
        <div className="mb-6">
          <p className="type-eyebrow mb-2">— resolver juntos</p>
          <div className="flex items-center justify-between gap-3">
            <h1 className="font-display text-3xl md:text-4xl text-heading tracking-tight">
              <em className="text-primary italic">Mediações</em>
            </h1>
            <button
              type="button"
              onClick={() => setShowNew(true)}
              className="inline-flex items-center gap-1.5 h-10 px-4 rounded-full text-sm font-semibold bg-primary text-[hsl(var(--primary-fg))] hover:bg-primary/90"
            >
              <Plus className="w-4 h-4" /> Nova
            </button>
          </div>
          <p className="text-sm text-text font-medium mt-2">
            Vocês respondem 4 perguntas cada em privado. A LOVE junta os dois lados de forma neutra.
          </p>
        </div>

        {loading && <p className="text-sm text-muted">Carregando...</p>}

        {!loading && sessions.length === 0 && (
          <div className="rounded-2xl border border-rule border-dashed p-10 text-center">
            <p className="text-sm text-text mb-4">Nenhuma mediação ainda.</p>
            <button
              type="button"
              onClick={() => setShowNew(true)}
              className="inline-flex h-10 items-center px-5 rounded-full text-sm font-semibold bg-primary text-[hsl(var(--primary-fg))] hover:bg-primary/90"
            >
              Iniciar mediação
            </button>
          </div>
        )}

        {!loading && sessions.length > 0 && (
          <ul className="space-y-3">
            {sessions.map((s) => (
              <li key={s.id} className="rounded-xl border border-rule bg-surface p-4">
                <Link href={`/mediacao/${s.id}`} className="block">
                  <div className="flex items-baseline justify-between gap-2 mb-1">
                    <h3 className="font-display italic text-lg text-heading tracking-tight truncate">
                      {s.topic || 'Sem tópico'}
                    </h3>
                    <span
                      className={`inline-flex items-center h-5 px-2 rounded-full text-[9px] uppercase tracking-wider font-semibold border shrink-0 ${STATUS_STYLE[s.status]}`}
                    >
                      {STATUS_LABEL[s.status] ?? s.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted">
                    {new Date(s.createdAt).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-8 text-center">
          <Link href="/home" className="text-xs text-muted hover:text-primary">
            ← Voltar
          </Link>
        </div>
      </main>

      {showNew && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="bg-bg rounded-2xl border border-rule max-w-lg w-full p-6 shadow-lg">
            <p className="type-eyebrow mb-2">— nova mediação</p>
            <h2 className="font-display text-2xl text-heading tracking-tight mb-4">Convidar parceiro</h2>
            <p className="text-sm text-text font-medium mb-4 leading-relaxed">
              Vou mandar um email pro seu parceiro convidando pra participar. Vocês respondem 4 perguntas cada, em privado. Depois eu junto tudo de forma neutra.
            </p>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1">Sobre o que é (opcional)</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              maxLength={200}
              placeholder="Ex: divisão de tarefas em casa"
              className="w-full h-10 rounded-lg border border-rule bg-bg px-3 text-sm mb-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowNew(false)}
                disabled={creating}
                className="h-10 px-4 rounded-full text-sm font-semibold text-text hover:bg-surface"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={create}
                disabled={creating}
                className="h-10 px-5 rounded-full text-sm font-semibold bg-primary text-[hsl(var(--primary-fg))] hover:bg-primary/90 disabled:opacity-50"
              >
                {creating ? 'Enviando convite...' : 'Iniciar e convidar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
