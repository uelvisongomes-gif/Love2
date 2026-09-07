import Link from 'next/link';

export default function OnboardingPlaceholderPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="max-w-md text-center space-y-4">
        <h1 className="text-2xl font-bold">Onboarding em construção</h1>
        <p className="text-muted-foreground text-sm">
          Este fluxo (linguagens do amor, 7 pilares, preferências e triagem) chega no próximo plano.
        </p>
        <Link href="/home" className="text-primary hover:underline text-sm">
          Ir para o início
        </Link>
      </div>
    </main>
  );
}
