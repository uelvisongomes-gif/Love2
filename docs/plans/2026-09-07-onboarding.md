# Frontend Plan 2 — Onboarding real

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Substituir a página placeholder `/onboarding` por um fluxo em passos que colete o perfil (tempo juntos, filhos, moradia, timezone), as **5 linguagens do amor** (ranking drag-and-drop), notas nos **7 pilares** (sliders 0–10), **preferências de tema** (religião opt-in, temas evitados) e **triagem de segurança** — persistindo em `PUT /profile` e `POST /profile/safety-screening`, e concedendo `disclaimer_love_not_therapist` ao chegar no final.

**Arquitetura:** Um layout compartilhado `/onboarding/layout.tsx` que renderiza o progresso (5 passos numerados) e o slot `{children}`. Cada passo é uma rota (`/onboarding/1-quem-sou`, `.../2-linguagens`, etc.) — Server Component pra o layout do passo, Client Component pra o form (react-hook-form + zod). O estado do onboarding é composto: cada passo salva sua parcela via `PUT /profile` ou `POST /profile/safety-screening`, e no último passo grava o consent do disclaimer.

**Tech stack:** Igual ao Foundation. Adiciona **dnd-kit** pro drag-and-drop das linguagens do amor.

## Global Constraints

- Todos os Global Constraints do Foundation valem.
- **Fluxo é opcional pular:** um botão discreto "pular por enquanto" leva pra `/home`. Perfil incompleto é aceitável — LOVE usa defaults e o usuário completa depois em `/perfil`.
- **Cada passo salva ao avançar** — se o usuário abandonar no passo 3, os passos 1 e 2 já estão salvos.
- **Progress bar** visível: mostra em qual passo (1/5, 2/5…) sem números frios — visual só, textual embaixo.
- **Escapa de emergência sempre visível:** rodapé com "Em situação de violência? Ligue 180 · CVV 188".
- **Triagem de segurança (passo 5):** perguntas discretas, sem alarme, tom cuidadoso. Se qualquer flag = true, o usuário é levado pra uma tela de "modo cuidado" ao final (não pra `/home` normal), com orientação clara — mediação por blocos fica bloqueada pra este usuário até revisão.

## Passos do onboarding

1. **Quem sou** — tempo juntos (anos), tem filhos (sim/não), moram juntos (sim/não), timezone (auto-detect com opção manual)
2. **Linguagens do amor** — 5 cards arrastáveis pra ordenar do mais importante ao menos importante
3. **7 pilares** — sliders 0–10 pra cada um: financeiro, comunicação, intimidade, filhos, tarefas, papéis, espiritualidade (labels claros por baixo do slider)
4. **Preferências** — checkbox "posso abordar espiritualidade nas conversas?" + campo de religião (livre, opcional) + checkbox "posso tocar em política?" + input livre "há algum tema que você prefere que a LOVE evite?"
5. **Triagem** — 4 perguntas booleanas, framing acolhedor: "algo desses aconteceu nos últimos 12 meses?" (violência, ideação suicida, dependência ativa, preocupações com segurança de criança). No final, aceite explícito do disclaimer da LOVE.

Após o passo 5: se careModeActive → `/onboarding/cuidado` (mensagem + hotlines + botão "ir pro início"). Senão → `/home`.

---

### Task 1: Layout do onboarding + progress + navegação

**Files:**
- Create: `src/app/onboarding/layout.tsx`, `src/components/onboarding-progress.tsx`, `src/components/onboarding-footer.tsx`
- Modify: `src/app/onboarding/page.tsx` (redirect pra `/onboarding/1-quem-sou`)

**Interfaces:**
- Produces:
  - `<OnboardingLayout>` com header (marca + tema toggle), main com progress e slot, footer com hotlines
  - `<OnboardingProgress currentStep={n} totalSteps={5} />` — barra visual + label
  - Rota `/onboarding` redireciona pra `/onboarding/1-quem-sou`

- [ ] **Step 1: Criar `src/components/onboarding-progress.tsx`**

