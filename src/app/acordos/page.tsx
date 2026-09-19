'use client';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { AppHeader } from '@/components/app-header';
import { apiClient } from '@/lib/api-client';

type Status = 'em_andamento' | 'cumprido' | 'precisa_revisar';

interface Agreement {
  id: string;
  title: string;
  content: string;
  status: Status;
  pillar?: string | null;
  createdAt: string;
  resolvedAt?: string | null;
}

const STATUS_LABEL: Record<Status, string> = {
  em_andamento: 'Em andamento',
  cumprido: 'Cumprido',
  precisa_revisar: 'Precisa revisar',
};

const STATUS_STYLE: Record<Status, string> = {
  em_andamento: 'bg-primary/10 text-primary border-primary/40',
  cumprido: 'bg-green-500/10 text-green-700 border-green-500/40',
  precisa_revisar: 'bg-amber-500/10 text-amber-700 border-amber-500/40',
};

export default function AcordosPage(): React.ReactElement {
  const [agreements, setAgreements] = useState<Agreement[] | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const res = await apiClient<{ agreements: Agreement[] }>('/api/agreements');
      setAgreements(res.agreements);
    } catch (err) {
      toast.error((err as Error).message || 'Não consegui carregar os acordos.');
      setAgreements([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function setStatus(id: string, status: Status): Promise<void> {
    try {
      await apiClient(`/api/agreements/${id}/status`, {
        method: 'POST',
        body: JSON.stringify({ status }),
      });
      setAgreements((prev) =>
        prev ? prev.map((a) => (a.id === id ? { ...a, status } : a)) : prev,
      );
    } catch (err) {
      toast.error((err as Error).message || 'Erro ao atualizar status.');
    }
  }

  async function remove(id: string): Promise<void> {
    if (!confirm('Excluir esse acordo? Essa ação não pode ser desfeita.')) return;
    try {
      await apiClient(`/api/agreements/${id}`, { method: 'DELETE' });
      setAgreements((prev) => (prev ? prev.filter((a) => a.id !== id) : prev));
    } catch (err) {
      toast.error((err as Error).message || 'Erro ao excluir.');
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-bg">
      <AppHeader />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 md:px-6 py-8">
        <div className="mb-8">
          <p className="type-eyebrow mb-2">— histórico</p>
          <h1 className="font-display text-3xl md:text-4xl text-heading tracking-tight">
            Acordos do <em className="text-primary italic">casal</em>
          </h1>
          <p className="mt-2 text-sm text-text font-medium">
            Combinados que vocês fizeram — pra lembrar, revisar, marcar como cumpridos.
          </p>
        </div>

        {loading && <p className="text-sm text-muted">Carregando...</p>}

        {!loading && agreements && agreements.length === 0 && (
          <div className="rounded-2xl border border-rule border-dashed p-10 text-center">
            <p className="text-sm text-text mb-4">Nenhum acordo salvo ainda.</p>
            <Link
              href="/chat"
              className="inline-flex h-10 items-center px-5 rounded-full text-sm font-semibold bg-primary text-[hsl(var(--primary-fg))] hover:bg-primary/90"
            >
              Ir pro chat
            </Link>
          </div>
        )}

        {!loading && agreements && agreements.length > 0 && (
          <ul className="space-y-4">
            {agreements.map((a) => (
              <li key={a.id} className="rounded-2xl border border-rule bg-surface p-5">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="font-display text-lg text-heading tracking-tight flex-1">
                    {a.title}
                  </h3>
                  <span
                    className={`shrink-0 inline-flex items-center h-6 px-2.5 rounded-full text-[10px] uppercase tracking-wider font-semibold border ${STATUS_STYLE[a.status]}`}
                  >
                    {STATUS_LABEL[a.status]}
                  </span>
                </div>
                <p className="text-sm text-text leading-relaxed whitespace-pre-line mb-3">
                  {a.content}
                </p>
                <div className="flex items-center justify-between text-[11px] text-muted mb-3">
                  <span>
                    Criado em{' '}
                    {new Date(a.createdAt).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                  {a.resolvedAt && (
                    <span>
                      Cumprido em{' '}
                      {new Date(a.resolvedAt).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'short',
                      })}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {a.status !== 'em_andamento' && (
                    <button
                      type="button"
                      onClick={() => setStatus(a.id, 'em_andamento')}
                      className="h-8 px-3 rounded-full text-[11px] font-semibold border border-rule text-text hover:bg-bg"
                    >
                      Voltar pra andamento
                    </button>
                  )}
                  {a.status !== 'cumprido' && (
                    <button
                      type="button"
                      onClick={() => setStatus(a.id, 'cumprido')}
                      className="h-8 px-3 rounded-full text-[11px] font-semibold bg-primary text-[hsl(var(--primary-fg))] hover:bg-primary/90"
                    >
                      Marcar cumprido
                    </button>
                  )}
                  {a.status !== 'precisa_revisar' && (
                    <button
                      type="button"
                      onClick={() => setStatus(a.id, 'precisa_revisar')}
                      className="h-8 px-3 rounded-full text-[11px] font-semibold border border-amber-500/40 text-amber-700 hover:bg-amber-500/10"
                    >
                      Precisa revisar
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => remove(a.id)}
                    className="h-8 px-3 rounded-full text-[11px] font-semibold text-muted hover:text-red-600"
                  >
                    Excluir
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-10 text-center">
          <Link href="/home" className="text-xs text-muted hover:text-primary">
            ← Voltar pro início
          </Link>
        </div>
      </main>
    </div>
  );
}
