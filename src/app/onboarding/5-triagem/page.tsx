'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { AlertCircle } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { OnboardingProgress } from '@/components/onboarding-progress';
import { Button } from '@/components/ui/button';

type Answers = {
  hasViolenceHistory: boolean | null;
  hasSuicidalIdeation: boolean | null;
  substanceUse: boolean | null; // pré-pergunta (client-side)
  hasSubstanceAbuse: boolean | null; // só se substanceUse = true
  primaryChildCaregiver: 'eu' | 'parceiro' | 'igual' | null; // informativo
  houseIsSafeForChildren: boolean | null; // invertido internamente
};

const initial: Answers = {
  hasViolenceHistory: null,
  hasSuicidalIdeation: null,
  substanceUse: null,
  hasSubstanceAbuse: null,
  primaryChildCaregiver: null,
  houseIsSafeForChildren: null,
};

interface BoolQProps {
  text: string;
  value: boolean | null;
  onChange: (v: boolean) => void;
}
function BoolQuestion({ text, value, onChange }: BoolQProps): React.ReactElement {
  return (
    <fieldset className="p-4 rounded-lg border border-rule bg-bg">
      <legend className="sr-only">{text}</legend>
      <p className="text-sm text-text font-semibold mb-3 leading-relaxed">{text}</p>
      <div className="flex gap-2">
        {[false, true].map((v) => (
          <button
            key={String(v)}
            type="button"
            onClick={() => onChange(v)}
            className={`flex-1 h-10 rounded-full font-semibold text-sm border transition-colors ${
              value === v
                ? 'bg-primary text-[hsl(var(--primary-fg))] border-primary'
                : 'bg-bg text-text border-rule hover:bg-surface'
            }`}
          >
            {v ? 'Sim' : 'Não'}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

export default function Step5Page(): React.ReactElement {
  const router = useRouter();
  const [a, setA] = useState<Answers>(initial);
  const [acceptDisclaimer, setAcceptDisclaimer] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Se disse que não usa substâncias, a pergunta de problemas não precisa ser respondida
  const substanceAbuseAnswered =
    a.substanceUse === false || (a.substanceUse === true && a.hasSubstanceAbuse !== null);

  const allAnswered =
    a.hasViolenceHistory !== null &&
    a.hasSuicidalIdeation !== null &&
    a.substanceUse !== null &&
    substanceAbuseAnswered &&
    a.primaryChildCaregiver !== null &&
    a.houseIsSafeForChildren !== null;

  const canSubmit = allAnswered && acceptDisclaimer;

  async function onSubmit(): Promise<void> {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const payload = {
        hasViolenceHistory: a.hasViolenceHistory!,
        hasSuicidalIdeation: a.hasSuicidalIdeation!,
        // se disse que não usa, força false; senão pega a resposta
        hasSubstanceAbuse: a.substanceUse === true ? a.hasSubstanceAbuse! : false,
        // framing positivo → concern = NÃO é seguro
        hasChildSafetyConcerns: a.houseIsSafeForChildren === false,
      };
      const res = await apiClient<{ careModeActive: boolean }>(
        '/api/profile/safety-screening',
        { method: 'POST', body: JSON.stringify(payload) },
      );
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
        <BoolQuestion
          text="Nos últimos 12 meses, houve alguma forma de violência (física, verbal, psicológica ou patrimonial) entre vocês?"
          value={a.hasViolenceHistory}
          onChange={(v) => setA((prev) => ({ ...prev, hasViolenceHistory: v }))}
        />

        <BoolQuestion
          text="Você ou seu parceiro têm tido pensamentos de se machucar ou de dar cabo da vida?"
          value={a.hasSuicidalIdeation}
          onChange={(v) => setA((prev) => ({ ...prev, hasSuicidalIdeation: v }))}
        />

        <BoolQuestion
          text="Você ou seu parceiro fazem uso regular de álcool, cigarro, maconha, cocaína ou outra substância?"
          value={a.substanceUse}
          onChange={(v) =>
            setA((prev) => ({
              ...prev,
              substanceUse: v,
              // se muda pra "não", limpa a de abuso
              hasSubstanceAbuse: v ? prev.hasSubstanceAbuse : null,
            }))
          }
        />

        {a.substanceUse === true && (
          <BoolQuestion
            text="Esse uso tem trazido problemas sérios pro relacionamento?"
            value={a.hasSubstanceAbuse}
            onChange={(v) => setA((prev) => ({ ...prev, hasSubstanceAbuse: v }))}
          />
        )}

        {/* Quem é mais responsável pela criação dos filhos */}
        <fieldset className="p-4 rounded-lg border border-rule bg-bg">
          <legend className="sr-only">Quem é mais responsável pela criação dos filhos?</legend>
          <p className="text-sm text-text font-semibold mb-3 leading-relaxed">
            Quem é mais responsável pela criação dos filhos?
          </p>
          <p className="text-xs text-muted mb-3">Se vocês não têm filhos, escolha &quot;Igualmente / não se aplica&quot;.</p>
          <div className="flex flex-col gap-2">
            {[
              { v: 'eu', label: 'Eu, principalmente' },
              { v: 'parceiro', label: 'Meu parceiro, principalmente' },
              { v: 'igual', label: 'Igualmente / não se aplica' },
            ].map((opt) => (
              <button
                key={opt.v}
                type="button"
                onClick={() =>
                  setA((prev) => ({
                    ...prev,
                    primaryChildCaregiver: opt.v as 'eu' | 'parceiro' | 'igual',
                  }))
                }
                className={`h-10 rounded-full font-semibold text-sm border transition-colors ${
                  a.primaryChildCaregiver === opt.v
                    ? 'bg-primary text-[hsl(var(--primary-fg))] border-primary'
                    : 'bg-bg text-text border-rule hover:bg-surface'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </fieldset>

        <BoolQuestion
          text="A sua casa é um lugar seguro para crianças?"
          value={a.houseIsSafeForChildren}
          onChange={(v) => setA((prev) => ({ ...prev, houseIsSafeForChildren: v }))}
        />
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
