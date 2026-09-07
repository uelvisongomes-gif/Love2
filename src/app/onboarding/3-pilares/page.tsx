'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import * as SliderPrimitive from '@radix-ui/react-slider';
import { PILLARS, PILLAR_META, type Pillar } from '@/lib/love-languages';
import { apiClient } from '@/lib/api-client';
import { OnboardingProgress } from '@/components/onboarding-progress';
import { Button } from '@/components/ui/button';

type Scores = Record<Pillar, number>;

const initial: Scores = PILLARS.reduce((acc, p) => ({ ...acc, [p]: 5 }), {} as Scores);

function scoreLabel(n: number): string {
  if (n <= 2) return 'muito difícil';
  if (n <= 4) return 'difícil';
  if (n <= 6) return 'ok';
  if (n <= 8) return 'bem';
  return 'muito bem';
}

export default function Step3Page() {
  const router = useRouter();
  const [scores, setScores] = useState<Scores>(initial);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit() {
    setSubmitting(true);
    try {
      await apiClient('/api/profile', {
        method: 'PUT',
        body: JSON.stringify({ pillarScores: scores }),
      });
      router.push('/onboarding/4-preferencias');
    } catch (err) {
      toast.error((err as Error).message || 'Não consegui salvar.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto space-y-10">
      <OnboardingProgress currentStep={3} totalSteps={5} label="os 7 pilares" />

      <div>
        <p className="type-eyebrow mb-3">— um retrato honesto</p>
        <h1 className="font-display text-4xl text-heading tracking-tight">
          Como está cada <em className="text-primary italic">pilar</em>?
        </h1>
        <p className="mt-3 text-text font-medium">
          Arraste cada barra pra dizer como você sente que vocês estão. Sem certo ou errado — é uma foto de agora.
        </p>
      </div>

      <div className="space-y-7">
        {PILLARS.map((p) => (
          <div key={p} className="space-y-2">
            <div className="flex items-baseline justify-between">
              <div>
                <h3 className="font-display text-lg text-heading tracking-tight">{PILLAR_META[p].label}</h3>
                <p className="text-xs text-muted font-medium">{PILLAR_META[p].description}</p>
              </div>
              <div className="text-right">
                <div className="font-display italic text-2xl text-primary leading-none">{scores[p]}</div>
                <div className="text-[10px] uppercase tracking-wider text-muted font-semibold mt-1">
                  {scoreLabel(scores[p])}
                </div>
              </div>
            </div>
            <SliderPrimitive.Root
              value={[scores[p]]}
              onValueChange={(v) => setScores((prev) => ({ ...prev, [p]: v[0] ?? 5 }))}
              min={0}
              max={10}
              step={1}
              className="relative flex items-center w-full h-6 select-none"
            >
              <SliderPrimitive.Track className="bg-rule relative grow rounded-full h-1.5">
                <SliderPrimitive.Range className="absolute bg-primary rounded-full h-full" />
              </SliderPrimitive.Track>
              <SliderPrimitive.Thumb
                className="block w-5 h-5 bg-bg border-2 border-primary rounded-full shadow-soft hover:scale-110 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
                aria-label={PILLAR_META[p].label}
              />
            </SliderPrimitive.Root>
          </div>
        ))}
      </div>

      <div className="pt-4 flex justify-between items-center">
        <Button type="button" onClick={() => router.push('/onboarding/2-linguagens')} variant="ghost">
          Voltar
        </Button>
        <Button type="button" onClick={onSubmit} size="lg" disabled={submitting}>
          {submitting ? 'Salvando...' : 'Avançar'}
        </Button>
      </div>
    </div>
  );
}
