'use client';
import { Suspense, useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Send } from 'lucide-react';
import { AppHeader } from '@/components/app-header';
import { ChatMessage, TypingIndicator } from '@/components/chat-message';
import { VoiceChat, DialogueToggleButton } from '@/components/voice-chat';
import { apiClient } from '@/lib/api-client';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: { title: string; url: string }[];
  proposedAgreement?: string;
}

type Context = 'general' | 'conflict' | 'check-in' | 'journal';

interface ChatResponse {
  reply: string;
  safety: { category: string };
  citations: { title: string; url: string }[];
  messageId: string;
  proposedAgreement?: string;
}

const CONTEXTS: { value: Context; label: string; description: string; intro: string }[] = [
  {
    value: 'general',
    label: 'Conversar',
    description: 'Um bate-papo pra pensar em voz alta.',
    intro: 'Fala do que quiser. Vou tentar te ajudar a pensar sobre isso, sem correr pra dar solução.',
  },
  {
    value: 'conflict',
    label: 'Tem conflito',
    description: 'Vocês brigaram ou estão prestes a.',
    intro: 'Vamos passar por etapas: 1) o que aconteceu, 2) o que você sentiu, 3) o que precisava, 4) como imagina que ele/ela viu, 5) um acordo prático.',
  },
  {
    value: 'check-in',
    label: 'Check-in',
    description: 'Como foi seu dia com ele/ela hoje?',
    intro: 'Rapidinho, uma coisa por vez: como tá a conexão, comunicação, carinho, divisão de tarefas e seu emocional hoje?',
  },
  {
    value: 'journal',
    label: 'Só desabafar',
    description: 'Isso fica só entre você e a LOVE.',
    intro: 'Sem conselho por enquanto. Fala o que tá pesando — eu escuto.',
  },
];

export default function ChatPage(): React.ReactElement {
  return (
    <Suspense fallback={<div className="min-h-screen bg-bg" />}>
      <ChatPageInner />
    </Suspense>
  );
}

