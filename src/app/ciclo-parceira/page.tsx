'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Heart } from 'lucide-react';
import { AppHeader } from '@/components/app-header';
import { apiClient } from '@/lib/api-client';

interface PartnerData {
  hasPartner: boolean;
  hasAccess: boolean;
  partnerName?: string;
  prediction?: {
    nextPeriodStart?: string;
    nextPeriodEnd?: string;
    nextPreMenstrual?: string;
    daysUntilPeriod?: number;
    currentPhase?: string;
    averagePeriodDays?: number;
    averageCycleDays?: number;
    premenstrualDays?: number;
  };
  preferences?: string[];
  customNote?: string | null;
}

const CARE_LABELS: Record<string, string> = {
  mais_carinho: 'Prefere mais carinho',
  mais_espaco: 'Prefere mais espaço',
  paciencia_com_sensibilidade: 'Paciência com sensibilidade',
  ajuda_nas_tarefas: 'Ajuda nas tarefas do dia',
  evitar_conversas_dificeis: 'Adiar conversas difíceis',
  perguntar_como_estou: 'Perguntar como está antes de presumir',
  lembrar_de_comprar_o_que_preciso: 'Lembrar de comprar o que ela costuma precisar',
};

const PHASE_LABEL: Record<string, string> = {
  menstruacao: 'Menstruação',
  folicular: 'Fase folicular',
  ovulacao: 'Ovulação',
  lutea: 'Fase lútea',
  pre_menstrual: 'Pré-menstrual',
};

function formatDate(iso?: string): string {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y!, m! - 1, d!).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
  });
}

export default function CicloParceiraPage(): React.ReactElement {
  const [data, setData] = useState<PartnerData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async (): Promise<void> => {
      try {
        const res = await apiClient<PartnerData>('/api/cycle/partner');
        setData(res);
      } catch (err) {
        toast.error((err as Error).message || 'Erro.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-bg">
      <AppHeader />
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 md:px-6 py-8">
        <div className="mb-6">
          <p className="type-eyebrow mb-2">— cuidar de quem você ama</p>
          <h1 className="font-display text-3xl md:text-4xl text-heading tracking-tight">
            Ciclo <em className="text-primary italic">dela</em>
          </h1>
        </div>

        {loading && <p className="text-sm text-muted">Carregando...</p>}

        {!loading && data && !data.hasPartner && (
          <div className="rounded-2xl border border-rule border-dashed p-8 text-center">
            <p className="text-sm text-text mb-4">
              Vocês precisam estar vinculados como casal pra ver essa área.
            </p>
            <Link
              href="/parceiro"
              className="inline-flex h-10 items-center px-5 rounded-full text-sm font-semibold bg-primary text-[hsl(var(--primary-fg))] hover:bg-primary/90"
            >
              Vincular parceiro
            </Link>
          </div>
        )}

        {!loading && data && data.hasPartner && !data.hasAccess && (
          <div className="rounded-2xl border border-rule bg-surface p-8 text-center">
            <Heart className="w-8 h-8 mx-auto text-primary/60 mb-3" />
            <p className="text-sm text-text mb-2">
              <strong className="text-heading">{data.partnerName ?? 'Sua parceira'}</strong> ainda não compartilhou o ciclo com você.
            </p>
            <p className="text-xs text-muted">
              Só ela pode decidir quando e o que compartilhar. Respeitar isso já é cuidado.
            </p>
          </div>
        )}

        {!loading && data && data.hasAccess && (
          <>
            {data.prediction?.currentPhase && (
              <div className="rounded-2xl border border-rule bg-surface p-5 mb-4">
                <p className="type-eyebrow mb-1">— agora</p>
                <h2 className="font-display italic text-2xl text-primary tracking-tight">
                  {PHASE_LABEL[data.prediction.currentPhase] ?? '—'}
                </h2>
              </div>
            )}

            {data.prediction?.nextPeriodStart && (
              <div className="rounded-xl border border-rule bg-bg p-4 mb-3">
                <p className="text-[10px] uppercase tracking-wider text-muted font-semibold">
                  Próxima menstruação (estimada)
                </p>
                <p className="font-display italic text-xl text-heading tracking-tight mt-1">
                  {formatDate(data.prediction.nextPeriodStart)}
                  {data.prediction.nextPeriodEnd && (
                    <span className="text-heading"> — {formatDate(data.prediction.nextPeriodEnd)}</span>
                  )}
                  {data.prediction.daysUntilPeriod !== undefined && (
                    <span className="text-sm text-muted ml-2">
                      ({data.prediction.daysUntilPeriod > 0 ? `em ${data.prediction.daysUntilPeriod}d` : 'esperada'})
                    </span>
                  )}
                </p>
                {data.prediction.averagePeriodDays && (
                  <p className="text-xs text-muted mt-1">
                    Costuma durar ~{data.prediction.averagePeriodDays} dias
                  </p>
                )}
              </div>
            )}

            {data.prediction?.nextPreMenstrual && (
              <div className="rounded-xl border border-rule bg-bg p-4 mb-6">
                <p className="text-[10px] uppercase tracking-wider text-muted font-semibold">
                  Período pré-menstrual (TPM estimada)
                </p>
                <p className="font-display italic text-xl text-heading tracking-tight mt-1">
                  a partir de {formatDate(data.prediction.nextPreMenstrual)}
                </p>
                {data.prediction.premenstrualDays && (
                  <p className="text-xs text-muted mt-1">
                    Costuma sentir mudança ~{data.prediction.premenstrualDays} dias antes
                  </p>
                )}
              </div>
            )}

            {data.preferences && data.preferences.length > 0 && (
              <div className="rounded-2xl border border-primary/40 bg-primary/5 p-5 mb-4">
                <p className="type-eyebrow mb-2">— como ela gosta de ser cuidada</p>
                <ul className="space-y-2">
                  {data.preferences.map((p) => (
                    <li key={p} className="text-sm text-text flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>{CARE_LABELS[p] ?? p}</span>
                    </li>
                  ))}
                </ul>
                {data.customNote && (
                  <div className="mt-4 pt-4 border-t border-primary/20">
                    <p className="text-[10px] uppercase tracking-wider text-muted font-semibold mb-1">
                      Nota pessoal
                    </p>
                    <p className="text-sm text-text leading-relaxed">{data.customNote}</p>
                  </div>
                )}
              </div>
            )}

            <div className="rounded-xl border border-rule border-dashed p-4 text-center mt-6">
              <p className="text-xs text-muted leading-relaxed">
                Cuidar dela nesses dias pode ser simples: perguntar como ela está, ajudar em uma tarefa, respeitar espaço quando pedido. <strong className="text-heading">Cada pessoa vive esse período de um jeito diferente.</strong>
              </p>
            </div>
          </>
        )}

        <div className="mt-8 text-center">
          <Link href="/home" className="text-xs text-muted hover:text-primary">
            ← Voltar
          </Link>
        </div>
      </main>
    </div>
  );
}
