# LOVE Casal Web — Foundation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bootstrap the LOVE Casal web app (Next.js 15 + TypeScript + Tailwind + shadcn/ui + React Query). Ship landing page, register, login, logout, protected-route middleware, and a placeholder `/home` page — the base every future feature plugs into.

**Architecture:** Next.js App Router. All API traffic goes through `src/lib/api-client.ts` (a thin `fetch` wrapper that adds the JWT bearer token from an httpOnly cookie). Server-side data reads happen in Server Components / Route Handlers when possible; client mutations go through React Query. Auth tokens live in httpOnly cookies set by Next.js Route Handlers (`/api/auth/login`, `/api/auth/logout`) that proxy to the backend and translate its JSON response into cookies — the browser never sees the raw token. A single `middleware.ts` at the repo root redirects unauthenticated users away from protected paths.

**Tech Stack:** Next.js 15 (App Router), TypeScript strict, Tailwind CSS, shadcn/ui, TanStack Query 5, react-hook-form, zod, sonner (toasts), lucide-react (icons).

**Spec:** N/A (frontend has no separate spec doc — the backend spec at `C:\Users\Uelvison\Desktop\LOVEMEDIADOR\docs\superpowers\specs\2026-09-05-love-casal-design.md` is the product source of truth; this plan translates it into the web surface, one feature area per plan).

**Backend expectation:** The backend at `C:\Users\Uelvison\Desktop\LOVEMEDIADOR` on branch `foundation` running at `http://localhost:3000`. **Backend needs one prerequisite change**: install `@fastify/cors` and register it (see Prerequisites below). Frontend will run at `http://localhost:3001` to avoid the port clash.

## Global Constraints

- **TypeScript strict.** No `any` in app code.
- **Node >= 20.**
- **Never store secrets in code or in the client bundle.** Backend URL is `NEXT_PUBLIC_API_URL` (safe to expose — just an endpoint); auth tokens live in httpOnly cookies set by Next.js Route Handlers, never in localStorage.
- **All user-facing text in pt-BR.** Error messages, button labels, form validation copy.
- **Every form uses react-hook-form + zod resolver.** Server errors from the backend surface through the same error boundary as client validation.
- **Responsive:** every screen works down to 375px width (iPhone SE).
- **Accessibility:** all interactive elements keyboard-navigable, form labels associated, contrast AA.
- **Loading + error states:** every async operation has a loading indicator and a visible error path (toast + inline).

## Prerequisites (backend change)

Before Task 1, run this on the backend repo (`C:\Users\Uelvison\Desktop\LOVEMEDIADOR`):

```bash
npm install @fastify/cors
```

Then in `src/app.ts`, add near the top of `buildApp`:

```ts
import cors from '@fastify/cors';
// ...
  await app.register(cors, {
    origin: ['http://localhost:3001'],
    credentials: true,
  });
```

Commit that change on the backend before moving on. Without CORS, the browser will refuse every cross-origin request from the frontend.

---

### Task 1: Project scaffold — Next.js + Tailwind + shadcn/ui + base layout

**Files:**
- Create: entire project via `create-next-app`, then `package.json` (tweaked), `tailwind.config.ts`, `postcss.config.mjs`, `src/app/layout.tsx`, `src/app/page.tsx` (landing), `src/app/globals.css`, `src/lib/utils.ts`, `.env.local.example`, `README.md`, `.gitignore`
- Initialize shadcn/ui with `button`, `input`, `label`, `card`, `form`, `sonner` (toast)

**Interfaces:**
- Produces:
  - Working Next.js app at `http://localhost:3001` with landing page
  - Global font, colors, `<Toaster />` in root layout
  - `cn()` utility for merging Tailwind classes

- [ ] **Step 1: Scaffold Next.js**

Run in the empty `LOVE-Casal-Web` directory:
```
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --no-turbopack --use-npm
```
Answer prompts if any (defaults). Delete the generated placeholder content in `src/app/page.tsx` — we'll write our own.

