'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Check, Copy, HeartHandshake, Mail, UserPlus } from 'lucide-react';
import { AppHeader } from '@/components/app-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiClient } from '@/lib/api-client';

interface CoupleStatus {
  couple: { id: string; partnerId: string; partnerName: string } | null;
}

type Mode = 'menu' | 'invite' | 'accept';

export default function ParceiroPage() {
  const [status, setStatus] = useState<CoupleStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<Mode>('menu');

  useEffect(() => {
    apiClient<CoupleStatus>('/api/couples/me')
      .then((s) => setStatus(s))
      .catch(() => setStatus({ couple: null }))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-bg">
      <AppHeader />
      <main className="flex-1 max-w-xl w-full mx-auto px-6 py-12">
        <div className="mb-8">
          <p className="type-eyebrow mb-3">— seu vínculo</p>
          <h1 className="font-display text-4xl text-heading tracking-tight">
            Seu <em className="text-primary italic">par</em>.
          </h1>
          <p className="mt-3 text-text font-medium leading-relaxed">
            Vincular o parceiro ativa a ponte — o fluxo em que a LOVE conversa com cada um em separado e ajuda vocês a se entenderem.
          </p>
        </div>

        {loading ? (
          <div className="text-sm text-muted font-medium">Carregando...</div>
        ) : status?.couple ? (
          <ConnectedState partnerName={status.couple.partnerName} />
        ) : mode === 'menu' ? (
          <MenuState onInvite={() => setMode('invite')} onAccept={() => setMode('accept')} />
        ) : mode === 'invite' ? (
          <InviteForm onBack={() => setMode('menu')} />
        ) : (
          <AcceptForm
            onBack={() => setMode('menu')}
            onSuccess={() => {
              setMode('menu');
              setLoading(true);
              apiClient<CoupleStatus>('/api/couples/me')
                .then((s) => setStatus(s))
                .finally(() => setLoading(false));
            }}
          />
        )}
      </main>
    </div>
  );
}

function ConnectedState({ partnerName }: { partnerName: string }) {
  return (
    <div className="rounded-lg border border-primary/40 bg-surface p-6 space-y-4">
      <div className="flex items-center gap-3 text-primary">
        <HeartHandshake className="w-6 h-6" />
        <h2 className="font-display italic text-2xl">Vocês estão vinculados</h2>
      </div>
      <p className="text-text font-medium">
        Seu par no love2 é <strong className="text-heading">{partnerName}</strong>. A ponte está ativa — você pode abrir um conflito e a LOVE cuida do resto.
      </p>
      <div className="pt-2">
        <Link href="/home" className="text-primary hover:underline text-sm font-semibold">
          ← Voltar pro início
        </Link>
      </div>
    </div>
  );
}

function MenuState({ onInvite, onAccept }: { onInvite: () => void; onAccept: () => void }) {
  return (
    <div className="grid gap-4">
      <button
        type="button"
        onClick={onInvite}
        className="text-left rounded-lg border border-rule bg-bg hover:border-primary/50 hover:bg-surface transition-colors p-5"
      >
        <div className="flex items-center gap-2 text-primary mb-2">
          <UserPlus className="w-5 h-5" />
          <span className="font-display italic text-xl tracking-tight">Convidar meu parceiro</span>
        </div>
        <p className="text-sm text-text font-medium">Gero um código que você compartilha — ele/ela cola aqui do outro lado.</p>
      </button>

      <button
        type="button"
        onClick={onAccept}
        className="text-left rounded-lg border border-rule bg-bg hover:border-primary/50 hover:bg-surface transition-colors p-5"
      >
        <div className="flex items-center gap-2 text-primary mb-2">
          <Mail className="w-5 h-5" />
          <span className="font-display italic text-xl tracking-tight">Recebi um convite</span>
        </div>
        <p className="text-sm text-text font-medium">Cola o código de 8 caracteres que seu parceiro te mandou.</p>
      </button>
    </div>
  );
}

function InviteForm({ onBack }: { onBack: () => void }) {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || submitting) return;
    setSubmitting(true);
    try {
      const res = await apiClient<{ inviteId: string; code: string }>('/api/couples/invite', {
        method: 'POST',
        body: JSON.stringify({ inviteeEmail: email.trim().toLowerCase() }),
      });
      setCode(res.code);
    } catch (err) {
      const e = err as { code?: string; message?: string };
      if (e.code === 'SELF_INVITE') toast.error('Não dá pra se convidar.');
      else if (e.code === 'ALREADY_IN_COUPLE') toast.error('Você já está vinculado a alguém.');
      else toast.error(e.message || 'Não consegui gerar o convite.');
    } finally {
      setSubmitting(false);
    }
  }

  async function onCopy() {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error('Copia manualmente.');
    }
  }

  if (code) {
    return (
      <div className="space-y-6">
        <div className="rounded-lg border border-primary/40 bg-surface p-6 text-center space-y-4">
          <p className="text-sm text-text font-semibold">Manda esse código pro seu parceiro:</p>
          <div className="font-display italic text-primary text-5xl tracking-wider select-all">
            {code}
          </div>
          <p className="text-xs text-muted font-medium">Ele expira em 7 dias. Ele/ela cola em "Recebi um convite".</p>
          <button
            type="button"
            onClick={onCopy}
            className="inline-flex items-center gap-2 rounded-full bg-bg border border-rule px-4 h-10 text-sm font-semibold text-heading hover:bg-surface transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copiado!' : 'Copiar código'}
          </button>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="text-sm text-muted hover:text-heading font-semibold"
        >
          ← Voltar
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="email">E-mail do seu parceiro</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="parceiro@email.com"
          autoComplete="off"
        />
        <p className="text-xs text-muted font-medium">
          Precisa ser o mesmo e-mail que ele/ela vai usar pra criar conta aqui.
        </p>
      </div>
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="text-sm text-muted hover:text-heading font-semibold"
        >
          ← Voltar
        </button>
        <Button type="submit" size="lg" disabled={submitting || !email.trim()}>
          {submitting ? 'Gerando...' : 'Gerar convite'}
        </Button>
      </div>
    </form>
  );
}

