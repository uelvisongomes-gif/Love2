'use client';
import { useEffect, useState } from 'react';
import { Play, Square } from 'lucide-react';
import { RingsAvatar } from './rings-avatar';
import { speakText, stopSpeaking } from '@/lib/speech';

interface Citation {
  title: string;
  url: string;
}

interface Props {
  role: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
}

function AssistantMarkdown({ text }: { text: string }): React.ReactElement {
  const paragraphs = text.split(/\n{2,}/);
  return (
    <div className="space-y-3">
      {paragraphs.map((p, i) => (
        <p key={i} className="text-[15px] leading-relaxed text-text whitespace-pre-line">
          {renderInline(p)}
        </p>
      ))}
    </div>
  );
}

function renderInline(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  const regex = /\*\*([^*]+)\*\*|\[([^\]]+)\]\(([^)]+)\)/g;
  let lastIdx = 0;
  let m: RegExpExecArray | null;
  let key = 0;
  while ((m = regex.exec(text)) !== null) {
    if (m.index > lastIdx) parts.push(text.slice(lastIdx, m.index));
    if (m[1] !== undefined) {
      parts.push(
        <strong key={key++} className="text-heading font-semibold">
          {m[1]}
        </strong>,
      );
    } else if (m[2] && m[3]) {
      parts.push(
        <a
          key={key++}
          href={m[3]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline underline-offset-2"
        >
          {m[2]}
        </a>,
      );
    }
    lastIdx = m.index + m[0].length;
  }
  if (lastIdx < text.length) parts.push(text.slice(lastIdx));
  return parts.length ? parts : text;
}

function PlayButton({ text }: { text: string }): React.ReactElement | null {
  const [playing, setPlaying] = useState(false);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setSupported(true);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (playing) stopSpeaking();
    };
    // only cleanup on unmount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!supported) return null;

  const toggle = (): void => {
    if (playing) {
      stopSpeaking();
      setPlaying(false);
    } else {
      speakText(text, {
        onStart: () => setPlaying(true),
        onEnd: () => setPlaying(false),
      });
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={playing ? 'Parar áudio' : 'Ouvir mensagem'}
      title={playing ? 'Parar áudio' : 'Ouvir mensagem'}
      className={`inline-flex items-center gap-1.5 h-7 px-3 rounded-full text-[11px] font-semibold border transition-colors ${
        playing
          ? 'bg-primary text-[hsl(var(--primary-fg))] border-primary'
          : 'bg-bg text-primary border-primary/40 hover:bg-primary/10'
      }`}
    >
      {playing ? <Square className="w-3 h-3" /> : <Play className="w-3 h-3" />}
      <span>{playing ? 'Parar' : 'Ouvir'}</span>
    </button>
  );
}

export function ChatMessage({ role, content, citations }: Props): React.ReactElement {
  if (role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-2xl rounded-tr-md bg-primary text-[hsl(var(--primary-fg))] px-4 py-3 shadow-soft">
          <p className="text-[15px] leading-relaxed whitespace-pre-line font-medium">{content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3 items-start">
      <RingsAvatar size={36} />
      <div className="flex-1 min-w-0">
        <div className="font-display italic text-primary text-sm mb-1.5">LOVE</div>
        <div className="rounded-2xl rounded-tl-md bg-surface border border-rule px-4 py-3">
          <AssistantMarkdown text={content} />
          <div className="mt-3 flex items-center justify-between gap-3 flex-wrap">
            <PlayButton text={content} />
            {citations && citations.length > 0 && (
              <div className="text-[10px] uppercase tracking-wider text-muted font-semibold">
                {citations.length} {citations.length === 1 ? 'fonte' : 'fontes'}
              </div>
            )}
          </div>
          {citations && citations.length > 0 && (
            <div className="mt-3 pt-3 border-t border-rule space-y-1">
              <ul className="text-xs text-muted font-medium space-y-0.5">
                {citations.map((c) => (
                  <li key={c.url}>
                    <a
                      href={c.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-primary hover:underline underline-offset-2"
                    >
                      · {c.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function TypingIndicator(): React.ReactElement {
  return (
    <div className="flex gap-3 items-start">
      <RingsAvatar size={36} />
      <div className="flex-1">
        <div className="font-display italic text-primary text-sm mb-1.5">LOVE</div>
        <div className="inline-flex items-center gap-1.5 rounded-2xl rounded-tl-md bg-surface border border-rule px-4 py-3.5">
          <span className="w-1.5 h-1.5 rounded-full bg-muted animate-pulse [animation-delay:0ms]" />
          <span className="w-1.5 h-1.5 rounded-full bg-muted animate-pulse [animation-delay:150ms]" />
          <span className="w-1.5 h-1.5 rounded-full bg-muted animate-pulse [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
}