- [ ] **Step 2: Change dev port to 3001**

Edit `package.json` scripts:
```json
"dev": "next dev -p 3001",
```

- [ ] **Step 3: Add core dependencies**

```
npm install @tanstack/react-query react-hook-form @hookform/resolvers zod sonner lucide-react class-variance-authority clsx tailwind-merge
```

- [ ] **Step 4: Initialize shadcn/ui**

```
npx shadcn@latest init
```
Answer:
- Style: `Default`
- Base color: `Neutral`
- CSS variables: `Yes`

Then add base components:
```
npx shadcn@latest add button input label card form sonner
```

- [ ] **Step 5: Create `src/lib/utils.ts` (if not created by shadcn)**

Verify shadcn created it; if not:
```ts
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 6: Write `src/app/layout.tsx`**

```tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';
import { QueryProvider } from '@/lib/query-provider';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'LOVE Casal',
  description: 'Mediadora do casamento — comunicação, conexão, cuidado.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        <QueryProvider>
          {children}
          <Toaster position="top-center" richColors />
        </QueryProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 7: Create `src/lib/query-provider.tsx`**

```tsx
'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';

export function QueryProvider({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 30_000, refetchOnWindowFocus: false, retry: 1 },
        },
      }),
  );
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
```

- [ ] **Step 8: Write the landing page `src/app/page.tsx`**

```tsx
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <header className="w-full px-6 py-4 flex justify-between items-center border-b">
        <h1 className="text-xl font-semibold tracking-tight">LOVE Casal</h1>
        <div className="flex gap-2">
          <Button asChild variant="ghost">
            <Link href="/entrar">Entrar</Link>
          </Button>
          <Button asChild>
            <Link href="/registrar">Criar conta</Link>
          </Button>
        </div>
      </header>

      <section className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="max-w-2xl text-center space-y-6">
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">
            Uma mediadora para o seu relacionamento.
          </h2>
          <p className="text-lg text-muted-foreground">
            LOVE ajuda você e seu parceiro a se comunicarem melhor — com escuta, sem julgamento e com base em métodos reconhecidos. Ela não é psicóloga nem terapeuta.
          </p>
          <div className="flex gap-3 justify-center pt-4">
            <Button asChild size="lg">
              <Link href="/registrar">Começar</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/entrar">Já tenho conta</Link>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground pt-8">
            Se você estiver em situação de violência, procure ajuda:{' '}
            <strong>Ligue 180</strong> ou <strong>CVV 188</strong>.
          </p>
        </div>
      </section>

      <footer className="border-t px-6 py-4 text-center text-sm text-muted-foreground">
        LOVE Casal © 2026
      </footer>
    </main>
  );
}
```

- [ ] **Step 9: Create `.env.local.example` and `.env.local`**

`.env.local.example`:
```
NEXT_PUBLIC_API_URL=http://localhost:3000
```

Copy to `.env.local`. Verify `.gitignore` (created by Next.js) already excludes `.env*.local`.

- [ ] **Step 10: Add README and gitignore polish**

`README.md`:
```md
# LOVE Casal — Web

Next.js frontend for the LOVE Casal backend.

## Development

```
npm install
cp .env.local.example .env.local
# backend must be running at http://localhost:3000
npm run dev
```

Open http://localhost:3001.

## Backend

Backend repo: adjacent `LOVEMEDIADOR/` folder. Run `npm run dev` there first.
```

- [ ] **Step 11: Run the dev server and verify**

Run: `npm run dev`
Open http://localhost:3001 — should see the landing page. Ctrl+C to stop.

- [ ] **Step 12: Commit**

```bash
git add .
git commit -m "chore: scaffold Next.js + Tailwind + shadcn/ui + React Query + landing page"
```

---

### Task 2: API client + auth Route Handlers (register/login/logout as Next.js proxies)