function AcceptForm({ onBack, onSuccess }: { onBack: () => void; onSuccess: () => void }) {
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = code.trim().toUpperCase();
    if (!trimmed || submitting) return;
    setSubmitting(true);
    try {
      await apiClient('/api/couples/accept', {
        method: 'POST',
        body: JSON.stringify({ code: trimmed }),
      });
      toast.success('Vinculados!');
      onSuccess();
    } catch (err) {
      const e = err as { code?: string; message?: string };
      if (e.code === 'INVITE_NOT_FOUND') toast.error('Código inválido ou expirado.');
      else if (e.code === 'INVITE_FOR_OTHER') toast.error('Esse convite é pra outro e-mail.');
      else if (e.code === 'ALREADY_IN_COUPLE') toast.error('Você já está vinculado.');
      else if (e.code === 'SELF_INVITE') toast.error('Esse convite é seu.');
      else toast.error(e.message || 'Não consegui aceitar o convite.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="code">Código do convite</Label>
        <Input
          id="code"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="ABCD1234"
          maxLength={8}
          autoComplete="off"
          className="font-display italic text-2xl tracking-widest text-center uppercase"
        />
        <p className="text-xs text-muted font-medium">8 caracteres, letras e números.</p>
      </div>
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="text-sm text-muted hover:text-heading font-semibold"
        >
          ← Voltar
        </button>
        <Button type="submit" size="lg" disabled={submitting || code.trim().length !== 8}>
          {submitting ? 'Aceitando...' : 'Aceitar convite'}
        </Button>
      </div>
    </form>
  );
}
