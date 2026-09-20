'use client';
import { useCallback, useEffect, useState } from 'react';
import { AppHeader } from '@/components/app-header';
import { apiClient } from '@/lib/api-client';
import { MessageSquare, Copy, Check, Unlink, RefreshCw, Phone, Send } from 'lucide-react';

interface Status {
  linked: boolean;
  phoneE164?: string;
  loveNumber: string | null;
}

interface CodeResponse {
  code?: string;
  expiresAt?: string;
  alreadyLinked?: boolean;
  phoneE164?: string;
}

export default function WhatsAppPage(): React.ReactElement {
  const [status, setStatus] = useState<Status | null>(null);
  const [code, setCode] = useState<{ value: string; expiresAt: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [copiedField, setCopiedField] = useState<'code' | 'number' | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async (): Promise<void> => {
    try {
      const s = await apiClient<Status>('/api/wame/status');
      setStatus(s);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const generateCode = async (): Promise<void> => {
    setBusy(true);
    setErr(null);
    try {
      const res = await apiClient<CodeResponse>('/api/wame/link', { method: 'POST' });
      if (res.alreadyLinked) {
        await load();
        return;
      }
      if (res.code && res.expiresAt) {
        setCode({ value: res.code, expiresAt: res.expiresAt });
      } else {
        setErr('Backend não retornou código. Resposta: ' + JSON.stringify(res).slice(0, 200));
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Erro ao gerar código');
    } finally {
      setBusy(false);
    }
  };

  const unlink = async (): Promise<void> => {
    if (!confirm('Desvincular seu WhatsApp? A LOVE não vai mais responder por lá até você vincular de novo.'))
      return;
    setBusy(true);
    try {
      await apiClient('/api/wame/link', { method: 'DELETE' });
      setCode(null);
      await load();
    } finally {
      setBusy(false);
    }
  };

  const copy = async (text: string, field: 'code' | 'number'): Promise<void> => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 1500);
    } catch {
      /* ignore */
    }
  };

  const formatNumber = (raw: string | null): string => {
    if (!raw) return '';
    // "+5511912345678" ou "5511912345678" → "+55 (11) 91234-5678"
    const digits = raw.replace(/\D+/g, '');
    if (digits.length >= 12) {
      return `+${digits.slice(0, 2)} (${digits.slice(2, 4)}) ${digits.slice(4, 9)}-${digits.slice(9)}`;
    }
    return raw;
  };

  return (
    <div className="min-h-screen flex flex-col bg-bg">
      <AppHeader />
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 md:px-6 py-6 md:py-10 space-y-5">
        <header className="mb-2 flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-green-500/15 text-green-600 dark:text-green-400 flex items-center justify-center">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <p className="type-eyebrow mb-0.5">— whatsapp</p>
            <h1 className="font-display text-2xl md:text-3xl text-heading tracking-tight">
              Conversar por lá.
            </h1>
          </div>
        </header>

        <p className="text-sm text-text/80 leading-relaxed">
          Adiciona a LOVE nos seus contatos e mande mensagem quando quiser — do próprio WhatsApp,
          sem abrir o app. Áudios são transcritos automaticamente. Suas conversas ficam salvas no
          histórico daqui também.
        </p>

        {loading && <p className="text-sm text-muted">carregando…</p>}

        {status && !loading && (
          <>
            {status.linked ? (
              <section className="rounded-2xl border border-green-500/30 bg-green-500/5 p-5">
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <h2 className="font-display italic text-lg text-heading">
                      Vinculado ✨
                    </h2>
                    <p className="text-sm text-text/80 mt-1">
                      Seu número{' '}
                      <span className="font-semibold">{formatNumber(status.phoneE164 ?? null)}</span>{' '}
                      já conversa com a LOVE pelo WhatsApp.
                    </p>
                    <button
                      type="button"
                      onClick={() => void unlink()}
                      disabled={busy}
                      className="mt-3 inline-flex items-center gap-1 text-xs text-muted hover:text-danger"
                    >
                      <Unlink className="w-3 h-3" /> Desvincular
                    </button>
                  </div>
                </div>
              </section>
            ) : (
              <section className="rounded-2xl border border-rule bg-surface p-5 space-y-5">
                {/* PASSO 1 */}
                <div>
                  <p className="type-eyebrow mb-1 not-italic text-[10px] uppercase tracking-wider font-semibold">
                    — passo 1
                  </p>
                  <h2 className="font-display italic text-lg text-heading mb-2">
                    Salve o número da LOVE
                  </h2>
                  {status.loveNumber ? (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-bg border border-rule">
                      <Phone className="w-4 h-4 text-primary shrink-0" />
                      <span className="font-mono text-sm flex-1 truncate">
                        {formatNumber(status.loveNumber)}
                      </span>
                      <button
                        type="button"
                        onClick={() => void copy(status.loveNumber!, 'number')}
                        className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                      >
                        {copiedField === 'number' ? (
                          <>
                            <Check className="w-3 h-3" /> Copiado
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" /> Copiar
                          </>
                        )}
                      </button>
                    </div>
                  ) : (
                    <p className="text-xs text-muted italic">
                      Número da LOVE ainda não configurado. Aguarde admin habilitar.
                    </p>
                  )}
                  <p className="text-xs text-text/70 mt-2 leading-relaxed">
                    Adicione esse número nos seus contatos como "LOVE" no celular.
                  </p>
                </div>

                {/* PASSO 2 */}
                <div>
                  <p className="type-eyebrow mb-1 not-italic text-[10px] uppercase tracking-wider font-semibold">
                    — passo 2
                  </p>
                  <h2 className="font-display italic text-lg text-heading mb-2">
                    Envie esse código pra ela pelo WhatsApp
                  </h2>

                  {!code ? (
                    <>
                      <button
                        type="button"
                        onClick={() => void generateCode()}
                        disabled={busy || !status.loveNumber}
                        className="w-full h-12 rounded-lg bg-primary text-[hsl(var(--primary-fg))] text-sm font-semibold hover:opacity-95 disabled:opacity-60 inline-flex items-center justify-center gap-2"
                      >
                        <RefreshCw className={`w-4 h-4 ${busy ? 'animate-spin' : ''}`} />
                        {busy ? 'Gerando…' : 'Gerar código de 6 dígitos'}
                      </button>
                      {err && (
                        <p className="mt-2 text-xs text-danger bg-danger/10 border border-danger/30 rounded-lg p-2">
                          {err}
                        </p>
                      )}
                    </>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-bg border border-primary/40">
                        <span className="font-mono text-2xl tracking-widest flex-1 text-center text-primary">
                          {code.value}
                        </span>
                        <button
                          type="button"
                          onClick={() => void copy(code.value, 'code')}
                          className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                        >
                          {copiedField === 'code' ? (
                            <>
                              <Check className="w-3 h-3" /> Copiado
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" /> Copiar
                            </>
                          )}
                        </button>
                      </div>
                      {status.loveNumber && (
                        <a
                          href={`https://wa.me/${status.loveNumber.replace(/\D+/g, '')}?text=${encodeURIComponent(code.value)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full h-12 rounded-lg bg-green-500 text-white text-sm font-semibold hover:bg-green-600 transition-colors inline-flex items-center justify-center gap-2"
                        >
                          <Send className="w-4 h-4" />
                          Enviar código no WhatsApp da LOVE2
                        </a>
                      )}
                      <p className="text-xs text-muted">
                        Vale por 10 min. Abra o WhatsApp, procure o contato LOVE e mande esse
                        código como primeira mensagem.
                      </p>
                      <button
                        type="button"
                        onClick={() => void load()}
                        className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                      >
                        <RefreshCw className="w-3 h-3" /> Já mandei — checar status
                      </button>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* FAQ */}
            <section className="rounded-xl border border-rule bg-surface/60 p-5 space-y-3 text-xs text-text/80 leading-relaxed">
              <p>
                <strong className="text-heading">Não paga nada extra pra você.</strong> Você usa seu WA
                normal, e a LOVE responde por ele mesmo.
              </p>
              <p>
                <strong className="text-heading">Áudio funciona.</strong> Manda áudio que a LOVE
                escuta e responde por texto. Se quiser resposta em voz, abre o app aqui.
              </p>
              <p>
                <strong className="text-heading">Suas conversas ficam salvas aqui também.</strong>{' '}
                Tudo alimenta o mesmo histórico da LOVE.
              </p>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