**Files:**
- Create: `src/lib/api-client.ts`, `src/lib/schemas.ts`, `src/app/api/auth/login/route.ts`, `src/app/api/auth/register/route.ts`, `src/app/api/auth/logout/route.ts`, `src/app/api/auth/me/route.ts`

**Interfaces:**
- Produces:
  - `api()` — server-side fetch wrapper that reads the JWT from httpOnly cookies (`next/headers`) and adds the bearer header.
  - `apiClient()` — browser-side fetch wrapper for React Query mutations (uses `credentials: 'include'` to send cookies; talks to our own Next.js Route Handlers, not directly to the backend).
  - `/api/auth/register` proxies to backend `POST /auth/register`.
  - `/api/auth/login` proxies to backend `POST /auth/login`, then sets `access_token` httpOnly cookie.
  - `/api/auth/logout` clears the cookie.
  - `/api/auth/me` returns basic profile info (checks a token exists via cookie; used to bootstrap client state).

- [ ] **Step 1: Create `src/lib/api-client.ts`**

```ts
import { cookies } from 'next/headers';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';
const COOKIE_NAME = 'access_token';

export interface ApiError extends Error {
  status: number;
  code?: string;
}

function toApiError(status: number, body: unknown, fallback: string): ApiError {
  const b = body as { error?: { code?: string; message?: string } } | undefined;
  const message = b?.error?.message ?? fallback;
  const err = new Error(message) as ApiError;
  err.status = status;
  err.code = b?.error?.code;
  return err;
}

/** Server-side: reads httpOnly cookie via next/headers. */
export async function api<T = unknown>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  const headers = new Headers(init.headers);
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  const res = await fetch(BASE_URL + path, { ...init, headers, cache: 'no-store' });
  const contentType = res.headers.get('content-type') ?? '';
  const body: unknown = contentType.includes('application/json') ? await res.json() : await res.text();
  if (!res.ok) throw toApiError(res.status, body, 'Erro ao chamar a API');
  return body as T;
}

/** Browser-side: talks to our OWN /api/* Route Handlers (so cookies flow correctly). */
export async function apiClient<T = unknown>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  const res = await fetch(path, { ...init, headers, credentials: 'include' });
  const contentType = res.headers.get('content-type') ?? '';
  const body: unknown = contentType.includes('application/json') ? await res.json() : await res.text();
  if (!res.ok) throw toApiError(res.status, body, 'Erro na requisição');
  return body as T;
}
```

- [ ] **Step 2: Create `src/lib/schemas.ts`** (shared client + server input schemas)

```ts
import { z } from 'zod';

export const registerInput = z
  .object({
    name: z.string().min(2, 'nome muito curto').max(80),
    email: z.string().email('e-mail inválido').toLowerCase(),
    phone: z.string().regex(/^\+[1-9]\d{7,14}$/, 'telefone em formato internacional, ex: +5511999999999'),
    password: z
      .string()
      .min(10, 'senha precisa ter ao menos 10 caracteres')
      .regex(/[A-Z]/, 'inclua uma letra maiúscula')
      .regex(/[a-z]/, 'inclua uma letra minúscula')
      .regex(/\d/, 'inclua um número'),
  });
export type RegisterInput = z.infer<typeof registerInput>;

export const loginInput = z.object({
  email: z.string().email('e-mail inválido').toLowerCase(),
  password: z.string().min(1, 'senha obrigatória'),
});
export type LoginInput = z.infer<typeof loginInput>;
```

- [ ] **Step 3: Create `src/app/api/auth/register/route.ts`**

```ts
import { NextResponse } from 'next/server';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

export async function POST(req: Request): Promise<Response> {
  const body = await req.json();
  const res = await fetch(BASE_URL + '/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  return NextResponse.json(json, { status: res.status });
}
```

- [ ] **Step 4: Create `src/app/api/auth/login/route.ts`**

