import { RingsAvatar } from './rings-avatar';

interface Citation {
  title: string;
  url: string;
}

interface Props {
  role: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
}

/** Renders assistant content preserving paragraph breaks and simple emphasis. */
function AssistantMarkdown({ text }: { text: string }) {
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
  // Convert **bold** to <strong> and [text](url) to <a>
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

export function ChatMessage({ role, content, citations }: Props) {
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
          {citations && citations.length > 0 && (
            <div className="mt-4 pt-3 border-t border-rule space-y-1">
              <div className="text-[10px] uppercase tracking-wider text-muted font-semibold">
                Fontes citadas
              </div>
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

export function TypingIndicator() {
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
