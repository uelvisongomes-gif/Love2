interface Props {
  size?: number;
}

/** Small pair of interlocked wedding rings used as LOVE's chat avatar. */
export function RingsAvatar({ size = 32 }: Props) {
  return (
    <div
      className="flex items-center justify-center rounded-full bg-surface border border-rule shrink-0"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg width={size * 0.6} height={size * 0.35} viewBox="0 0 34 20" fill="none">
        <circle cx="10" cy="10" r="7" stroke="hsl(var(--rings-primary))" strokeWidth="1.6" />
        <circle cx="24" cy="10" r="7" stroke="hsl(var(--rings-secondary))" strokeWidth="1.6" fill="none" />
        <path d="M 15.5 4.5 A 7 7 0 0 1 17.5 10" stroke="hsl(var(--rings-primary))" strokeWidth="1.6" fill="none" />
      </svg>
    </div>
  );
}
