import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function HomePage() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-10">
        <p className="type-eyebrow mb-3">— seu início</p>
        <h1 className="font-display text-4xl md:text-5xl text-heading tracking-tight">
          Bem-vinda(o).
        </h1>
        <p className="mt-3 text-muted max-w-[52ch]">
          Em breve, aqui aparecem seu check-in de hoje, últimas conversas com a LOVE e o índice de saúde do casal.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Onboarding</CardTitle>
            <CardDescription>
              Preencha seu perfil (linguagens do amor, pilares) pra a LOVE calibrar as conversas.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted">Em construção — próximo plano.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Convidar parceiro</CardTitle>
            <CardDescription>
              Vincule seu parceiro à sua conta pra ativar a ponte entre vocês.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted">Em construção.</p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
