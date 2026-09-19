'use client';
import { use, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Sparkles } from 'lucide-react';
import { AppHeader } from '@/components/app-header';
import { apiClient } from '@/lib/api-client';

type Step = 'fatos' | 'sentimento' | 'necessidade' | 'ponto_do_outro';

const STEP_QUESTIONS: Record<Step, string> = {
  fatos: 'Me conta o que aconteceu, do seu jeito. Só os fatos, sem se preocupar em decidir quem tá certo.',
  sentimento: 'E como você se sentiu com isso? Foi frustração, insegurança, sobrecarga, outra coisa?',
  necessidade: 'O que você precisava ali? Se pudesse mudar algo, o que gostaria que tivesse acontecido?',
  ponto_do_outro: 'Como você imagina que ele/ela viveu essa mesma situação? O que ele/ela pode ter precisado?',
};

const STEPS: Step[] = ['fatos', 'sentimento', 'necessidade', 'ponto_do_outro'];

interface Session {
  id: string;
  topic: string | null;
  status: string;
  synthesis: string | null;
  proposedAgreement: string | null;
  agreementId: string | null;
}

interface MyStep {
  step: Step;
  answer: string;
}

interface SessionData {
  session: Session;
  mySteps: MyStep[];
  partnerStepsCount: number;
  myRole: 'initiator' | 'target';
}

