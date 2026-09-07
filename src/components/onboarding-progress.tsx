interface Props {
  currentStep: number;
  totalSteps: number;
  label: string;
}

export function OnboardingProgress({ currentStep, totalSteps, label }: Props) {
  const pct = Math.round((currentStep / totalSteps) * 100);
  return (
    <div className="max-w-xl mx-auto w-full">
      <div className="flex items-center justify-between mb-2 text-xs text-muted font-semibold uppercase tracking-[0.14em]">
        <span>Passo {currentStep} de {totalSteps}</span>
        <span>{label}</span>
      </div>
      <div className="h-1 bg-rule rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