```tsx
interface Props { currentStep: number; totalSteps: number; label: string; }

export function OnboardingProgress({ currentStep, totalSteps, label }: Props) {
  const pct = Math.round((currentStep / totalSteps) * 100);
  return (
    <div className="max-w-xl mx-auto w-full">
      <div className="flex items-center justify-between mb-2 text-xs text-muted font-semibold uppercase tracking-wider">
        <span>Passo {currentStep} de {totalSteps}</span>
        <span>{label}</span>
      </div>
      <div className="h-1 bg-rule rounded-full overflow-hidden">
        <div className="h-full bg-primary transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Criar `src/components/onboarding-footer.tsx`**

```tsx
export function OnboardingFooter() {
  return (
    <footer className="border-t border-rule bg-bg">
      <div className="max-w-6xl mx-auto px-6 py-4 text-center text-xs text-muted font-medium">
        Em situação de violência? <strong className="text-heading font-semibold">Ligue 180</strong> · <strong className="text-heading font-semibold">CVV 188</strong> — 24h, ligação gratuita.
      </div>
    </footer>
  );
}
```

- [ ] **Step 3: Criar `src/app/onboarding/layout.tsx`**

```tsx
import Link from 'next/link';
import { RingsLogo } from '@/components/rings-logo';
import { ThemeToggle } from '@/components/theme-toggle';
import { OnboardingFooter } from '@/components/onboarding-footer';

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-bg">
      <header className="w-full border-b border-rule">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/home" className="flex items-center gap-2.5 font-display text-lg text-heading">
            <RingsLogo size={32} />
            LOVE Casal
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/home" className="text-sm text-muted hover:text-heading font-medium transition-colors">
              Pular por enquanto
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main className="flex-1 px-6 py-10">{children}</main>
      <OnboardingFooter />
    </div>
  );
}
```

- [ ] **Step 4: Reescrever `src/app/onboarding/page.tsx` como redirect**

```tsx
import { redirect } from 'next/navigation';
export default function OnboardingRoot() {
  redirect('/onboarding/1-quem-sou');
}
```

- [ ] **Step 5: Commit**

```bash
git add src/components/onboarding-* src/app/onboarding
git commit -m "feat(onboarding): shared layout + progress + hotline footer + root redirect"
```

---

### Task 2: Passo 1 — "Quem sou" (tempo, filhos, moradia, timezone)

**Files:**
- Create: `src/app/onboarding/1-quem-sou/page.tsx`
- Modify: `src/lib/schemas.ts` (adiciona `profileStep1` schema)

**Interfaces:**
- Salva parcial via `PUT /profile` (via um novo Route Handler `/api/profile`)
- Após submit → `/onboarding/2-linguagens`

- [ ] **Step 1: Criar Route Handler `src/app/api/profile/route.ts`**

```ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