```ts
import { NextResponse } from 'next/server';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';
const COOKIE_NAME = 'access_token';
const REFRESH_COOKIE = 'refresh_token';

export async function POST(req: Request): Promise<Response> {
  const body = await req.json();
  const res = await fetch(BASE_URL + '/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) return NextResponse.json(json, { status: res.status });

  const response = NextResponse.json({ ok: true });
  const isProd = process.env.NODE_ENV === 'production';
  response.cookies.set(COOKIE_NAME, json.accessToken as string, {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProd,
    path: '/',
    maxAge: 15 * 60,
  });
  response.cookies.set(REFRESH_COOKIE, json.refreshToken as string, {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProd,
    path: '/',
    maxAge: 7 * 24 * 60 * 60,
  });
  return response;
}
```

- [ ] **Step 5: Create `src/app/api/auth/logout/route.ts`**

```ts
import { NextResponse } from 'next/server';

export async function POST(): Promise<Response> {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete('access_token');
  response.cookies.delete('refresh_token');
  return response;
}
```

- [ ] **Step 6: Create `src/app/api/auth/me/route.ts`**

```ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(): Promise<Response> {
  const store = await cookies();
  const token = store.get('access_token')?.value;
  if (!token) return NextResponse.json({ authenticated: false }, { status: 401 });
  // Real profile fetch happens in later plans (needs backend /me endpoint).
  return NextResponse.json({ authenticated: true });
}
```

- [ ] **Step 7: Manual smoke test**

Start backend (`cd ../LOVEMEDIADOR && npm run dev` in another terminal). In this repo:
```
npm run dev
```

In a third terminal:
```bash
curl -i -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Teste","email":"t@x.com","phone":"+5511900000900","password":"SenhaForte123"}'
```
Expected: 201.

```bash
curl -i -c /tmp/cookies.txt -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"t@x.com","password":"SenhaForte123"}'
```
Expected: 200 + `Set-Cookie: access_token=...`

```bash
curl -i -b /tmp/cookies.txt http://localhost:3001/api/auth/me
```
Expected: 200 `{"authenticated":true}`

- [ ] **Step 8: Commit**

```bash
git add src/app/api src/lib
git commit -m "feat(auth): API client + register/login/logout proxy routes with httpOnly cookies"
```

---

### Task 3: Register + Login pages (forms with react-hook-form + zod)

**Files:**
- Create: `src/app/registrar/page.tsx`, `src/app/entrar/page.tsx`

**Interfaces:**
- Produces:
  - `/registrar` form: name / email / phone / password → POST /api/auth/register → on success, auto-login and redirect to `/onboarding`.
  - `/entrar` form: email / password → POST /api/auth/login → redirect to `/home`.
  - Both handle backend errors (409 EMAIL_TAKEN, 401 INVALID_CREDENTIALS) and show them inline or via toast.

- [ ] **Step 1: Create `src/app/registrar/page.tsx`**

```tsx
'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { registerInput, type RegisterInput } from '@/lib/schemas';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function RegisterPage() {
  const router = useRouter();
  const { register, handleSubmit, formState } = useForm<RegisterInput>({
    resolver: zodResolver(registerInput),
    defaultValues: { name: '', email: '', phone: '', password: '' },
  });

  async function onSubmit(values: RegisterInput) {
    try {
      await apiClient('/api/auth/register', { method: 'POST', body: JSON.stringify(values) });
      // Auto-login right after registering
      await apiClient('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: values.email, password: values.password }),
      });
      toast.success('Conta criada! Vamos preparar seu perfil.');
      router.push('/onboarding');
    } catch (err) {
      const e = err as { code?: string; message?: string };
      if (e.code === 'EMAIL_TAKEN') toast.error('Este e-mail já está cadastrado.');
      else if (e.code === 'PHONE_TAKEN') toast.error('Este telefone já está cadastrado.');
      else toast.error(e.message ?? 'Erro ao criar conta.');
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Criar sua conta</CardTitle>
          <CardDescription>Vai levar 1 minuto.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" {...register('name')} autoComplete="name" />
              {formState.errors.name && (
                <p className="text-sm text-destructive">{formState.errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" {...register('email')} autoComplete="email" />
              {formState.errors.email && (
                <p className="text-sm text-destructive">{formState.errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone (com DDI)</Label>
              <Input id="phone" placeholder="+5511999999999" {...register('phone')} autoComplete="tel" />
              {formState.errors.phone && (
                <p className="text-sm text-destructive">{formState.errors.phone.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input id="password" type="password" {...register('password')} autoComplete="new-password" />
              {formState.errors.password && (
                <p className="text-sm text-destructive">{formState.errors.password.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={formState.isSubmitting}>
              {formState.isSubmitting ? 'Criando...' : 'Criar conta'}
            </Button>
            <p className="text-sm text-center text-muted-foreground">
              Já tem conta?{' '}
              <Link href="/entrar" className="text-primary hover:underline">
                Entrar
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
```