function ChatPageInner(): React.ReactElement {
  const router = useRouter();
  const search = useSearchParams();
  const initial = (search.get('modo') as Context | null) ?? 'general';
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [context, setContext] = useState<Context>(
    ['general', 'conflict', 'check-in', 'journal'].includes(initial) ? initial : 'general',
  );
  const [sending, setSending] = useState(false);
  const [dialogueMode, setDialogueMode] = useState(false);
  const [lastAssistantSpeech, setLastAssistantSpeech] = useState<string | null>(null);
  const [agreementDraft, setAgreementDraft] = useState<{ title: string; content: string } | null>(null);
  const [savingAgreement, setSavingAgreement] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Scroll do container interno (quando há altura fixa) e também da janela (fallback)
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, sending]);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  // Refoca o textarea sempre que parar de enviar (mensagem enviada + resposta chegou)
  useEffect(() => {
    if (!sending) textareaRef.current?.focus();
  }, [sending]);

  // Carrega histórico do contexto ao entrar na tela ou trocar de modo
  useEffect(() => {
    let cancelled = false;
    (async (): Promise<void> => {
      try {
        const res = await apiClient<{
          messages: {
            id: string;
            role: 'user' | 'assistant';
            content: string;
            citations?: { title: string; url: string }[] | null;
          }[];
        }>(`/api/love/history?context=${encodeURIComponent(context)}&limit=50`);
        if (cancelled) return;
        setMessages(
          res.messages.map((m) => ({
            id: m.id,
            role: m.role,
            content: m.content,
            citations: m.citations ?? undefined,
          })),
        );
      } catch {
        // silencioso: se não tem histórico, começa vazio
        if (!cancelled) setMessages([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [context]);

  const sendContent = useCallback(
    async (content: string): Promise<void> => {
      if (!content || sending) return;

      const userMsg: Message = { id: `u-${Date.now()}`, role: 'user', content };
      setMessages((prev) => [...prev, userMsg]);
      setInput('');
      setSending(true);

      try {
        const res = await apiClient<ChatResponse>('/api/love/chat', {
          method: 'POST',
          body: JSON.stringify({ content, context }),
        });
        setMessages((prev) => [
          ...prev,
          {
            id: res.messageId,
            role: 'assistant',
            content: res.reply,
            citations: res.citations,
            proposedAgreement: res.proposedAgreement,
          },
        ]);
        setLastAssistantSpeech(res.reply);
      } catch (err) {
        const e = err as { code?: string; message?: string };
        if (e.code === 'CONSENT_REQUIRED') {
          toast.error('Você precisa completar o onboarding pra conversar com a LOVE.');
          router.push('/onboarding');
          return;
        }
        if (e.code === 'NO_COUPLE') {
          toast.error('Vincule um parceiro pra abrir conversa.');
        } else {
          toast.error(e.message || 'A LOVE não conseguiu responder agora.');
        }
        setMessages((prev) => prev.filter((m) => m.id !== userMsg.id));
        setInput(content);
      } finally {
        setSending(false);
      }
    },
    [context, router, sending],
  );

  async function onSend(e: FormEvent): Promise<void> {
    e.preventDefault();
    await sendContent(input.trim());
  }

  const onVoiceTranscript = useCallback(
    (text: string): void => {
      void sendContent(text);
    },
    [sendContent],
  );

  const onSaveAgreement = useCallback((content: string): void => {
    // Sugere um título curto pegando a primeira frase (até 80 chars)
    const firstSentence = content.split(/[.!?\n]/).find((s) => s.trim().length > 0) ?? '';
    const suggestedTitle = firstSentence.trim().slice(0, 80);
    setAgreementDraft({ title: suggestedTitle, content });
  }, []);

  async function submitAgreement(): Promise<void> {
    if (!agreementDraft) return;
    if (!agreementDraft.title.trim() || !agreementDraft.content.trim()) {
      toast.error('Preenche o título e o texto do acordo.');
      return;
    }
    setSavingAgreement(true);
    try {
      await apiClient('/api/agreements', {
        method: 'POST',
        body: JSON.stringify({
          title: agreementDraft.title.trim(),
          content: agreementDraft.content.trim(),
        }),
      });
      toast.success('Acordo salvo — vê em /acordos');
      setAgreementDraft(null);
    } catch (err) {
      toast.error((err as Error).message || 'Não consegui salvar o acordo.');
    } finally {
      setSavingAgreement(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const form = e.currentTarget.form;
      if (form) form.requestSubmit();
    }
  }

  const empty = messages.length === 0;

  return (
    <div className="h-[100dvh] flex flex-col bg-bg overflow-hidden">
      <AppHeader />

      <div className="flex-1 min-h-0 flex flex-col max-w-3xl w-full mx-auto px-4 md:px-6">
        {/* context switcher */}
        <div className="pt-6 pb-2 flex flex-wrap gap-2">
          {CONTEXTS.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => setContext(c.value)}
              disabled={sending}
              className={`h-9 px-4 rounded-full text-xs font-semibold uppercase tracking-wider border transition-colors ${
                context === c.value
                  ? 'bg-primary text-[hsl(var(--primary-fg))] border-primary'
                  : 'bg-bg text-text border-rule hover:bg-surface'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
        {!empty && (
          <p className="text-[11px] text-muted font-medium mb-2 flex items-center gap-2">
            <span>
              Modo <span className="text-primary font-semibold">{CONTEXTS.find((c) => c.value === context)!.label}</span> ativo
            </span>
            <span className="inline-flex items-center h-4 px-1.5 rounded-full text-[9px] uppercase tracking-wider font-semibold border border-muted/40 text-muted">
              🔒 só você
            </span>
          </p>
        )}

        {/* messages */}
        <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto py-4 space-y-6">
          {empty && <EmptyState contextData={CONTEXTS.find((c) => c.value === context)!} />}
          {messages.map((m) => (
            <ChatMessage
              key={m.id}
              role={m.role}
              content={m.content}
              citations={m.citations}
              showSaveAgreement={
                m.role === 'assistant' && context === 'conflict' && !!m.proposedAgreement
              }
              onSaveAgreement={() => onSaveAgreement(m.proposedAgreement!)}
            />
          ))}
          {sending && <TypingIndicator />}
          <div ref={bottomRef} aria-hidden />
        </div>

        {/* input */}
        <form
          onSubmit={onSend}
          className="sticky bottom-0 bg-bg pt-3 pb-4 border-t border-rule"
        >
          <div className="flex items-end gap-2">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Conta o que aconteceu ou clica no microfone..."
              rows={2}
              disabled={sending}
              className="flex-1 resize-none rounded-2xl border border-rule bg-bg px-4 py-3 text-[15px] leading-relaxed text-text placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg font-medium max-h-40"
              maxLength={4000}
            />
            <VoiceChat
              onTranscript={onVoiceTranscript}
              isSending={sending}
              ttsText={lastAssistantSpeech}
              dialogueMode={dialogueMode}
              onToggleDialogueMode={() => setDialogueMode((v) => !v)}
              hideDialogueButton
              size="sm"
            />
            <div className="flex flex-col gap-1.5">
              <DialogueToggleButton
                dialogueMode={dialogueMode}
                onToggle={() => setDialogueMode((v) => !v)}
                size="sm"
              />
              <button
                type="submit"
                disabled={!input.trim() || sending}
                className="h-9 w-9 shrink-0 rounded-full bg-primary text-[hsl(var(--primary-fg))] flex items-center justify-center hover:bg-primary/90 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                aria-label="Enviar"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </form>
      </div>

      {agreementDraft && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="bg-bg rounded-2xl border border-rule max-w-xl w-full p-6 shadow-lg">
            <p className="type-eyebrow mb-2">— novo acordo</p>
            <h2 className="font-display text-2xl text-heading tracking-tight mb-4">Salvar acordo</h2>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1">Título curto</label>
            <input
              type="text"
              value={agreementDraft.title}
              onChange={(e) => setAgreementDraft({ ...agreementDraft, title: e.target.value })}
              maxLength={200}
              className="w-full h-10 rounded-lg border border-rule bg-bg px-3 text-sm text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring mb-4"
              placeholder="Ex: pausar quando ficar intenso"
            />
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1">Texto do acordo</label>
            <textarea
              value={agreementDraft.content}
              onChange={(e) => setAgreementDraft({ ...agreementDraft, content: e.target.value })}
              maxLength={4000}
              rows={5}
              className="w-full resize-none rounded-lg border border-rule bg-bg p-3 text-sm text-text leading-relaxed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring mb-5"
            />
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setAgreementDraft(null)}
                disabled={savingAgreement}
                className="h-10 px-4 rounded-full text-sm font-semibold text-text hover:bg-surface transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={submitAgreement}
                disabled={savingAgreement}
                className="h-10 px-5 rounded-full text-sm font-semibold bg-primary text-[hsl(var(--primary-fg))] hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                {savingAgreement ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function EmptyState({
  contextData,
}: {
  contextData: { label: string; description: string; intro: string };
}): React.ReactElement {
  return (
    <div className="py-10 text-center max-w-md mx-auto space-y-4">
      <p className="type-eyebrow">— modo {contextData.label.toLowerCase()}</p>
      <h2 className="font-display text-3xl text-heading tracking-tight">
        {contextData.description}
      </h2>
      <p className="text-text font-medium leading-relaxed">{contextData.intro}</p>
      <p className="text-xs text-muted font-medium pt-2 max-w-sm mx-auto">
        Sou a LOVE — mediadora, não psicóloga nem terapeuta.
      </p>
    </div>
  );
}
