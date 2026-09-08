'use client';
import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Send } from 'lucide-react';
import { AppHeader } from '@/components/app-header';
import { ChatMessage, TypingIndicator } from '@/components/chat-message';
import { VoiceChat } from '@/components/voice-chat';
import { apiClient } from '@/lib/api-client';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: { title: string; url: string }[];
}

type Context = 'general' | 'conflict' | 'check-in' | 'journal';

interface ChatResponse {
  reply: string;
  safety: { category: string };
  citations: { title: string; url: string }[];
  messageId: string;
}

const CONTEXTS: { value: Context; label: string; description: string }[] = [
  { value: 'general', label: 'Conversar', description: 'Um bate-papo pra pensar em voz alta.' },
  { value: 'conflict', label: 'Tem conflito', description: 'Vocês brigaram ou estão prestes a.' },
  { value: 'check-in', label: 'Check-in', description: 'Como foi seu dia com ele/ela hoje?' },
  { value: 'journal', label: 'Só desabafar', description: 'Isso fica só entre você e a LOVE.' },
];

export default function ChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [context, setContext] = useState<Context>('general');
  const [sending, setSending] = useState(false);
  const [dialogueMode, setDialogueMode] = useState(false);
  const [lastAssistantSpeech, setLastAssistantSpeech] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, sending]);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

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

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const form = e.currentTarget.form;
      if (form) form.requestSubmit();
    }
  }

  const empty = messages.length === 0;

  return (
    <div className="min-h-screen flex flex-col bg-bg">
      <AppHeader />

      <div className="flex-1 flex flex-col max-w-3xl w-full mx-auto px-4 md:px-6">
        {/* context switcher */}
        <div className="pt-6 pb-4 flex flex-wrap gap-2">
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

        {/* messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto py-4 space-y-6">
          {empty && <EmptyState contextDescription={CONTEXTS.find((c) => c.value === context)!.description} />}
          {messages.map((m) => (
            <ChatMessage key={m.id} role={m.role} content={m.content} citations={m.citations} />
          ))}
          {sending && <TypingIndicator />}
        </div>

        {/* input */}
        <form
          onSubmit={onSend}
          className="sticky bottom-0 bg-bg pt-3 pb-4 border-t border-rule"
        >
          <div className="flex items-end gap-3">
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
            />
            <button
              type="submit"
              disabled={!input.trim() || sending}
              className="h-11 w-11 shrink-0 rounded-full bg-primary text-[hsl(var(--primary-fg))] flex items-center justify-center hover:bg-primary/90 disabled:opacity-40 disabled:pointer-events-none transition-colors"
              aria-label="Enviar"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <div className="mt-2 flex justify-between text-[11px] text-muted font-medium">
            <span>
              {dialogueMode
                ? '📻 Modo diálogo — fala e a LOVE responde por voz'
                : '🎤 pra falar · 📻 pra modo diálogo por voz contínuo'}
            </span>
            <Link href="/home" className="hover:text-heading">← Início</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

function EmptyState({ contextDescription }: { contextDescription: string }) {
  return (
    <div className="py-16 text-center max-w-md mx-auto space-y-4">
      <p className="type-eyebrow">— pronta pra ouvir</p>
      <h2 className="font-display text-3xl text-heading tracking-tight">
        Me conta o que <em className="text-primary italic">aconteceu</em>.
      </h2>
      <p className="text-text font-medium">{contextDescription}</p>
      <p className="text-xs text-muted font-medium pt-4 max-w-sm mx-auto">
        Sou a LOVE — mediadora, não psicóloga nem terapeuta. Não julgo, não decido por vocês. Quando cito dados, mostro a fonte.
      </p>
    </div>
  );
}