export default function MediationPage({ params }: { params: Promise<{ id: string }> }): React.ReactElement {
  const router = useRouter();
  const { id } = use(params);
  const [data, setData] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [synthesizing, setSynthesizing] = useState(false);
  const [agreementTitle, setAgreementTitle] = useState('');
  const [agreementContent, setAgreementContent] = useState('');

  const load = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const res = await apiClient<SessionData>(`/api/mediation/${id}`);
      setData(res);
      setAgreementContent(res.session.proposedAgreement ?? '');
      if (res.session.proposedAgreement) {
        const firstSentence = res.session.proposedAgreement.split(/[.!?\n]/)[0]?.trim() ?? '';
        setAgreementTitle(firstSentence.slice(0, 80));
      }
    } catch (err) {
      toast.error((err as Error).message || 'Erro.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const myStepMap = new Map(data?.mySteps.map((s) => [s.step, s.answer]) ?? []);
  const nextStep = STEPS.find((s) => !myStepMap.has(s));
  const iCompleted = data?.mySteps.length === STEPS.length;

  async function submitStep(): Promise<void> {
    if (!nextStep || !currentAnswer.trim()) return;
    setSubmitting(true);
    try {
      await apiClient(`/api/mediation/${id}/step`, {
        method: 'POST',
        body: JSON.stringify({ step: nextStep, answer: currentAnswer.trim() }),
      });
      setCurrentAnswer('');
      toast.success('Guardado.');
      void load();
    } catch (err) {
      toast.error((err as Error).message || 'Erro.');
    } finally {
      setSubmitting(false);
    }
  }

  async function synthesize(): Promise<void> {
    setSynthesizing(true);
    try {
      await apiClient(`/api/mediation/${id}/synthesize`, { method: 'POST' });
      toast.success('LOVE juntou os dois lados.');
      void load();
    } catch (err) {
      toast.error((err as Error).message || 'Erro.');
    } finally {
      setSynthesizing(false);
    }
  }

  async function acceptAgreement(): Promise<void> {
    if (!agreementTitle.trim() || !agreementContent.trim()) return;
    try {
      await apiClient(`/api/mediation/${id}/accept`, {
        method: 'POST',
        body: JSON.stringify({ title: agreementTitle.trim(), content: agreementContent.trim() }),
      });
      toast.success('Acordo salvo em /acordos.');
      router.push('/acordos');
    } catch (err) {
      toast.error((err as Error).message || 'Erro.');
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-bg">
      <AppHeader />
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 md:px-6 py-8">
        <div className="mb-6">
          <p className="type-eyebrow mb-2">— mediação conjunta</p>
          <h1 className="font-display text-2xl md:text-3xl text-heading tracking-tight">
            {data?.session.topic || 'Vocês combinaram uma conversa'}
          </h1>
        </div>

        {loading && <p className="text-sm text-muted">Carregando...</p>}

        {!loading && data && (
          <>
            {/* Progresso */}
            <div className="rounded-xl border border-rule bg-surface p-4 mb-6">
              <p className="text-xs text-muted font-medium">
                Você respondeu <strong className="text-heading">{data.mySteps.length}/4</strong> · Seu parceiro respondeu{' '}
                <strong className="text-heading">{data.partnerStepsCount}/4</strong>
              </p>
            </div>

            {/* Suas respostas já dadas (colapsadas) */}
            {data.mySteps.length > 0 && (
              <div className="mb-6">
                <p className="type-eyebrow mb-2">— suas respostas</p>
                <ul className="space-y-2">
                  {data.mySteps.map((s) => (
                    <li key={s.step} className="rounded-lg border border-rule bg-bg p-3">
                      <p className="text-[11px] text-muted font-semibold uppercase tracking-wider">
                        {s.step.replace(/_/g, ' ')}
                      </p>
                      <p className="text-sm text-text mt-0.5 leading-relaxed">{s.answer}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Próxima etapa (se você ainda não terminou) */}
            {nextStep && (
              <div className="rounded-2xl border border-primary/40 bg-primary/5 p-5 mb-6">
                <p className="type-eyebrow mb-2">— {nextStep.replace(/_/g, ' ')}</p>
                <p className="text-base text-heading font-semibold leading-relaxed mb-4">
                  {STEP_QUESTIONS[nextStep]}
                </p>
                <textarea
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  rows={4}
                  maxLength={4000}
                  autoFocus
                  placeholder="Escreve com calma, do seu jeito."
                  className="w-full resize-none rounded-lg border border-rule bg-bg p-3 text-sm mb-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                <button
                  type="button"
                  onClick={submitStep}
                  disabled={submitting || !currentAnswer.trim()}
                  className="w-full h-10 rounded-full bg-primary text-[hsl(var(--primary-fg))] font-semibold text-sm hover:bg-primary/90 disabled:opacity-50"
                >
                  {submitting ? 'Salvando...' : 'Guardar e ir pra próxima'}
                </button>
              </div>
            )}

            {/* Você terminou, aguardando parceiro */}
            {iCompleted && data.partnerStepsCount < 4 && data.session.status === 'in_progress' && (
              <div className="rounded-2xl border border-rule bg-surface p-6 text-center mb-6">
                <Sparkles className="w-6 h-6 mx-auto text-primary mb-2" />
                <p className="text-sm text-text">
                  Você já respondeu tudo. Agora tô esperando seu parceiro terminar também.
                </p>
                <p className="text-xs text-muted mt-2">
                  Ele/ela respondeu {data.partnerStepsCount}/4.
                </p>
              </div>
            )}

            {/* Pronto pra sintetizar */}
            {data.session.status === 'ready_for_synthesis' && !data.session.synthesis && (
              <button
                type="button"
                onClick={synthesize}
                disabled={synthesizing}
                className="w-full h-12 rounded-full bg-primary text-[hsl(var(--primary-fg))] font-semibold hover:bg-primary/90 disabled:opacity-50 mb-6"
              >
                {synthesizing ? 'Juntando os dois lados...' : '✨ Ver a síntese da LOVE'}
              </button>
            )}

            {/* Síntese + acordo proposto */}
            {data.session.synthesis && (
              <>
                <div className="rounded-2xl border border-rule bg-surface p-5 mb-6">
                  <p className="type-eyebrow mb-2">— o que a LOVE viu</p>
                  <p className="text-sm text-text leading-relaxed whitespace-pre-line">
                    {data.session.synthesis}
                  </p>
                </div>

                {data.session.proposedAgreement && data.session.status !== 'agreed' && (
                  <div className="rounded-2xl border border-primary/40 bg-primary/5 p-5 mb-6">
                    <p className="type-eyebrow mb-2">— acordo proposto</p>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1">Título</label>
                    <input
                      type="text"
                      value={agreementTitle}
                      onChange={(e) => setAgreementTitle(e.target.value)}
                      maxLength={200}
                      className="w-full h-10 rounded-lg border border-rule bg-bg px-3 text-sm mb-3"
                    />
                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1">Combinado</label>
                    <textarea
                      value={agreementContent}
                      onChange={(e) => setAgreementContent(e.target.value)}
                      rows={3}
                      maxLength={4000}
                      className="w-full resize-none rounded-lg border border-rule bg-bg p-3 text-sm mb-4"
                    />
                    <button
                      type="button"
                      onClick={acceptAgreement}
                      disabled={!agreementTitle.trim() || !agreementContent.trim()}
                      className="w-full h-11 rounded-full bg-primary text-[hsl(var(--primary-fg))] font-semibold text-sm hover:bg-primary/90 disabled:opacity-50"
                    >
                      Salvar acordo em /acordos
                    </button>
                  </div>
                )}

                {data.session.status === 'agreed' && (
                  <div className="rounded-2xl border border-green-500/40 bg-green-500/10 p-5 mb-6 text-center">
                    <p className="text-sm text-green-800 font-semibold">
                      🤝 Acordo feito e salvo em /acordos.
                    </p>
                  </div>
                )}
              </>
            )}
          </>
        )}

        <div className="mt-8 text-center">
          <Link href="/mediacoes" className="text-xs text-muted hover:text-primary">
            ← Todas as mediações
          </Link>
        </div>
      </main>
    </div>
  );
}
