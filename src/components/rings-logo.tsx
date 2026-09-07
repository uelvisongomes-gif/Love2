interface Props {
  size?: number;
  className?: string;
}

/** Two interlocked wedding rings — the love2 mark.
 *  Colors come from CSS tokens so it adapts to light/dark automatically. */
export function RingsLogo({ size = 34, className }: Props) {
  const height = Math.round((size * 20) / 34);
  return (
    <svg
      width={size}
      height={height}
      viewBox="0 0 34 20"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <circle cx="10" cy="10" r="7.5" stroke="hsl(var(--rings-primary))" strokeWidth="1.8" />
      <circle cx="24" cy="10" r="7.5" stroke="hsl(var(--rings-secondary))" strokeWidth="1.8" fill="none" />
      <path d="M 15.5 4.5 A 7.5 7.5 0 0 1 17.5 10" stroke="hsl(var(--rings-primary))" strokeWidth="1.8" fill="none" />
    </svg>
  );
}
