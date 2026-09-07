export default function HomePage() {
  return (
    <main className="max-w-2xl mx-auto px-6 py-12 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Bem-vinda(o).</h1>
      <p className="text-muted-foreground">
        Este é o seu início. Em breve, aqui aparecem seu check-in de hoje, últimas conversas com a LOVE e o índice de saúde do casal.
      </p>
      <div className="rounded-lg border p-6 bg-muted/40">
        <p className="text-sm text-muted-foreground">
          O fluxo de onboarding, chat com a LOVE, ponte entre parceiros e demais telas serão adicionados nos próximos planos.
        </p>
      </div>
    </main>
  );
}