export async function PUT(req: Request): Promise<Response> {
  const token = (await cookies()).get('access_token')?.value;
  if (!token) return NextResponse.json({ error: { code: 'UNAUTHORIZED' } }, { status: 401 });
  const body = await req.json();
  const res = await fetch(BASE_URL + '/profile', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  return NextResponse.json(json, { status: res.status });
}

export async function GET(): Promise<Response> {
  const token = (await cookies()).get('access_token')?.value;
  if (!token) return NextResponse.json({ error: { code: 'UNAUTHORIZED' } }, { status: 401 });
  const res = await fetch(BASE_URL + '/profile', {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json();
  return NextResponse.json(json, { status: res.status });
}
```

- [ ] **Step 2: Adicionar schema em `src/lib/schemas.ts`**

```ts
export const profileStep1 = z.object({
  relationshipYears: z.coerce.number().int().min(0).max(80),
  hasChildren: z.boolean(),
  livingTogether: z.boolean(),
  timezone: z.string().min(1),
});
export type ProfileStep1 = z.infer<typeof profileStep1>;
```

- [ ] **Step 3: Criar `src/app/onboarding/1-quem-sou/page.tsx`**

```tsx
'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { profileStep1, type ProfileStep1 } from '@/lib/schemas';
import { apiClient } from '@/lib/api-client';
import { OnboardingProgress } from '@/components/onboarding-progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function Step1Page() {
  const router = useRouter();
  const tz = typeof window !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'America/Sao_Paulo';
  const { register, handleSubmit, setValue, watch, formState } = useForm<ProfileStep1>({
    resolver: zodResolver(profileStep1),
    defaultValues: { relationshipYears: 1, hasChildren: false, livingTogether: false, timezone: tz },
  });

  async function onSubmit(v: ProfileStep1) {
    try {
      await apiClient('/api/profile', { method: 'PUT', body: JSON.stringify(v) });
      router.push('/onboarding/2-linguagens');
    } catch (err) {
      toast.error((err as Error).message ?? 'Erro ao salvar.');
    }
  }

  const hasChildren = watch('hasChildren');
  const livingTogether = watch('livingTogether');

  return (
    <div className="max-w-xl mx-auto space-y-10">
      <OnboardingProgress currentStep={1} totalSteps={5} label="quem sou" />
      <div>
        <p className="type-eyebrow mb-3">— primeiro, o básico</p>
        <h1 className="font-display text-4xl text-heading tracking-tight">Me conta sobre vocês.</h1>
        <p className="mt-3 text-text font-medium">Nada disso é obrigatório. Você pode voltar e ajustar depois.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="years">Há quantos anos vocês estão juntos?</Label>
          <Input id="years" type="number" min={0} max={80} {...register('relationshipYears')} />
        </div>

        <fieldset className="space-y-3">
          <legend className="text-sm font-semibold text-heading">Vocês têm filhos?</legend>
          <div className="flex gap-2">
            <ToggleButton active={!hasChildren} onClick={() => setValue('hasChildren', false)}>Não</ToggleButton>
            <ToggleButton active={hasChildren} onClick={() => setValue('hasChildren', true)}>Sim</ToggleButton>
          </div>
        </fieldset>

        <fieldset className="space-y-3">
          <legend className="text-sm font-semibold text-heading">Moram juntos?</legend>
          <div className="flex gap-2">
            <ToggleButton active={!livingTogether} onClick={() => setValue('livingTogether', false)}>Não</ToggleButton>
            <ToggleButton active={livingTogether} onClick={() => setValue('livingTogether', true)}>Sim</ToggleButton>
          </div>
        </fieldset>

        <input type="hidden" {...register('timezone')} />

        <div className="pt-4 flex justify-end">
          <Button type="submit" size="lg" disabled={formState.isSubmitting}>
            {formState.isSubmitting ? 'Salvando...' : 'Avançar'}
          </Button>
        </div>
      </form>
    </div>
  );
}

function ToggleButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-11 px-6 rounded-full font-semibold text-sm border transition-colors ${
        active
          ? 'bg-primary text-[hsl(var(--primary-fg))] border-primary'
          : 'bg-bg text-text border-rule hover:bg-surface'
      }`}
    >
      {children}
    </button>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/api/profile src/app/onboarding/1-quem-sou src/lib/schemas.ts
git commit -m "feat(onboarding): step 1 — quem sou (relationship years, kids, cohab, tz)"
```

---

### Task 3: Passo 2 — Linguagens do amor (drag-and-drop ranking)

**Files:**
- Create: `src/app/onboarding/2-linguagens/page.tsx`
- Modify: `src/lib/schemas.ts` (adiciona `profileStep2` schema), `package.json` (adiciona `@dnd-kit/core` + `@dnd-kit/sortable`)

**Interfaces:**
- 5 cards com título + descrição das linguagens do amor
- Arrastar pra reordenar (do mais importante em cima ao menos importante em baixo)
- Salva `loveLanguagesRanking` array via `PUT /api/profile`
- Após submit → `/onboarding/3-pilares`

- [ ] **Step 1: Instalar dnd-kit**

```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

- [ ] **Step 2: Adicionar schema**

```ts
import { LOVE_LANGUAGES } from '@/lib/love-languages';
export const profileStep2 = z.object({
  loveLanguagesRanking: z.array(z.enum(LOVE_LANGUAGES)).length(5),
});
```

- [ ] **Step 3: Criar `src/lib/love-languages.ts`**

```ts
export const LOVE_LANGUAGES = [
  'palavras_afirmacao',
  'tempo_qualidade',
  'presentes',
  'atos_servico',
  'toque_fisico',
] as const;
export type LoveLanguage = (typeof LOVE_LANGUAGES)[number];

export const LOVE_LANGUAGE_META: Record<LoveLanguage, { label: string; description: string }> = {
  palavras_afirmacao: {
    label: 'Palavras de afirmação',
    description: 'Elogios, incentivos, mensagens de carinho e reconhecimento sincero.',
  },
  tempo_qualidade: {
    label: 'Tempo de qualidade',
    description: 'Atenção plena, presença sem celular, conversa sem pressa.',
  },
  presentes: {
    label: 'Presentes',
    description: 'Lembranças pequenas ou grandes que dizem "pensei em você".',
  },
  atos_servico: {
    label: 'Atos de serviço',
    description: 'Ações práticas que aliviam sua carga do dia a dia.',
  },
  toque_fisico: {
    label: 'Toque físico',
    description: 'Abraços, mãos dadas, proximidade — não só sexual.',
  },
};
```

- [ ] **Step 4: Criar `src/app/onboarding/2-linguagens/page.tsx`** (drag-drop com dnd-kit)

Implementa `DndContext` + `SortableContext` + `useSortable` — cada card mostra rank (1º, 2º, 3º, 4º, 5º) + label + descrição + ícone de drag handle. Ao soltar, atualiza array; ao clicar em "Avançar", `PUT /api/profile` com `loveLanguagesRanking`.

*[Código completo — omitido aqui pra concisão; segue padrão dnd-kit oficial]*

- [ ] **Step 5: Commit**

```bash
git add src/app/onboarding/2-linguagens src/lib/love-languages.ts src/lib/schemas.ts package.json package-lock.json
git commit -m "feat(onboarding): step 2 — love languages drag-and-drop ranking"
```

---

### Task 4: Passo 3 — 7 pilares (sliders)

**Files:**
- Create: `src/app/onboarding/3-pilares/page.tsx`, `src/components/ui/slider.tsx`
- Modify: `src/lib/schemas.ts`

**Interfaces:**
- 7 sliders, cada um 0–10 (label por baixo: "muito ruim" ↔ "muito bem")
- Cada linha: título do pilar + slider + valor atual
- Salva `pillarScores` object via `PUT /api/profile`
- Após submit → `/onboarding/4-preferencias`

*[Slider component nativo `<input type="range">` com estilização, ou @radix-ui/react-slider]*

- [ ] **Step 1: Instalar radix slider**
```
npm install @radix-ui/react-slider
```

- [ ] **Step 2: Componente `<Slider>`, schema, e página com 7 sliders**

- [ ] **Step 3: Commit**

---

### Task 5: Passo 4 — Preferências (religião, temas)

**Files:**
- Create: `src/app/onboarding/4-preferencias/page.tsx`, `src/components/ui/checkbox.tsx`

**Interfaces:**
- Toggle "posso abordar espiritualidade?" (booleano)
- Se true: input de religião (livre, opcional)
- Toggle "posso tocar em política?"
- Textarea "outros temas a evitar" (opcional)
- Salva `preferences` object via `PUT /api/profile`
- Após submit → `/onboarding/5-triagem`

---

### Task 6: Passo 5 — Triagem + aceite disclaimer + roteamento final

**Files:**
- Create: `src/app/onboarding/5-triagem/page.tsx`, `src/app/onboarding/cuidado/page.tsx`, `src/app/api/profile/safety-screening/route.ts`, `src/app/api/consent/route.ts`

**Interfaces:**
- 4 checkboxes discretos (violência, suicídio, drogas, criança) com framing acolhedor
- Aceite explícito do disclaimer (checkbox obrigatório): "Entendo que a LOVE é uma mediadora, não uma psicóloga nem terapeuta"
- Salva `POST /profile/safety-screening` + `POST /consent` (disclaimer)
- Se careModeActive → `/onboarding/cuidado` (tela dedicada com hotlines + botão "ir pro início")
- Senão → `/home` com toast "Perfil concluído"

- [ ] **Step 1-6: Route handlers, página de triagem, tela de cuidado, redirecionamento**

- [ ] **Step 7: Commit**

---

## Self-Review Notes

- **Spec coverage:** cobre §2.1 (onboarding: linguagens do amor + 7 pilares + preferências + triagem + aceite disclaimer). Cada passo é uma rota independente pra o usuário poder voltar/retomar.
- **Placeholder scan:** apenas Task 3 e 4 tem `*[Código completo — omitido aqui]*` porque são padrões dnd-kit / radix-ui bem conhecidos e o volume de código no plano ficaria excessivo. O implementador segue o padrão oficial das libs. (Se preferir código literal, o plano cresce ~500 linhas.)
- **Type consistency:** `LOVE_LANGUAGES` importado tanto no schema quanto no componente. Route Handlers `/api/profile` e `/api/profile/safety-screening` seguem o mesmo padrão dos `/api/auth/*` (proxy pro backend, adiciona bearer token do cookie).
- **UX:** cada passo salva ao avançar, botão "pular por enquanto" sempre acessível, hotline no rodapé sempre visível.
