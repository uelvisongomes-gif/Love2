'use client';
import { cn } from '@/lib/utils';

interface Props {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}

export function ToggleButton({ active, onClick, children, className }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'h-11 px-6 rounded-full font-semibold text-sm border transition-colors',
        active
          ? 'bg-primary text-[hsl(var(--primary-fg))] border-primary'
          : 'bg-bg text-text border-rule hover:bg-surface',
        className,
      )}
    >
      {children}
    </button>
  );
}
