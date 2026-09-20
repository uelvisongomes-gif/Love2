'use client';
import { useEffect, useState, useCallback } from 'react';
import { AppHeader } from '@/components/app-header';
import { apiClient } from '@/lib/api-client';
import {
  BookLock,
  Lock,
  Plus,
  Save,
  Trash2,
  X,
  Pencil,
  KeyRound,
  LogOut,
} from 'lucide-react';

interface Entry {
  id: string;
  title: string;
  content: string;
  category: string | null;
  createdAt: string;
}

interface Draft {
  id?: string;
  title: string;
  content: string;
  category: string;
}

const SESSION_KEY = 'historia_pin';

function getSessionPin(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return sessionStorage.getItem(SESSION_KEY);
  } catch {
    return null;
  }
}
function setSessionPin(pin: string | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (pin) sessionStorage.setItem(SESSION_KEY, pin);
    else sessionStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
}

export default function HistoriaPage(): React.ReactElement {
  const [phase, setPhase] = useState<'loading' | 'setup' | 'verify' | 'unlocked'>('loading');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [draft, setDraft] = useState<Draft | null>(null);

  const loadStatusAndAutoUnlock = useCallback(async (): Promise<void> => {
    try {
      const { hasPin } = await apiClient<{ hasPin: boolean }>('/api/history/status');
      if (!hasPin) {
        setPhase('setup');
        return;
      }
      const stored = getSessionPin();
      if (stored) {
        try {
          const res = await apiClient<{ items: Entry[] }>('/api/history/entries', {
            headers: { 'X-History-Pin': stored },
          });
          setEntries(res.items);
          setPhase('unlocked');
          return;
        } catch {
          setSessionPin(null);
        }
      }
      setPhase('verify');
    } catch {
      setPhase('verify');
    }
  }, []);

  useEffect(() => {
    void loadStatusAndAutoUnlock();
  }, [loadStatusAndAutoUnlock]);

  const setupPin = async (): Promise<void> => {
    setErr(null);
    if (!/^\d{4,8}$/.test(pin)) {
      setErr('PIN deve ter 4 a 8 dígitos');
      return;
    }
    if (pin !== confirmPin) {
      setErr('Os PINs não batem');
      return;
    }
    setBusy(true);
    try {
      await apiClient('/api/history/pin', { method: 'POST', body: JSON.stringify({ pin }) });
      setSessionPin(pin);
      const res = await apiClient<{ items: Entry[] }>('/api/history/entries', {
        headers: { 'X-History-Pin': pin },
      });
      setEntries(res.items);
      setPin('');
      setConfirmPin('');
      setPhase('unlocked');
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Erro ao criar PIN');
    } finally {
      setBusy(false);
    }
  };

  const verifyPin = async (): Promise<void> => {
    setErr(null);
    if (!/^\d{4,8}$/.test(pin)) {
      setErr('PIN inválido');
      return;
    }
    setBusy(true);
    try {
      await apiClient('/api/history/verify', { method: 'POST', body: JSON.stringify({ pin }) });
      setSessionPin(pin);
      const res = await apiClient<{ items: Entry[] }>('/api/history/entries', {
        headers: { 'X-History-Pin': pin },
      });
      setEntries(res.items);
      setPin('');
      setPhase('unlocked');
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'PIN incorreto');
    } finally {
      setBusy(false);
    }
  };

  const lock = (): void => {
    setSessionPin(null);
    setEntries([]);
    setDraft(null);
    setPhase('verify');
  };

  const saveEntry = async (): Promise<void> => {
    const p = getSessionPin();
    if (!p || !draft || !draft.title.trim() || !draft.content.trim()) return;
    setBusy(true);
    try {
      const body = {
        title: draft.title.trim(),
        content: draft.content.trim(),
        category: draft.category || null,
      };
      if (draft.id) {
        await apiClient(`/api/history/entries/${draft.id}`, {
          method: 'PATCH',
          headers: { 'X-History-Pin': p },
          body: JSON.stringify(body),
        });
      } else {
        await apiClient('/api/history/entries', {
          method: 'POST',
          headers: { 'X-History-Pin': p },
          body: JSON.stringify(body),
        });
      }
      const res = await apiClient<{ items: Entry[] }>('/api/history/entries', {
        headers: { 'X-History-Pin': p },
      });
      setEntries(res.items);
      setDraft(null);
    } finally {
      setBusy(false);
    }
  };

  const deleteEntry = async (id: string): Promise<void> => {
    const p = getSessionPin();
    if (!p) return;
    if (!confirm('Apagar esse registro?')) return;
    await apiClient(`/api/history/entries/${id}`, {
      method: 'DELETE',
      headers: { 'X-History-Pin': p },
    });
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  return (
    <div className="min-h-screen flex flex-col bg-bg">
      <AppHeader />
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 md:px-6 py-6 md:py-10">
        <header className="mb-6 flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-primary/10 text-primary flex items-center justify-center">
            <BookLock className="w-5 h-5" />
          </div>
          <div>
            <p className="type-eyebrow mb-0.5">— minha história</p>
            <h1 className="font-display text-2xl md:text-3xl text-heading tracking-tight">
              Só seu.
            </h1>
          </div>
        </header>

        {phase === 'loading' && <p className="text-sm text-muted">carregando…</p>}

        {phase === 'setup' && (
          <section className="rounded-2xl border border-rule bg-surface p-5 space-y-4">
            <div>
              <h2 className="font-display italic text-lg text-heading">Crie um PIN</h2>
              <p className="text-xs text-text/80 mt-1 leading-relaxed">
                4 a 8 dígitos, separado da sua senha da conta. Sem esse PIN, nem você acessa —
                então lembra dele.
              </p>
            </div>
            <PinInput value={pin} onChange={setPin} label="PIN novo" />
            <PinInput value={confirmPin} onChange={setConfirmPin} label="Confirme" />
            {err && <p className="text-xs text-danger">{err}</p>}
            <button
              type="button"
              onClick={() => void setupPin()}
              disabled={busy}
              className="w-full h-11 rounded-lg bg-primary text-[hsl(var(--primary-fg))] text-sm font-semibold hover:opacity-95 disabled:opacity-60"
            >
              {busy ? 'Criando…' : 'Criar PIN e abrir'}
            </button>
          </section>
        )}

        {phase === 'verify' && (
          <section className="rounded-2xl border border-rule bg-surface p-5 space-y-4">
            <div>
              <h2 className="font-display italic text-lg text-heading flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-primary" /> Digite seu PIN
              </h2>
              <p className="text-xs text-text/70 mt-1">5 tentativas erradas travam por 10 min.</p>
            </div>
            <PinInput
              value={pin}
              onChange={setPin}
              label="PIN"
              autoFocus
              onEnter={() => void verifyPin()}
            />
            {err && <p className="text-xs text-danger">{err}</p>}
            <button
              type="button"
              onClick={() => void verifyPin()}
              disabled={busy}
              className="w-full h-11 rounded-lg bg-primary text-[hsl(var(--primary-fg))] text-sm font-semibold hover:opacity-95 disabled:opacity-60"
            >
              {busy ? 'Verificando…' : 'Desbloquear'}
            </button>
          </section>
        )}

        {phase === 'unlocked' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-xs text-muted flex items-center gap-1">
                <Lock className="w-3 h-3 text-primary" />
                Desbloqueado — trancado quando você fechar a aba
              </p>
              <button
                type="button"
                onClick={lock}
                className="text-xs text-muted hover:text-danger inline-flex items-center gap-1"
              >
                <LogOut className="w-3 h-3" /> Trancar
              </button>
            </div>

            {!draft && (
              <button
                type="button"
                onClick={() =>
                  setDraft({ title: '', content: '', category: '' })
                }
                className="w-full flex items-center justify-center gap-2 h-11 rounded-lg border border-dashed border-primary/40 text-primary text-sm font-semibold hover:bg-primary/5"
              >
                <Plus className="w-4 h-4" /> Novo registro
              </button>
            )}

            {draft && (
              <section className="rounded-2xl border border-rule bg-surface p-5 space-y-3">
                <input
                  type="text"
                  value={draft.title}
                  onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                  placeholder="Título"
                  className="w-full h-10 px-3 rounded-lg border border-rule bg-bg text-sm"
                  autoFocus
                />
                <select
                  value={draft.category}
                  onChange={(e) => setDraft({ ...draft, category: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg border border-rule bg-bg text-sm"
                >
                  <option value="">Sem categoria</option>
                  <option value="ex-relacionamentos">Ex-relacionamentos</option>
                  <option value="familia">Família</option>
                  <option value="trabalho">Trabalho</option>
                  <option value="autoconhecimento">Autoconhecimento</option>
                  <option value="outro">Outro</option>
                </select>
                <textarea
                  value={draft.content}
                  onChange={(e) => setDraft({ ...draft, content: e.target.value })}
                  placeholder="Escreve. Só você vai ver."
                  className="w-full min-h-[180px] px-3 py-2 rounded-lg border border-rule bg-bg text-sm leading-relaxed resize-y"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setDraft(null)}
                    className="inline-flex items-center gap-1 h-9 px-3 rounded-lg text-sm text-muted hover:bg-bg"
                  >
                    <X className="w-3.5 h-3.5" /> Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => void saveEntry()}
                    disabled={busy || !draft.title.trim() || !draft.content.trim()}
                    className="inline-flex items-center gap-1 h-9 px-4 rounded-lg text-sm font-semibold bg-primary text-[hsl(var(--primary-fg))] disabled:opacity-40"
                  >
                    <Save className="w-3.5 h-3.5" /> Salvar
                  </button>
                </div>
              </section>
            )}

            <ul className="space-y-3">
              {entries.map((e) => (
                <li
                  key={e.id}
                  className="rounded-xl border border-rule bg-surface p-4"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display italic text-lg text-heading tracking-tight">
                        {e.title}
                      </h3>
                      <p className="text-[10px] uppercase tracking-wider font-semibold text-muted mt-0.5">
                        {new Date(e.createdAt).toLocaleDateString('pt-BR')}
                        {e.category && ` · ${e.category}`}
                      </p>
                    </div>
                    <div className="shrink-0 flex gap-1">
                      <button
                        type="button"
                        onClick={() =>
                          setDraft({
                            id: e.id,
                            title: e.title,
                            content: e.content,
                            category: e.category ?? '',
                          })
                        }
                        className="p-1.5 rounded hover:bg-bg text-muted hover:text-primary"
                        aria-label="Editar"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => void deleteEntry(e.id)}
                        className="p-1.5 rounded hover:bg-bg text-muted hover:text-danger"
                        aria-label="Apagar"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-text/90 whitespace-pre-wrap leading-relaxed">
                    {e.content}
                  </p>
                </li>
              ))}
              {entries.length === 0 && !draft && (
                <li className="text-sm text-muted text-center py-6">
                  Nenhum registro ainda. Toque em "novo registro" pra começar.
                </li>
              )}
            </ul>
          </div>
        )}
      </main>
    </div>
  );
}

function PinInput({
  value,
  onChange,
  label,
  autoFocus,
  onEnter,
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
  autoFocus?: boolean;
  onEnter?: () => void;
}): React.ReactElement {
  return (
    <label className="block">
      <span className="block text-[11px] uppercase tracking-wider font-semibold text-muted mb-1">
        {label}
      </span>
      <input
        type="password"
        inputMode="numeric"
        maxLength={8}
        pattern="\d*"
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D+/g, ''))}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && onEnter) onEnter();
        }}
        autoFocus={autoFocus}
        className="w-full h-11 px-3 rounded-lg border border-rule bg-bg text-base tracking-widest text-center focus:outline-none focus:ring-2 focus:ring-primary/30"
      />
    </label>
  );
}
