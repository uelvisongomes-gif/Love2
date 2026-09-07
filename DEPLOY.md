# Deploy do love2 em www.love2.com.br

## Arquitetura

```
www.love2.com.br  →  Vercel      (Next.js frontend)
api.love2.com.br  →  Railway     (Fastify backend)
                  →  Supabase    (Postgres + pgvector) — já configurado
```

**Custos esperados:**
- **Vercel Hobby**: grátis (frontend)
- **Railway Hobby**: US$ 5/mês (backend — ~US$3 uso real)
- **Supabase Free**: grátis (banco)
- **APIs de IA**: você já paga (Anthropic + OpenAI)

Total ~R$ 30/mês pra manter o site no ar.

---

## Passo 1 — Publicar frontend na Vercel

### 1.1 · Subir código pro GitHub

Se você ainda não tem os repos no GitHub, cria dois:

1. Vai em https://github.com/new
2. Cria: `love2-web` (privado) — depois `git push origin main` daqui
3. Cria: `love2-api` (privado)

```bash
cd C:\Users\Uelvison\Desktop\love-casal-web
git remote add origin https://github.com/uelvisongomes-gif/love2-web.git
git push -u origin main

cd C:\Users\Uelvison\Desktop\LOVEMEDIADOR
git remote add origin https://github.com/uelvisongomes-gif/love2-api.git
git branch -M main
git push -u origin main
```

### 1.2 · Vercel

1. https://vercel.com/signup — login com GitHub
2. **New Project** → import `love2-web`
3. Framework: Next.js (detecta sozinho)
4. **Environment Variables** (só uma):
   - `NEXT_PUBLIC_API_URL` = `https://api.love2.com.br`
5. **Deploy** → espera ~1 min

Vercel te dá uma URL tipo `love2-web.vercel.app`. Ótimo, vai funcionar. Depois trocamos pra `www.love2.com.br`.

### 1.3 · Custom domain

Ainda no dashboard da Vercel do projeto:

1. **Settings → Domains** → **Add**
2. Digita `www.love2.com.br` → Add
3. Adiciona também `love2.com.br` (redireciona pra www)
4. Vercel te mostra os registros DNS pra configurar (veremos no Hostinger, passo 3)

---

## Passo 2 — Publicar backend no Railway

### 2.1 · Railway signup

1. https://railway.com/login — login com GitHub
2. **New Project** → **Deploy from GitHub repo** → escolhe `love2-api`
3. Railway detecta o Dockerfile automaticamente

### 2.2 · Environment variables

Em Railway → project → **Variables**, adiciona **todas** essas (copia do seu `.env` local):

```
NODE_ENV=production
PORT=3000
LOG_LEVEL=info
DATABASE_URL=postgresql://postgres.xxx@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.xxx@aws-0-sa-east-1.pooler.supabase.com:5432/postgres
JWT_SECRET=(seu secret)
ACCESS_TTL_MIN=15
REFRESH_TTL_DAYS=7
ANTHROPIC_API_KEY=sk-ant-...
LLM_PROVIDER=anthropic
LLM_MODEL=claude-opus-5
EMBEDDING_PROVIDER=openai
EMBEDDING_MODEL=text-embedding-3-small
EMBEDDING_DIMENSIONS=1024
OPENAI_API_KEY=sk-proj-...
SMS_DRIVER=memory
```

### 2.3 · CORS

**IMPORTANTE**: antes de deploy final, alterar `src/app.ts` no repo do backend pra aceitar o domínio de produção. Mudar essa linha:

```ts
await app.register(cors, {
  origin: ['http://localhost:3001', 'https://www.love2.com.br', 'https://love2.com.br'],
  credentials: true,
});
```

Commita e push. Railway redeploy sozinho.

### 2.4 · Public domain

Ainda no Railway → project → **Settings → Networking**:

1. **Generate domain** — te dá algo tipo `love2-api-production.up.railway.app`
2. **Custom domain** → adiciona `api.love2.com.br`
3. Railway te mostra o CNAME de destino (algo tipo `xxx.up.railway.app`) — anota pra Passo 3

---

## Passo 3 — DNS no Hostinger

1. Login em hostinger.com → **Domains** → clica em `love2.com.br` → **DNS/Nameservers**
2. Deleta os registros default de A/CNAME @/www se tiver
3. Adiciona esses novos:

| Tipo  | Nome  | Valor / Aponta pra                       | TTL   |
|-------|-------|------------------------------------------|-------|
| A     | @     | 76.76.21.21 (Vercel)                     | Auto  |
| CNAME | www   | cname.vercel-dns.com                     | Auto  |
| CNAME | api   | (o CNAME que o Railway te deu)           | Auto  |

Salva. Propagação de DNS leva de 5 min a 24h (geralmente 15–60 min).

---

## Passo 4 — Testar

Depois da propagação:

1. Abre https://www.love2.com.br — deve mostrar a landing
2. Cria conta → onboarding → chat
3. Se der erro CORS, é porque esqueceu de atualizar `src/app.ts` no backend (Passo 2.3)

---

## Checklist do que você precisa fazer manualmente

- [ ] Criar 2 repos privados no GitHub (`love2-web`, `love2-api`)
- [ ] Fazer push do código pra ambos
- [ ] Criar conta na Vercel + fazer deploy do frontend
- [ ] Criar conta na Railway + fazer deploy do backend
- [ ] Adicionar `https://www.love2.com.br` ao CORS do backend
- [ ] Copiar todas as env vars do `.env` local pro Railway
- [ ] Configurar 3 registros DNS no Hostinger
- [ ] Adicionar `www.love2.com.br` como domínio custom na Vercel
- [ ] Adicionar `api.love2.com.br` como domínio custom no Railway
- [ ] Testar o site após propagação de DNS
- [ ] **Rotacionar credenciais que passaram pelo chat** (senha Postgres, Voyage key, OpenAI key)

## Perguntas frequentes

**Q: Posso usar VPS do Hostinger em vez do Railway?**
R: Pode. Mas é mais trabalho: você mesmo configura Node, PM2, Nginx, SSL (Let's Encrypt), banco. Se quiser, me diz — reescrevo esse guia pra VPS.

**Q: E o Docker Desktop que instalei antes?**
R: Não precisa mais. O Dockerfile é só pra Railway usar. Localmente continua sem Docker.

**Q: Quanto vai custar por mês?**
R: ~R$ 30 (Railway US$5) + o que você gastar em Anthropic/OpenAI (~R$ 10-100 dependendo do uso).