- [ ] **Step 2: Create `src/app/entrar/page.tsx`**

```tsx
'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { loginInput, type LoginInput } from '@/lib/schemas';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function LoginPage() {
  const router = useRouter();
  const { register, handleSubmit, formState } = useForm<LoginInput>({
    resolver: zodResolver(loginInput),
    defaultValues: { email: '', password: '' },
  });

  async function onSubmit(values: LoginInput) {
    try {
      await apiClient('/api/auth/login', { method: 'POST', body: JSON.stringify(values) });
      toast.success('Bem-vinda(o) de volta.');
      router.push('/home');
    } catch (err) {
      const e = err as { code?: string; message?: string };
      if (e.code === 'INVALID_CREDENTIALS') toast.error('E-mail ou senha inválidos.');
      else toast.error(e.message ?? 'Erro ao entrar.');
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Entrar</CardTitle>
          <CardDescription>Use o e-mail que você cadastrou.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" {...register('email')} autoComplete="email" />
              {formState.errors.email && (
                <p className="text-sm text-destructive">{formState.errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input id="password" type="password" {...register('password')} autoComplete="current-password" />
              {formState.errors.password && (
                <p className="text-sm text-destructive">{formState.errors.password.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={formState.isSubmitting}>
              {formState.isSubmitting ? 'Entrando...' : 'Entrar'}
            </Button>
            <p className="text-sm text-center text-muted-foreground">
              Não tem conta ainda?{' '}
              <Link href="/registrar" className="text-primary hover:underline">
                Criar conta
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
```

- [ ] **Step 3: Manual smoke test**

`npm run dev` (backend also running). In browser:
- Open http://localhost:3001/registrar
- Register with a fresh email — expect redirect to `/onboarding` (which returns 404 for now)
- Open http://localhost:3001/entrar — enter same credentials — expect redirect to `/home` (also 404 for now)

- [ ] **Step 4: Commit**

```bash
git add src/app/registrar src/app/entrar
git commit -m "feat(auth): register + login pages with react-hook-form + zod validation"
```

---

### Task 4: Middleware — protect authenticated routes

**Files:**
- Create: `src/middleware.ts`

**Interfaces:**
- Produces:
  - Any request to a path in the PROTECTED_PATHS list is redirected to `/entrar` when there is no `access_token` cookie.
  - Any request to `/entrar` or `/registrar` when already authenticated redirects to `/home`.

- [ ] **Step 1: Create `src/middleware.ts`**

