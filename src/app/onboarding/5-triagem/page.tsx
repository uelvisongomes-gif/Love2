'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { AlertCircle } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { OnboardingProgress } from '@/components/onboarding-progress';
import { Button } from '@/components/ui/button';

interface Q {
  id: 'hasViolenceHistory' | 'hasSuicidalIdeation' | 'hasSubstanceAbuse' | 'hasChildSafetyConcerns';
  text: string;
}

const QUESTIONS: Q[] = [
  {
    id: 'hasViolenceHistory',
    text: 'Nos últimos 12 meses, houve alguma forma de violência (física, verbal, psicológica ou patrimonial) entre vocês?',
  },
  {
    id: 'hasSuicidalIdeation',
    text: 'Você ou seu parceiro têm tido pensamentos de se machucar ou de dar cabo da vida?',
  },
  {
    id: 'hasSubstanceAbuse',
    text: 'O uso de álcool ou drogas tem trazido problemas sérios pra o relacionamento?',
  },
  {
    id: 'hasChildSafetyConcerns',
    text: 'Existe alguma preocupação com a segurança de crianças na sua casa?',
  },
];

type Answers = Record<Q['id'], boolean | null>;

const initial: Answers = {
  hasViolenceHistory: null,
  hasSuicidalIdeation: null,
  hasSubstanceAbuse: null,
  hasChildSafetyConcerns: null,
};

export default function Step5Page() {
  const router = useRouter();
  const [answers, setAnswers] = useState<Answers>(initial);
  const [acceptDisclaimer, setAcceptDisclaimer] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const allAnswered = QUESTIONS.every((q) => answers[q.id] !== null);
  const canSubmit = allAnswered && acceptDisclaimer;

  async function onSubmit() {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const payload = {
        hasViolenceHistory: answers.hasViolenceHistory!,
        hasSuicidalIdeation: answers.hasSuicidalIdeation!,
        hasSubstanceAbuse: answers.hasSubstanceAbuse!,
        hasChildSafetyConcerns: answers.hasChildSafetyConcerns!,
      };
      const res = await apiClient<{ careModeActive: boolean }>('/api/profile/safety-screening', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      await apiClient('/api/consent', {
        method: 'POST',
        body: JSON.stringify({ scope: 'disclaimer_love_not_therapist', version: '1' }),
      });
      toast.success('Perfil concluído.');
      if (res.careModeActive) router.push('/onboarding/cuidado');
      else router.push('/home');
      router.refresh();
    } catch (err) {
      toast.error((err as Error).message || 'Não consegui salvar.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto space-y-10">
      <OnboardingProgress currentStep={5} totalSteps={5} label="cuidado" />

      <div>
        <p className="type-eyebrow mb-3">— algumas perguntas de segurança</p>
        <h1 className="font-display text-4xl text-heading tracking-tight">
          Um <em className="text-primary italic">check-in</em> antes de começar.
        </h1>
        <p className="mt-3 text-text font-medium">
          Suas respostas ficam privadas e só servem pra a LOVE saber quando o caminho seguro é buscar ajuda humana especializada, não mediação por app.
        </p>
      </div>

      <div className="space-y-5">
        {QUESTIONS.map((q) => (
          <fieldset key={q.id} className="p-4 rounded-lg border border-rule bg-bg">
            <legend className="sr-only">{q.text}</legend>
            <p className="text-sm text-text font-semibold mb-3 leading-relaxed">{q.text}</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setAnswers((a) => ({ ...a, [q.id]: false }))}
                className={`flex-1 h-10 rounded-full font-semibold text-sm border transition-colors ${
                  answers[q.id] === false
                    ? 'bg-primary text-[hsl(var(--primary-fg))] border-primary'
                    : 'bg-bg text-text border-rule hover:bg-surface'
                }`}
              >
                Não
              </button>
              <button
                type="button"
                onClick={() => setAnswers((a) => ({ ...a, [q.id]: true }))}
                className={`flex-1 h-10 rounded-full font-semibold text-sm border transition-colors ${
                  answers[q.id] === true
                    ? 'bg-primary text-[hsl(var(--primary-fg))] border-primary'
                    : 'bg-bg text-text border-rule hover:bg-surface'
                }`}
              >
                Sim
              </button>
            </div>
          </fieldset>
        ))}
      </div>

      <label className="flex items-start gap-3 p-4 rounded-lg border border-rule bg-surface cursor-pointer">
        <input
          type="checkbox"
          checked={acceptDisclaimer}
          onChange={(e) => setAcceptDisclaimer(e.target.checked)}
          className="mt-1 h-4 w-4 rounded accent-primary"
        />
        <span className="text-sm text-text font-medium leading-relaxed">
          Entendo que a LOVE é uma <strong className="text-heading">mediadora</strong>, não uma
          psicóloga nem terapeuta, e não substitui atendimento profissional em saúde mental.
        </span>
      </label>

      <div className="pt-4 flex justify-between items-center">
        <Button type="button" onClick={() => router.push('/onboarding/4-preferencias')} variant="ghost">
          Voltar
        </Button>
        <Button type="button" onClick={onSubmit} size="lg" disabled={!canSubmit || submitting}>
          {submitting ? 'Salvando...' : 'Concluir'}
        </Button>
      </div>

      {!allAnswered && (
        <p className="text-xs text-muted flex items-center justify-end gap-1.5 font-semibold">
          <AlertCircle className="w-3 h-3" /> Responda todas as perguntas pra concluir.
        </p>
      )}
    </div>
  );
}