```ts
import { NextResponse, type NextRequest } from 'next/server';

const PROTECTED_PREFIXES = [
  '/home',
  '/chat',
  '/conflitos',
  '/checkin',
  '/journal',
  '/tarefas',
  '/parceiro',
  '/perfil',
  '/onboarding',
];
const AUTH_PAGES = ['/entrar', '/registrar'];

export function middleware(req: NextRequest): NextResponse | undefined {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get('access_token')?.value;

  const isProtected = PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(p + '/'),
  );
  const isAuthPage = AUTH_PAGES.includes(pathname);

  if (isProtected && !token) {
    const url = req.nextUrl.clone();
    url.pathname = '/entrar';
    return NextResponse.redirect(url);
  }
  if (isAuthPage && token) {
    const url = req.nextUrl.clone();
    url.pathname = '/home';
    return NextResponse.redirect(url);
  }
}

export const config = {
  // Skip static files, API routes, and Next.js internals
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

- [ ] **Step 2: Manual smoke test**

- Open http://localhost:3001/home in a fresh tab (no cookie) → should redirect to `/entrar`
- Log in → should land on `/home` (404 page for now)
- Open http://localhost:3001/entrar with cookie set → should redirect to `/home`

- [ ] **Step 3: Commit**

```bash
git add src/middleware.ts
git commit -m "feat(auth): middleware — redirect unauthenticated → /entrar and authenticated → /home"
```

---

### Task 5: Header nav + placeholder `/home` + logout button

**Files:**
- Create: `src/app/home/page.tsx`, `src/app/home/layout.tsx`, `src/components/app-header.tsx`, `src/components/logout-button.tsx`

**Interfaces:**
- Produces:
  - `/home` renders a placeholder dashboard with a header showing the app name and the logout button.
  - Every authenticated page nests under `src/app/home/layout.tsx` pattern — Task 5 introduces the shell.
  - `<LogoutButton />` calls `/api/auth/logout` and pushes `/entrar`.

- [ ] **Step 1: Create `src/components/logout-button.tsx`**

```tsx
'use client';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';

export function LogoutButton() {
  const router = useRouter();
  async function onClick() {
    await apiClient('/api/auth/logout', { method: 'POST' });
    router.push('/entrar');
    router.refresh();
  }
  return (
    <Button variant="ghost" size="sm" onClick={onClick}>
      <LogOut className="w-4 h-4 mr-2" />
      Sair
    </Button>
  );
}
```

- [ ] **Step 2: Create `src/components/app-header.tsx`**

```tsx
import Link from 'next/link';
import { LogoutButton } from './logout-button';

export function AppHeader() {
  return (
    <header className="w-full px-6 py-3 flex justify-between items-center border-b bg-background">
      <Link href="/home" className="text-lg font-semibold tracking-tight">
        LOVE Casal
      </Link>
      <LogoutButton />
    </header>
  );
}
```

- [ ] **Step 3: Create `src/app/home/layout.tsx`**

```tsx
import { AppHeader } from '@/components/app-header';

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />
      <div className="flex-1">{children}</div>
    </div>
  );
}
```

- [ ] **Step 4: Create `src/app/home/page.tsx`**

```tsx
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
```

- [ ] **Step 5: Manual smoke test**

- Login → land on `/home` → see header with logout button
- Click Sair → returns to `/entrar`
- Refresh `/home` while logged out → redirects to `/entrar`

- [ ] **Step 6: Commit**

```bash
git add src/app/home src/components
git commit -m "feat(shell): /home placeholder + header nav + logout button"
```

---

## Self-Review Notes

- **Backend prerequisite is out-of-repo:** the CORS install is a change to `LOVEMEDIADOR`, not to this repo. Flagged prominently at the top so an implementer doesn't miss it.
- **Placeholder scan:** no TBDs. Every code block is literal.
- **Type consistency:** `apiClient` (browser) vs `api` (server) are two clearly-scoped functions with the same error shape (`ApiError` with `status` + `code`). Register + Login pages share the same `registerInput` / `loginInput` schemas from `src/lib/schemas.ts`; the same file will be extended by later plans as new endpoints are wrapped.
- **Auth model:** tokens live only in httpOnly cookies set by our own Route Handlers — the browser never sees the raw JWT. Middleware guards on the presence of the cookie (not on validity) — that's fine because expired tokens fail on the next API call and get refreshed (refresh logic lands in a later plan).
- **What's out of scope:** onboarding UI (Plan 2), chat with LOVE (Plan 3), ponte (Plan 4), tasks/health/partner/profile (Plan 5). Refresh-token rotation lands in Plan 2 alongside the first authenticated data fetch.
